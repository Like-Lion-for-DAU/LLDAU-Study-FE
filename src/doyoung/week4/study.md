# 4주차 학습 가이드 - 데이터 모델 일관성과 비동기 안전성

도영님의 코드는 컴포넌트 분리와 ContactList 같은 작은 추상화는 잘 되어 있지만,
"데이터·표시·입력 세 곳의 필드명이 어긋나서" 폼이 사실상 동작하지 않는 상태입니다.
이 문서는 review.md에서 지적한 버그들의 원인과, 비동기 안전성, 폼 패턴을 정리합니다.

## 1. 데이터 모델 일관성

### 지금 상태

```
// members.js (데이터)
{
  role: "Frontend",        // ← role
  motto: "...",            // ← motto
  contact: { email, phone, link }   // ← contact 객체
}

// DetailCard (표시)
<span>{member.role}</span>       // role 사용 - 맞음
<p>{member.tell}</p>             // ← tell?! 다른 이름
<ContactList contact={member.contact} />  // contact 사용 - 맞음

// handleSubmit (입력)
const newMember = {
  part: memberInput.part,       // ← part! 데이터/표시는 role
  motto: memberInput.tell,      // ← motto! DetailCard는 tell
  contact: {...}                // contact - 맞음
};
```

세 곳에서 같은 정보를 부르는 이름이 다 다릅니다.

### 결과

- 사용자가 폼에서 파트를 선택해도 → `newMember.part`로 저장 → SummaryCard의 `member.role`은 undefined → 카드에 파트 안 보임 + 필터링 누락.
- 사용자가 "한 마디"를 입력해도 → `newMember.motto`로 저장 → DetailCard의 `member.tell`은 undefined → 한 마디 빈칸.

### 해결 - 단일 이름으로 통일

```
// members.js
{
  role: "Frontend",
  tell: "...",     // motto → tell로 통일 (또는 반대로)
  contact: { email, phone, link }
}

// DetailCard
<p>{member.tell}</p>

// handleSubmit
const newMember = {
  role: memberInput.part,    // input 필드명만 다른 건 OK, 저장 시 통일
  tell: memberInput.tell,
  contact: {...}
};
```

규칙:

- 데이터·표시 두 곳의 필드명은 반드시 같아야 함.
- 입력 폼은 사용자에게 보여주는 라벨 기준으로 이름을 정해도 되지만, 저장 시 데이터 모델에 맞게 변환.

## 2. type="button" vs type="submit"

```
// 폼 안의 버튼은 기본값이 type="submit"
<form onSubmit={handleSubmit}>
  <button>추가</button>  // 기본 submit, 폼 제출됨
</form>

// 폼 제출 막고 싶은 보조 버튼은 type="button"으로 명시
<form onSubmit={handleSubmit}>
  <button type="button" onClick={fillRandomForm}>랜덤 채우기</button>
  <button type="button" onClick={onCancel}>취소</button>
  <button type="submit">추가</button>
</form>
```

핵심: 폼 안에서 type을 적지 않은 버튼은 모두 submit 동작입니다. 명시적으로 `type="submit"`을 적는 게 안전합니다.

## 3. controlled component - 이벤트 객체 다루기

### 글로벌 event의 함정

```
<select onChange={(e) => handleInputChange("part", event)} />
                                                   ↑
                                  글로벌 event - 일부 브라우저에서만 동작
```

- 화살표 함수의 매개변수가 `e`인데 body에서 `event`를 쓰면, 이건 React의 SyntheticEvent가 아니라 브라우저의 글로벌 `window.event`를 참조하는 코드입니다.
- IE 시절 동작은 했지만 React 환경에서는 일관성이 깨집니다.
- 매개변수 이름을 그대로 쓰세요.

```
<select onChange={(e) => handleInputChange("part", e)} />
```

### controlled select의 value/onChange 짝

```
<select
  value={memberInput.part}                              // value는 state
  onChange={(e) => handleInputChange("part", e)}        // onChange는 state 갱신
  required
>
```

- value와 onChange는 항상 짝으로 와야 합니다.
- value만 있고 onChange가 없으면 React가 "uncontrolled에서 controlled로 바뀌었다"는 경고를 띄웁니다.

### 정렬 select의 value 매핑 버그

```
// Before
<select
  value={partFilter}                          // ← 정렬 select가 파트 값을 봄
  onChange={(e) => setSortType(e.target.value)}>

// After
<select
  value={sortType}
  onChange={(e) => setSortType(e.target.value)}>
```

규칙: select의 value는 그 select가 표현하는 state여야 합니다.

## 4. id 카운터 패턴

```
// members.js에 id 부여
export const members = [
  { id: 1, name: "김주완", ... },
  { id: 2, name: "임도영", ... },
  ...
];

// Page.jsx
const nextIdRef = useRef(
  members.length === 0 ? 1 : Math.max(...members.map((m) => m.id)) + 1
);

function makeNextId() {
  const id = nextIdRef.current;
  nextIdRef.current += 1;
  return id;
}

// 새 멤버 (handleSubmit)
const newMember = { id: makeNextId(), ... };

// fetched 멤버
const newMembers = data.results.map((u) => ({ id: makeNextId(), ... }));

// 렌더링
{visibleMembers.map((m) => <SummaryCard key={m.id} ... />)}

// ref 인덱싱
detailRefs.current[m.id] = el;
```

장점:

- 동명이인이나 이름 변경에 안전.
- useRef라서 변경 시 리렌더 발생 안 함.
- 단조 증가 → 시간 기반(Date.now()) 충돌 걱정 없음.

## 5. AbortController + latestRequestId

