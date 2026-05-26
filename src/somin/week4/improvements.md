# 5주차 소민 코드 개선 과제 리뷰

1~4주차 리뷰/study에서 지적한 개선사항을 4주차 컴포넌트에 적용한 결과물 기준으로,
런타임 영향이 있거나 미완 상태인 부분만 정리합니다.

버그보다 UX/디자인 디테일 위주입니다.

## 1. handleRefreshAll의 fetchCount<=0 - 안내 메시지 없이 "완료!" 표시

```
const handleRefreshAll = () => {
  lastActionRef.current = handleRefreshAll;
  runFetchAction(async (signal, isLatest) => {
    const myCards = membersList.filter((m) => m.isMe);
    const fetchCount = membersList.length - myCards.length;
    if (fetchCount <= 0) return;        // 아무 처리 없이 return
    ...
  });
};
```

- 본인 카드만 남은 경우 runFetchAction이 정상 종료되어 페이지 상단에 "완료!"가 표시됩니다.
- 사용자는 실제 새로고침할 게 없는데 "완료!"가 떠서 헷갈릴 수 있음.

### 해결

- handleRefreshAll에서 fetchCount<=0이면 runFetchAction을 호출하지 말고, 안내 메시지를 직접 띄움

```
const handleRefreshAll = () => {
  const myCards = membersList.filter((m) => m.isMe);
  const fetchCount = membersList.length - myCards.length;

  if (fetchCount <= 0) {
    setAsyncStatus("idle");
    setAsyncMsg("새로고침할 랜덤 멤버가 없습니다.");
    scheduleStatusReset();   // 1.5초 후 "준비 완료"로 복귀
    return;
  }

  lastActionRef.current = handleRefreshAll;
  runFetchAction(async (signal, isLatest) => {
    const users = await fetchRandomUsers(fetchCount, signal);
    if (!isLatest()) return;
    const newMembers = users.map((u) => transformUser(u, makeNextId()));
    setMembersList([...myCards, ...newMembers]);
  });
};
```

## 2. handleSubmit의 폼 검증 실패 시 자동 idle 복귀 없음

```
if (!newMember.name || !newMember.role) {
  setAsyncStatus("fail");
  setAsyncMsg("이름과 파트는 필수 항목입니다.");
  return;
}
```

- HTML `required` 속성으로 이미 막혀 있어 거의 도달 안 하지만, 도달했을 때 "이름과 파트는 필수 항목입니다." 메시지가 영구적으로 남습니다.
- 폼 검증 실패는 페이지 상단 fetch 상태가 아니라 폼 안에 보여주는 게 더 자연스러움.

### 해결 - 폼 안에 inline 에러 표시

```
const [formError, setFormError] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();
  const skills = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const id = makeNextId();
  const newMember = {
    id,
    name: formData.name.trim(),
    role: formData.part,
    ...
  };

  if (!newMember.name || !newMember.role) {
    setFormError("이름과 파트는 필수 항목입니다.");
    return;
  }

  setFormError("");
  setMembersList((prev) => [...prev, newMember]);
  setFormData(EMPTY_FORM);
  setIsFormOpen(false);
};

// 폼 안에 표시
{formError && <p className={styles.formError}>{formError}</p>}
```

이렇게 분리하면 fetch 상태(asyncStatus/asyncMsg)와 폼 검증 상태가 섞이지 않습니다.

## 3. handleRandomFill이 페이지 메인 status를 공유

```
const handleRandomFill = () => {
  runFetchAction(async (signal, isLatest) => {
    const [raw] = await fetchRandomUsers(1, signal);
    if (!isLatest()) return;
    setFormData({...});
  });
};
```

- 폼 안에서 "랜덤 값 채우기"를 누르면 페이지 상단 fetch 상태 영역에 "불러오는 중..."이 표시됩니다.
- 사용자 입장에서는 폼 안 작업인지 페이지 작업인지 구분이 안 됨.
- 또한 폼 안 fetch가 진행 중일 때 다른 fetch(handleAddRandom 등)와 controller가 겹쳐서 abort될 수 있음.

### 해결 - 폼 전용 상태와 controller 분리

```
const [isFilling, setIsFilling] = useState(false);
const [fillError, setFillError] = useState("");
const fillControllerRef = useRef(null);

const handleRandomFill = async () => {
  if (fillControllerRef.current) fillControllerRef.current.abort();
  const controller = new AbortController();
  fillControllerRef.current = controller;

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  setIsFilling(true);
  setFillError("");

  try {
    const [raw] = await fetchRandomUsers(1, controller.signal);
    clearTimeout(timeoutId);
    setFormData({
      name: `${raw.name.first} ${raw.name.last}`,
      ...
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" && timedOut) {
      setFillError("시간 초과");
      return;
    }
    if (err.name === "AbortError") return;
    setFillError(err.message);
  } finally {
    setIsFilling(false);
  }
};
```

- useEffect cleanup에도 fillControllerRef abort 추가

```
useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    if (focusResetTimerRef.current) clearTimeout(focusResetTimerRef.current);
    if (latestControllerRef.current) latestControllerRef.current.abort();
    if (fillControllerRef.current) fillControllerRef.current.abort();
  };
}, []);
```

- 폼 안에 isFilling/fillError 표시

```
<button type="button" onClick={handleRandomFill} disabled={isFilling} className={styles.btn}>
  {isFilling ? "불러오는 중..." : "랜덤 값 채우기"}
</button>
{fillError && <span className={styles.formError}>{fillError}</span>}
```

