# 4주차 학습 가이드 - 비동기 안전성과 일관된 데이터 모델

이 문서는 review.md에서 지적한 비동기 안전성, id/timestamp 통일, controlled form 전환을 더 깊게 설명합니다.

## 1. AbortController + latestRequestId - race condition 차단

### Promise chain 버전

```
const latestControllerRef = useRef(null);
const latestRequestIdRef = useRef(0);

const fetchRandomMembers = (count, mode) => {
  const requestId = ++latestRequestIdRef.current;
  lastRequestRef.current = () => fetchRandomMembers(count, mode);

  // 이전 요청 취소
  if (latestControllerRef.current) {
    try { latestControllerRef.current.abort(); } catch (_) {}
  }
  const controller = new AbortController();
  latestControllerRef.current = controller;

  setIsLoading(true);
  setHasError(false);
  setStatusText("불러오는 중...");

  fetch(API_URL + count, { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (requestId !== latestRequestIdRef.current) return;
      const randomMembers = data.results.map((u, i) => makeRandomMember(u, i));
      setMemberList((prev) =>
        mode === "replace" ? randomMembers : [...prev, ...randomMembers]
      );
      setStatusText("완료!");
    })
    .catch((err) => {
      if (requestId !== latestRequestIdRef.current) return;
      if (err.name === "AbortError") return;
      setHasError(true);
      setStatusText("불러오기 실패: " + err.message);
    })
    .finally(() => {
      if (requestId !== latestRequestIdRef.current) return;
      setIsLoading(false);
    });
};
```

### 두 안전망이 모두 필요한 이유

- `AbortController`는 fetch가 await에서 멈춰있을 때만 효과가 있습니다.
- `res.json()` 파싱이나 setState 직전에 새 요청이 시작되면 abort가 늦을 수 있습니다.
- `latestRequestId` 비교는 "응답이 setState에 도달하기 직전에" 한 번 더 검사하는 두 번째 안전망입니다.

## 2. 타임아웃

```
const TIMEOUT_MS = 5000;
let timedOut = false;

const timeoutId = setTimeout(() => {
  timedOut = true;
  controller.abort();
}, TIMEOUT_MS);

fetch(url, { signal: controller.signal })
  .then((res) => {
    clearTimeout(timeoutId);
    return res.json();
  })
  .catch((err) => {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" && timedOut) {
      setStatusText("불러오기 실패: 시간 초과");
      setHasError(true);
      return;
    }
    if (err.name === "AbortError") return; // 사용자 취소
    setHasError(true);
    setStatusText("불러오기 실패: " + err.message);
  });
```

`timedOut` 플래그로 "사용자 취소(다음 요청 시작 시)"와 "타임아웃"을 구별합니다.

## 3. unmount cleanup

```
useEffect(() => {
  return () => {
    if (latestControllerRef.current) {
      try { latestControllerRef.current.abort(); } catch (_) {}
    }
  };
}, []);
```

- useEffect의 return 함수는 컴포넌트 unmount 시점에 실행됩니다.
- 진행 중인 fetch를 abort해 unmounted setState 경고를 막습니다.

## 4. 본인 카드(isMe) 보존하는 전체 새로고침

### 동적 count 계산

```
const handleRefreshAll = () => {
  const myCards = memberList.filter((m) => m.isMe);
  const fetchCount = memberList.length - myCards.length;

  if (fetchCount <= 0) return; // 새로 가져올 게 없으면 종료

  fetchRandomMembers(fetchCount, "replace", myCards);
};
```

### 함수 시그니처 확장

```
const fetchRandomMembers = (count, mode, preservedCards = []) => {
  ...
  .then((data) => {
    const randomMembers = data.results.map((u, i) => makeRandomMember(u, i));
    if (mode === "replace") {
      setMemberList([...preservedCards, ...randomMembers]);
    } else {
      setMemberList((prev) => [...prev, ...randomMembers]);
    }
  });
};
```

- "전체 새로고침" 버튼 → `handleRefreshAll()`로 분리
- "랜덤 N명 추가" → 기존처럼 `fetchRandomMembers(N, "add")`

이렇게 분리하면 "새로고침"의 의미와 동작이 명확해집니다.

## 5. id와 timestamp 통일 - useRef 카운터

### 문제

```
// makeLocalMember
createdAt: index,        // 0, 1, 2, ..., 7

// makeRandomMember
createdAt: Date.now() + index,  // 1700000000000+

// handleSubmit
createdAt: Date.now(),
```

createdAt의 스케일이 섞여 있어 "최신추가순" 정렬 시 initialMembers는 항상 맨 아래로 갑니다.

### 해결: 통일된 카운터

```
const nextOrderRef = useRef(0);

function makeNextOrder() {
  const order = nextOrderRef.current;
  nextOrderRef.current += 1;
  return order;
}

// 초기 데이터 - 컴포넌트 첫 렌더에서 한 번 부여
const [memberList, setMemberList] = useState(() =>
  members.map((m) => makeLocalMember(m, makeNextOrder()))
);

function makeLocalMember(member, order) {
  return {
    ...member,
    id: `local-${order}-${member.name}`,
    createdAt: order,
  };
}

function makeRandomMember(user, order) {
  return {
    id: user.login.uuid,
    name: user.name.first + " " + user.name.last,
    ...,
    createdAt: order,
  };
}

// 사용
const randomMembers = data.results.map((u) => makeRandomMember(u, makeNextOrder()));
```

장점:

