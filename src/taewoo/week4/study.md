# 4주차 학습 가이드 - 방어적 React 코드

## 1. key prop과 React의 reconciliation

React는 같은 위치의 컴포넌트가 "같은 컴포넌트인지"를 판단할 때 key를 사용합니다.

### key가 없거나 잘못된 경우

```
{members.map((m) => <Card member={m} />)}  // key 없음 - 경고
```

- React는 위치(index)로 비교합니다.
- 정렬·삭제·필터가 일어나면 다른 데이터의 카드를 "재사용"해서 input 값이 섞이는 등 버그가 납니다.

### 좋은 key

```
{members.map((m) => <Card key={m.id} member={m} />)}
```

- id는 데이터 자체에 묶인 안정적인 값입니다.
- 정렬이 바뀌어도 같은 데이터의 카드는 같은 컴포넌트로 인식됩니다.

### key={index}, key={text.name} 같은 함정

```
{texts.map((text, i) => <p key={i}>{text}</p>)}      // 안 좋음 (순서 바뀌면 깨짐)
{texts.map((text) => <p key={text.name}>{text}</p>)}  // 버그 (text는 string)
```

- index key는 순서가 절대 안 바뀐다고 보장될 때만 허용.
- 객체의 속성을 key로 쓸 땐 그 속성이 정말 존재하는지 확인해야 합니다.

## 2. 옵셔널 체이닝 (`?.`) 완전 가이드

데이터에 `null` 또는 `undefined`가 섞일 수 있으면 모든 접근 단계에 `?.`를 붙여야 합니다.

### 단계별 안전성

```
const obj = { contact: null };

obj.contact.email          // TypeError: Cannot read 'email' of null
obj.contact?.email         // undefined  ← OK
obj.contact?.email.length  // TypeError: Cannot read 'length' of undefined  ← 위험
obj.contact?.email?.length // undefined  ← 안전
```

핵심: **`?.` 뒤에 다시 메서드나 속성을 쓸 때는 그곳에도 `?.`를 붙여야 한다**.

### 자주 틀리는 패턴

```
// 1) 메서드 호출
arr?.map(...)         // OK
obj?.fn()             // OK (옵셔널 호출)

// 2) 체인 중간이 null일 때
data?.user.name       // user가 없으면 .name에서 에러
data?.user?.name      // 안전

// 3) include / 배열 메서드
list?.includes(x)     // list가 null이면 OK (undefined 반환)
items?.skills.some()  // skills가 null이면 에러
items?.skills?.some() // 안전
```

### 검색 코드 적용 예

```
// Before
member.contact?.email.includes(q)
member.skills?.some((s) => s.includes(q))

// After
member.contact?.email?.includes(q)
member.skills?.some((s) => s?.includes(q))
```

## 3. AbortController + latestRequestId 패턴

비동기 작업의 "취소"와 "stale 응답 무시"를 모두 잡는 표준 패턴입니다.

```
const latestControllerRef = useRef(null);
const latestRequestIdRef = useRef(0);

async function runFetch(actionFn) {
  // 1) 내 요청에 고유 id 부여
  const requestId = ++latestRequestIdRef.current;

  // 2) 이전 요청이 있으면 취소
  if (latestControllerRef.current) {
    latestControllerRef.current.abort();
  }

  const controller = new AbortController();
  latestControllerRef.current = controller;

  setFetching("loading");

  try {
    const result = await actionFn(controller.signal);

    // 3) 응답이 도착했을 때 내가 아직 최신인지 확인
    if (requestId !== latestRequestIdRef.current) return;

    setData(result);
    setFetching("success");
  } catch (err) {
    if (requestId !== latestRequestIdRef.current) return;
    if (err.name === "AbortError") return;

    setFetching("error");
    setErrorMessage(err.message);
  }
}

// 호출 예
const handleFetchOne = () => runFetch(async (signal) => {
  const users = await randomResult(1, signal);
  return users[0];
});
```

### 왜 AbortController만으로는 부족한가?

- AbortController는 fetch가 await에서 멈춰있을 때만 효과가 있습니다.
- `await res.json()` 이후나 setState 직전에 새 요청이 시작되면 abort가 늦어, 두 응답이 모두 처리될 수 있습니다.
- latestRequestId 비교는 "응답이 setState에 도달하기 직전" 한 번 더 검사하는 두 번째 안전망입니다.

## 4. setTimeout / setInterval cleanup

컴포넌트가 unmount된 후 콜백이 실행되면 unmounted setState 경고가 발생하고, 메모리 누수의 원인이 됩니다.

```
const timerRef = useRef(null);

const scheduleReset = () => {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => setFetching("ready"), 2000);
};

useEffect(() => {
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, []);
```

## 5. 에러 + 재시도 UI