## 4. fail 상태가 영구 표시됨

```
const scheduleStatusReset = () => {
  if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
  statusResetTimerRef.current = setTimeout(() => {
    setAsyncStatus("idle");
    setAsyncMsg("준비 완료");
  }, 1500);
};

// runFetchAction의 try 안에서만 호출
setAsyncStatus("success");
setAsyncMsg("완료!");
scheduleStatusReset();

// catch에서는 호출 안 함
setAsyncStatus("fail");
setAsyncMsg(`불러오기 실패: ${err.message}`);
// scheduleStatusReset 없음 - 영구 표시
```

- 사용자가 직접 "재시도"를 누르거나 다른 액션을 할 때까지 fail 메시지가 그대로 남습니다.
- 의도가 "사용자가 재시도 결정을 할 수 있도록 fail 상태를 유지"라면 OK.
- 다만 success는 1.5초 후 사라지는데 fail은 안 사라지는 것이 비대칭적입니다.

### 해결 - 의도가 fail 유지라면 그대로 두기

(별도 수정 불필요)

### 해결 - 일정 시간 후 reset이 더 자연스럽다면

```
} catch (err) {
  clearTimeout(timeoutId);
  if (requestId !== latestRequestIdRef.current) return;

  if (err.name === "AbortError") {
    if (timedOut) {
      setAsyncStatus("fail");
      setAsyncMsg("불러오기 실패: 시간 초과");
      scheduleStatusReset();   // 추가
    }
    return;
  }
  setAsyncStatus("fail");
  setAsyncMsg(`불러오기 실패: ${err.message}`);
  scheduleStatusReset();   // 추가
}
```

- 다만 이 경우 "재시도" 버튼도 1.5초 후 사라지게 되므로, 재시도 버튼을 fail 상태에만 표시하는 현재 UI와 충돌. 둘 중 하나만 유지.

## 5. isMe 카드 시각 강조가 약함

```
.myCard {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
}
```

- shadow만 진해지는 정도라서 카드 그리드 안에서 본인 카드 식별이 어려움.

### 해결 - 보더 추가 또는 색상 강조

```
.myCard {
  border: 3px solid navy;
  box-shadow: 0 4px 16px rgba(0, 51, 100, 0.25);
  transform: translateY(-2px);
}
```

또는 본인 카드에만 다른 배경색.

```
.myCard {
  background-color: #f0f5ff;
  border: 2px solid #003364;
}
```

## 6. CSS 색상 하드코딩 - 디자인 토큰 미사용

```
color: navy;
color: blue;
color: green;
color: red;
color: pink;
background: skyblue;
background: white;
border-color: #003364;
```

- 1주차 리뷰에서 지적한 "디자인 토큰 사용"이 부분적으로만 적용됨.
- 다른 폴더는 `var(--color-primary)` 등을 쓰지만 소민 코드는 직접 색상 이름/HEX 혼용.

### 해결

- `src/styles/globals.css`의 디자인 토큰을 활용

```
.end {
  color: var(--color-primary);
}

.contact ul li a {
  color: var(--color-primary);
}

.btn {
  background: var(--color-primary);
}

.focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-soft);
}
```

- 한 번 토큰화하면 디자인 변경 시 한 곳만 수정하면 됨.

## 7. runFetchAction의 actionFn 시그니처 - 두 인자 패턴

```
await actionFn(controller.signal, () => requestId === latestRequestIdRef.current);
```

- signal과 isLatest 두 인자를 위치로 받습니다.
- 동작은 문제 없지만 인자가 추가될 때마다 호출부와 정의부의 순서를 맞춰야 함.

### 해결 - 객체로 묶기 (선택사항)

```
await actionFn({
  signal: controller.signal,
  isLatest: () => requestId === latestRequestIdRef.current,
});

// 사용
runFetchAction(async (ctx) => {
  const users = await fetchRandomUsers(count, ctx.signal);
  if (!ctx.isLatest()) return;
  ...
});
```

- 정답 코드(c:/tmp/week4-answer/Page.jsx)도 같은 ctx 객체 패턴 사용.
- 가독성이 좋아지지만 큰 차이는 아닙니다.

## 8. CSS의 `.name`과 `.end`가 SummaryCard / DetailCard 양쪽에서 공유

```
// SummaryCard
<p className={styles.name}>{member.name}</p>
<p className={styles.end}>{member.role}</p>

// DetailCard
<p className={styles.name}>{member.name}</p>
<p className={styles.end}>{member.role}</p>
```

- 두 컴포넌트가 같은 `.name`, `.end` 클래스를 사용합니다.
- 상세 카드의 이름/파트 스타일을 따로 조정하고 싶을 때 충돌이 생깁니다.

### 해결 - 컴포넌트별로 분리

```
/* CSS */
.cardName { font-size: 23px; font-weight: 700; margin-top: 4px; }
.cardRole { font-size: 14px; font-weight: 600; color: blue; }
.detailName { font-size: 28px; font-weight: 700; }
.detailRole { font-size: 16px; font-weight: 600; color: var(--color-primary); }

// SummaryCard
<p className={styles.cardName}>{member.name}</p>
<p className={styles.cardRole}>{member.role}</p>

// DetailCard
<p className={styles.detailName}>{member.name}</p>
<p className={styles.detailRole}>{member.role}</p>
```

- 향후 스타일 변경 시 다른 카드에 영향이 가지 않음.