- 모든 멤버의 createdAt이 같은 스케일(단조 증가 정수).
- 정렬 결과가 직관적: 큰 값이 더 최근.
- 시간(Date.now()) 대신 카운터를 쓰니 동시 호출 충돌 없음.

### useState의 lazy initializer

```
useState(() =>
  members.map((m) => makeLocalMember(m, makeNextOrder()))
)
```

- `useState(initialValue)`는 매 렌더마다 initialValue 계산 (성능 낭비)
- `useState(() => initialValue)`는 첫 렌더에만 한 번 계산
- 위 코드처럼 `useRef`로 부수효과를 만드는 경우 lazy initializer 패턴이 필수

## 6. uncontrolled → controlled form

### 지금 (uncontrolled)

```
<form ref={formRef} onSubmit={handleSubmit}>
  <input name="name" required />
  ...
</form>

const handleSubmit = (e) => {
  const fd = new FormData(e.target);
  const name = fd.get("name").trim();
  ...
};

const fillRandomForm = () => {
  const form = formRef.current;
  form.name.value = randomMember.name;
  form.role.value = randomMember.role;
  ...
};
```

특징:

- 입력값은 DOM에 저장 (브라우저 관리)
- 외부에서 값 설정 시 DOM 직접 조작 필요

### controlled

```
const EMPTY_FORM = {
  name: "", role: "Frontend", badge: "", intro: "",
  description: "", email: "", phone: "", website: "",
  comment: "", image: "",
};

const [formData, setFormData] = useState(EMPTY_FORM);

const handleInput = (field) => (e) => {
  setFormData((prev) => ({ ...prev, [field]: e.target.value }));
};

<input
  name="name"
  value={formData.name}
  onChange={handleInput("name")}
  required
/>

const handleSubmit = (e) => {
  e.preventDefault();
  const newMember = {
    ...formData,
    id: makeNextCustomId(),
    createdAt: makeNextOrder(),
    club: "LION TRACK",
    isMe: false,
    image: formData.image.trim() ||
      `https://picsum.photos/seed/${Date.now()}/400/300`,
  };
  setMemberList((prev) => [...prev, newMember]);
  setFormData(EMPTY_FORM);
  setShowForm(false);
};

const fillRandomForm = () => {
  fetch(API_URL + 1)
    .then((res) => res.json())
    .then((data) => {
      const randomMember = makeRandomMember(data.results[0], makeNextOrder());
      setFormData({
        name: randomMember.name,
        role: randomMember.role,
        badge: randomMember.badge,
        intro: randomMember.intro,
        description: randomMember.description,
        email: randomMember.email,
        phone: randomMember.phone,
        website: randomMember.website,
        comment: randomMember.comment,
        image: randomMember.image,
      });
    });
};
```

장점:

- setState 한 번이면 모든 input이 자동 갱신.
- 폼 값을 항상 알 수 있어 실시간 검증/미리보기/자동저장이 쉬움.
- React 단일 진실 공급원(single source of truth) 원칙을 따름.

## 7. 폼 안의 fetch 상태 분리

```
const [isFilling, setIsFilling] = useState(false);
const [fillError, setFillError] = useState("");

const fillRandomForm = () => {
  setIsFilling(true);
  setFillError("");

  fetch(API_URL + 1)
    .then(...)
    .then((data) => {
      setFormData({...});
    })
    .catch((err) => {
      setFillError(err.message);
    })
    .finally(() => {
      setIsFilling(false);
    });
};

<div className={styles.formButtons}>
  <button
    type="button"
    onClick={fillRandomForm}
    disabled={isFilling}
  >
    {isFilling ? "불러오는 중..." : "랜덤 값 채우기"}
  </button>
  {fillError && <span className={styles.errorMsg}>{fillError}</span>}
  <button type="submit">추가하기</button>
  <button type="button" onClick={() => setShowForm(false)}>취소</button>
</div>
```

- 메인 페이지의 `statusText`/`hasError`와 폼 안의 `isFilling`/`fillError`를 분리.
- 사용자가 어떤 작업의 결과인지 명확하게 구분할 수 있음.

## 8. useMemo 사용에 대한 보충

```
const visibleMembers = useMemo(() => {
  let result = [...memberList];
  if (partFilter !== "ALL") result = result.filter(...);
  ...
  return result;
}, [memberList, partFilter, sortType, searchText]);
```

이미 잘 사용하고 계시지만 두 가지 보완 팁:

### 의존성 배열 누락 방지

```
// ESLint react-hooks/exhaustive-deps 규칙 켜기
// 의존성을 빠뜨리면 자동 경고
```

### 비싼 계산이 아니면 useMemo 안 써도 됨

- 매 렌더마다 다시 계산해도 부담이 없는 작은 배열(< 1000)은 useMemo의 비교 비용이 오히려 클 수 있습니다.
- 8명 정도 멤버라면 사실 useMemo 없어도 충분합니다. 단, 멤버가 늘어났을 때 자동으로 대비된다는 점에서는 좋습니다.

핵심: useMemo는 "필요한 곳"에만 — 매 렌더 다시 계산해도 빠르면 안 써도 됩니다.

## 9. 마무리 - 다음 단계 5가지

1. **AbortController + latestRequestId** - race condition 차단
2. **타임아웃** - 무한 대기 방지
3. **unmount cleanup** - useEffect return + abort
4. **createdAt/id 통일 (useRef 카운터)** - 시간 기반 충돌 방지
5. **controlled form + 폼 안의 상태 분리** - DOM 직접 조작 제거 + UX 명확화

이 다섯 가지가 갖춰지면 fetch가 들어가는 어떤 컴포넌트도 안정적으로 동작합니다.
