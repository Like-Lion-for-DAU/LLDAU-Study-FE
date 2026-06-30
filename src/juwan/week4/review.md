# 4주차 주완 과제 리뷰

비동기 안전성과 몇 가지 디테일에 개선 포인트가 있어 정리합니다.

## 1. 컴포넌트 이름 오타 - Week3Page

```
export default function Week3Page() {
```

- week4 폴더인데 컴포넌트명이 `Week3Page`입니다. 동작에는 영향 없지만 다른 사람이 코드를 읽을 때 혼동되고, React DevTools에서도 잘못된 이름으로 표시됩니다.

```
export default function Week4Page() { ... }
```

## 2. AbortController / race condition 없음

```
const fetchRandomMembers = (count, mode) => {
  lastRequestRef.current = () => fetchRandomMembers(count, mode);
  setIsLoading(true);
  ...
  fetch(API_URL + count)
    .then((res) => { ... })
    .then((data) => { ... setMemberList(...) ... });
};
```

- "랜덤 1명 추가" → 바로 "랜덤 5명 추가"를 누르면 두 응답이 모두 setState됩니다.
- `isLoading` + `disabled`로 막아두긴 했지만, React 리렌더 이전이나 함수가 여러 개일 때 빈틈이 생깁니다.
- 컴포넌트가 unmount된 뒤 응답이 도착하면 unmounted setState 경고도 발생합니다.
- AbortController + latestRequestId 패턴으로 명시적으로 막으세요.

```
const latestControllerRef = useRef(null);
const latestRequestIdRef = useRef(0);

const fetchRandomMembers = (count, mode) => {
  const requestId = ++latestRequestIdRef.current;
  lastRequestRef.current = () => fetchRandomMembers(count, mode);

  if (latestControllerRef.current) latestControllerRef.current.abort();
  const controller = new AbortController();
  latestControllerRef.current = controller;

  setIsLoading(true);
  setHasError(false);

  fetch(API_URL + count, { signal: controller.signal })
    .then((res) => {
      if (!res.ok) throw new Error("요청 실패");
      return res.json();
    })
    .then((data) => {
      if (requestId !== latestRequestIdRef.current) return; // stale 응답 무시
      ...
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

## 3. fetch 타임아웃 없음

- 서버 응답이 30초 걸리면 사용자는 그동안 "불러오는 중..."만 보게 됩니다.
- AbortController + setTimeout으로 5초 이내 응답 없으면 강제 종료하세요.

```
const TIMEOUT_MS = 5000;
let timedOut = false;
const timeoutId = setTimeout(() => {
  timedOut = true;
  controller.abort();
}, TIMEOUT_MS);

fetch(url, { signal: controller.signal })
  .then(...)
  .catch((err) => {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" && timedOut) {
      setStatusText("불러오기 실패: 시간 초과");
      setHasError(true);
    }
  });
```

## 4. unmount cleanup 없음

- 진행 중인 fetch가 있는 상태로 컴포넌트가 unmount되어도 controller.abort()가 호출되지 않습니다.
- useEffect cleanup에서 정리하세요.

```
useEffect(() => {
  return () => {
    if (latestControllerRef.current) {
      try {
        latestControllerRef.current.abort();
      } catch (_) {}
    }
  };
}, []);
```

## 5. 전체 새로고침에서 본인 카드(isMe)도 사라짐

```
fetch(API_URL + 9)
  .then((data) => {
    if (mode === "replace") {
      setMemberList(randomMembers);
    }
  });
```

- "전체 새로고침"을 누르면 본인 카드(주완)도 함께 사라지고 9명의 랜덤 멤버로 교체됩니다.
- 일반적으로 본인 카드는 보존하고 나머지만 교체하는 게 자연스럽습니다.

```
fetch(API_URL + (memberList.length - myCards.length))
  .then((data) => {
    if (mode === "replace") {
      const myCards = memberList.filter((m) => m.isMe);
      setMemberList([...myCards, ...randomMembers]);
    } else {
      setMemberList((prev) => [...prev, ...randomMembers]);
    }
  });
```

또한 fetchRandomMembers 호출 시 count를 hard-coded "9"로 넘기는 대신, 현재 멤버 수를 동적으로 계산하는 게 좋습니다.

```
const fetchCount = mode === "replace"
  ? memberList.length - memberList.filter((m) => m.isMe).length
  : count;
```

## 6. fillRandomForm에서 DOM 직접 조작

```
form.name.value = randomMember.name;
form.role.value = randomMember.role;
form.badge.value = randomMember.badge;
...
form.image.value = randomMember.image;
```

- React 안에서 input.value를 직접 쓰는 것은 권장되지 않습니다. uncontrolled form이라 동작은 하지만, controlled component가 더 깔끔합니다.

```
const [formData, setFormData] = useState({
  name: "", role: "Frontend", badge: "", ...
});

const handleInput = (field) => (e) => {
  setFormData((prev) => ({ ...prev, [field]: e.target.value }));
};

<input
  name="name"
  value={formData.name}
  onChange={handleInput("name")}
  required
/>