```
const lastFetchActionRef = useRef(null);
const [errorMessage, setErrorMessage] = useState("");

async function runFetch(actionFn) {
  lastFetchActionRef.current = actionFn;  // 어떤 액션이었는지 기억
  setErrorMessage("");
  ...
}

const handleRetry = () => {
  if (lastFetchActionRef.current) {
    runFetch(lastFetchActionRef.current);
  }
};

// UI
{errorMessage && (
  <div className={styles.errorBanner} role="alert">
    {errorMessage}
    <button onClick={handleRetry}>재시도</button>
  </div>
)}
```

- `error` 상태에서 버튼을 disabled로 막아두지 않습니다. 명시적 재시도 버튼을 노출합니다.

## 6. 타임아웃 - AbortController와 setTimeout 결합

```
const TIMEOUT_MS = 5000;

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError" && timedOut) {
      throw new Error("시간 초과");
    }
    throw err;
  }
}
```

- `timedOut` 플래그로 "사용자 취소"와 "타임아웃 취소"를 구별합니다.
- 사용자가 직접 취소한 경우(다음 요청 시작)는 에러 메시지를 보여주지 않습니다.

## 7. 본인 식별 - 데이터 플래그 사용

```
// Before - 이름 문자열 hard-coding
const myProfile = memberList.find((m) => m.name === "백태우");

// After - 데이터에 플래그
export const members = [
  { id: 4, name: "백태우", isMe: true, ... },
];

const myProfile = memberList.find((m) => m.isMe);
```

- 데이터를 사이트 사용자에 맞게 바꿔도, 코드는 그대로 동작합니다.
- 다른 사람이 이 코드를 복사해서 자기 이름으로 쓸 때도 편합니다.

### myProfile이 undefined일 가능성도 처리

```
const myProfile = memberList.find((m) => m.isMe);
const baseList = myProfile ? [myProfile] : [];
const fetchCount = myProfile ? memberList.length - 1 : memberList.length;

const users = await randomResult(fetchCount);
const newMembers = users.map((u) => randomNewMember(u, makeNextId()));
setMemberList([...baseList, ...newMembers]);
```

## 8. id 생성 - Date.now() vs useRef 카운터

### Date.now()의 함정

```
const id = Date.now();
```

- 같은 ms에 두 번 호출되면 같은 id가 됩니다.
- `Array.map`으로 여러 명을 한 번에 만들면 거의 확실히 충돌합니다.

```
users.map((u) => ({ id: Date.now(), ... }))
// 결과: 모든 멤버가 같은 id를 가질 가능성 매우 높음
```

### useRef 카운터

```
const nextIdRef = useRef(initialMembers.length + 1);

function makeNextId() {
  const id = nextIdRef.current;
  nextIdRef.current += 1;
  return id;
}

// 사용
const newMember = { id: makeNextId(), ... };
const newMembers = users.map((u) => ({ id: makeNextId(), ... }));
```

- 컴포넌트 lifetime 동안 단조 증가 → 절대 충돌 없음.
- useState가 아닌 useRef인 이유: id 카운터 자체는 화면 갱신과 무관하므로 변경 시 리렌더링 불필요.

## 9. input type 활용

### type 별 기본 동작

- `text` - 일반 키패드. 자동완성·검증 없음.
- `email` - 모바일에서 `@` 포함 키패드. 브라우저가 `@` 포함 여부 기본 검증.
- `tel` - 숫자 패드 표시. 검증은 없으므로 정규식 별도 필요.
- `url` - URL 키패드. 브라우저가 URL 형식 기본 검증.
- `search` - 모바일에서 키보드의 "이동" 버튼이 "검색"으로 바뀜.

```
<input id="email" name="email" type="email" required />
<input id="phone" name="phone" type="tel" required />
<input id="website" name="website" type="url" required />
<input id="search" name="search" type="search" />
```

직접 정규식 검증을 하더라도 type은 함께 적어두는 게 모바일 UX에 도움이 됩니다.

## 10. 이미지 fallback 패턴

```
<img
  src={member.image}
  alt={`${member.name} 프로필 이미지`}
  onError={(e) => {
    e.currentTarget.onerror = null;  // 무한 루프 방지
    e.currentTarget.src = "https://picsum.photos/seed/fallback/200/200";
  }}
/>
```

- `alt`는 접근성과 SEO를 위해 필수.
- `onError`에서 다시 깨진 URL로 바꾸면 무한 루프가 도므로 `e.currentTarget.onerror = null` 먼저.

## 11. 마무리 - 방어 코드 5가지

1. **모든 map에 key prop** (가급적 데이터 id)
2. **nullable 데이터에 옵셔널 체이닝** (`?.`를 모든 단계에)
3. **AbortController + latestRequestId** (race condition 차단)
4. **setTimeout cleanup** (unmount 안전)
5. **error state + retry 버튼** (alert/disabled 대신)

이 다섯 가지가 갖춰지면 fetch가 들어가는 어떤 컴포넌트도 안정적으로 동작합니다.