```
const latestControllerRef = useRef(null);
const latestRequestIdRef = useRef(0);

const fetchRandomUsers = async (count, type = "add") => {
  const requestId = ++latestRequestIdRef.current;
  setLastRequest({ count, type });

  // 이전 요청 취소
  if (latestControllerRef.current) {
    try { latestControllerRef.current.abort(); } catch (_) {}
  }
  const controller = new AbortController();
  latestControllerRef.current = controller;

  setFetchStatus("loading");

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (requestId !== latestRequestIdRef.current) return;
    if (!res.ok) throw new Error("API 요청 실패");

    const data = await res.json();
    if (requestId !== latestRequestIdRef.current) return;

    // setState 처리
    ...

    setFetchStatus("success");
  } catch (err) {
    if (requestId !== latestRequestIdRef.current) return;
    if (err.name === "AbortError") return;
    setFetchStatus("error");
    setStatusMessage(err.message);
  }
};
```

### 두 안전망이 모두 필요한 이유

- `AbortController`: fetch가 await에서 멈춰있을 때만 효과가 있음.
- `latestRequestId`: `res.json()` 파싱이나 setState 직전에 새 요청이 시작되면 abort가 늦음 → 두 번째 안전망.

## 6. 타임아웃

```
const TIMEOUT_MS = 5000;
let timedOut = false;

const timeoutId = setTimeout(() => {
  timedOut = true;
  controller.abort();
}, TIMEOUT_MS);

try {
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  ...
} catch (err) {
  clearTimeout(timeoutId);
  if (err.name === "AbortError" && timedOut) {
    setStatusMessage("시간 초과");
    setFetchStatus("error");
    return;
  }
  if (err.name === "AbortError") return;  // 사용자 취소
  ...
}
```

`timedOut` 플래그로 "사용자 취소"와 "타임아웃 취소"를 구별합니다.

## 7. setTimeout cleanup

```
const statusTimerRef = useRef(null);
const focusTimerRef = useRef(null);

const scheduleStatusReset = () => {
  if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
  statusTimerRef.current = setTimeout(() => {
    setFetchStatus("idle");
  }, 2000);
};

function handleCardClick(id) {
  detailRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  setFocusedId(id);

  if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
  focusTimerRef.current = setTimeout(() => setFocusedId(null), 1000);
}

useEffect(() => {
  return () => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    if (latestControllerRef.current) latestControllerRef.current.abort();
  };
}, []);
```

- useEffect의 return 함수는 unmount 시 실행됩니다.
- 진행 중인 timer와 fetch를 한꺼번에 정리해 unmounted setState 경고를 막습니다.

## 8. fetched 멤버를 데이터 구조에 맞춰 변환

```
// Before - contact가 평탄화됨 (members.js 구조와 다름)
const newMember = data.results.map((user) => ({
  ...,
  email: user.email,
  phone: user.phone,
  link: { label: "Profile", url: user.picture.large },
}));

// After - contact로 감싸서 members.js 구조와 일치
const newMember = data.results.map((user) => ({
  id: makeNextId(),
  name: `${user.name.first} ${user.name.last}`,
  role: pickRandom(parts),
  intro: "랜덤 유저입니다.",
  bio: [`${user.location.country}에서 온 사용자`],
  skills: ["React", "JavaScript", "CSS"],
  tell: "잘 부탁드립니다!",
  image: user.picture.large,
  isMe: false,
  contact: {
    email: user.email,
    phone: user.phone,
    link: { label: "Profile", url: user.picture.large },
  },
}));
```

핵심: 같은 컴포넌트에서 표시하는 데이터는 모두 같은 구조여야 합니다.

## 9. handleCardClick의 focused state

```
// Before
function handleCardClick(name) {
  detailRefs.current[name]?.scrollIntoView({...});
  setTimeout(() => setFocusedId(null), 1000);  // 설정한 적이 없는데 null로 리셋
}

// After
function handleCardClick(id) {
  detailRefs.current[id]?.scrollIntoView({...});
  setFocusedId(id);  // ① 설정

  if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
  focusTimerRef.current = setTimeout(() => {
    setFocusedId(null);  // ② 1초 후 해제
  }, 1000);
}
```

①번이 없으면 CSS의 `isFocused` 클래스가 적용된 적이 없어 강조 효과를 볼 수 없습니다.

## 10. HTML 태그/속성 오타 방지

```
// 자주 틀리는 것들
<lable>         → <label>
replaceholder   → placeholder
type="web"      → type="url"
type="phone"    → type="tel"
type="number"   → 정수만 받음. 소수점 있으면 type="text" + inputMode
```

- 에디터의 HTML/JSX 자동완성을 활용하세요. (VS Code의 Emmet, ESLint의 jsx-a11y 플러그인 등)
- React는 unknown HTML 태그도 그냥 받아들이기 때문에 오타가 런타임 에러로 나타나지 않고 조용히 무시됩니다.

## 11. 마무리 - 우선순위

1. **데이터 모델 통일**: members.js / DetailCard / handleSubmit의 필드명을 `role`, `tell`, `contact`로 통일
2. **type="submit" + onChange의 e**: 폼 동작 복원
3. **value 짝**: 정렬 select의 value={sortType}
4. **상세 카드 visibleMembers**: 필터링 연동
5. **setFocusedId(id) 호출**: 강조 효과 복원
6. **fetched 멤버를 contact 구조로**: 연락처 표시
7. **id 카운터 + AbortController + 타임아웃 + setTimeout cleanup**: 비동기 안전성

1~6번까지만 고쳐도 폼·필터·focused 효과가 모두 정상 동작합니다. 7번은 그 다음 단계의 안정성입니다.