// 랜덤 채우기
const fillRandomForm = () => {
  fetch(API_URL + 1)
    .then(...)
    .then((data) => {
      const randomMember = makeRandomMember(data.results[0], 0);
      setFormData({
        name: randomMember.name,
        role: randomMember.role,
        badge: randomMember.badge,
        ...
      });
    });
};
```

장점: setState 한 번으로 모든 input이 자동 갱신됩니다. DOM querySelector 불필요.

## 7. fillRandomForm이 메인 statusText 공유

```
const fillRandomForm = () => {
  setIsLoading(true);
  setHasError(false);
  setStatusText("불러오는 중...");
  ...
  setStatusText("랜덤 값 채우기 완료!");
};
```

- 폼 안에서 "랜덤 값 채우기" 누르면 페이지 상단 상태 영역의 메시지가 바뀝니다.
- 두 영역의 상태가 섞여서 사용자가 어떤 작업의 결과인지 혼동될 수 있습니다.
- 폼 안에 별도 상태 메시지 영역을 두거나, 작은 spinner를 버튼 옆에 표시하는 게 더 직관적입니다.

```
const [isFilling, setIsFilling] = useState(false);

<button onClick={fillRandomForm} disabled={isFilling}>
  {isFilling ? "불러오는 중..." : "랜덤 값 채우기"}
</button>
```

## 8. id 충돌 가능성 - Date.now()

```
function makeRandomMember(user, index) {
  return {
    id: user.login.uuid,  // 이건 안전
    createdAt: Date.now() + index,
    ...
  };
}

// handleSubmit
id: "custom-" + Date.now(),
```

- `user.login.uuid`는 안전하지만, `custom-` + `Date.now()`는 사용자가 빠르게 두 명을 추가하면 같은 ms로 충돌 가능합니다.
- useRef 카운터로 안전하게 관리하세요.

```
const nextIdRef = useRef(0);

function makeNextCustomId() {
  const id = `custom-${nextIdRef.current}`;
  nextIdRef.current += 1;
  return id;
}

// handleSubmit
id: makeNextCustomId(),
```

## 9. createdAt 일관성 - index vs Date.now()

```
// makeLocalMember
createdAt: index,        // 0, 1, 2, ..., 7

// makeRandomMember
createdAt: Date.now() + index,  // 1700000000000+

// handleSubmit
createdAt: Date.now(),
```

- 정렬 기준 `createdAt`이 두 가지 스케일(index 0~7 vs ms 단위)로 섞여 있습니다.
- "최신추가순" 정렬 시 initialMembers는 createdAt=0~7, fetched는 큰 값. 결과적으로 항상 fetched가 위에 옵니다. 의도였으면 OK이지만, 멤버 순서 디버깅 시 혼란이 생길 수 있습니다.
- 통일된 카운터로 관리하는 게 안전합니다.

```
// 초기에 timestamp 부여
const initialList = members.map((m, i) => makeLocalMember(m, i, Date.now() + i));

// makeLocalMember
function makeLocalMember(member, index, timestamp) {
  return { ..., createdAt: timestamp };
}
```

## 10. 이미지 onError fallback 없음

```
<img className={styles.cardImage} src={member.image} alt={`${member.name} 프로필`} />
```

- 외부 URL이 404이거나 차단되면 깨진 이미지가 보입니다.

```
<img
  className={styles.cardImage}
  src={member.image}
  alt={`${member.name} 프로필`}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = `https://picsum.photos/seed/${member.id}/400/300`;
  }}
/>
```

## 11. phone에 type="tel" 누락

```
<input className={styles.input} name="phone" required placeholder="Phone" />
```

- email/website는 type="email"/"url"인데 phone만 type="text" 기본값입니다.
- 모바일 키패드가 숫자 패드로 뜨도록 type="tel"을 추가하세요.

```
<input name="phone" type="tel" required placeholder="Phone" />
```

## 12. 체크리스트

- [v] useMemo로 필터/정렬 메모이즈
- [v] 헬퍼 함수 분리 (makeLocal / makeRandom / getRandomItem)
- [v] mode 매개변수로 add/replace 통합 (DRY)
- [v] isLoading + hasError 두 상태 분리
- [v] 재시도 버튼 조건부 렌더링
- [v] lastRequestRef로 재시도
- [v] user.login.uuid를 id로 사용
- [v] 데이터 파일 분리 (members.js)
- [v] isMe 플래그
- [v] HTML required + type="email"/"url"
- [v] 빈 결과 UI
- [v] 반응형 그리드
- [v] CSS 변수 사용
- [ ] 컴포넌트 이름 Week3Page → Week4Page
- [ ] AbortController + latestRequestId로 race condition 차단
- [ ] fetch 타임아웃 5초
- [ ] useEffect cleanup (controller.abort)
- [ ] 전체 새로고침에서 isMe 보존
- [ ] 새로고침 count를 hard-coded 9 대신 동적 계산
- [ ] fillRandomForm을 controlled component 패턴으로
- [ ] fillRandomForm 상태를 메인과 분리 (isFilling)
- [ ] handleSubmit의 id를 useRef 카운터로 (Date.now() 충돌 방지)
- [ ] createdAt 스케일 통일 (index vs ms 혼합 방지)
- [ ] 이미지 onError fallback
- [ ] phone에 type="tel"

## 14. 핵심 학습 포인트

- 다음 단계는 "비동기 안전성"입니다.
- 비동기 작업에는 항상 "AbortController(취소)", "latestRequestId(stale 무시)", "타임아웃", "unmount cleanup" 네 가지가 함께 가야 합니다.
- id와 timestamp는 시간 기반(Date.now())보다 useRef 카운터처럼 단조 증가 방식이 안전합니다.
- 폼은 가능하면 controlled component로 — DOM 직접 조작은 외부 라이브러리 연동 같은 특수 케이스에만 쓰세요.
- 같은 폴더의 study.md에 비동기 안전 패턴, controlled form 전환, id 카운터, isMe 보존 로직을 정리해두었으니 참고하세요.
