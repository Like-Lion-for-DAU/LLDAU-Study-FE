# 4주차 태우 과제 리뷰

런타임 에러가 발생할 수 있는 곳, key 누락, fetch 안정성 부분에 몇 가지 문제가 있어 정리합니다.

## 1. map에 key prop 누락 - React 안티패턴

```
{displayList.map((member) => (
  <div onClick={() => setSelected(member)} className={styles["mainProfile"]}>
    ...
  </div>
))}
```

- 카드 그리드 map에 key가 없습니다. React 콘솔에 경고가 뜨고, 정렬/필터/삭제 시 컴포넌트가 잘못 재사용될 수 있습니다.
- initialMembers와 fetched member 모두 id가 없는 것이 근본 원인입니다.

```
// script.js - members 배열에 id 추가
export const members = [
  { id: 1, name: "김주완", ... },
  { id: 2, name: "임도영", ... },
  ...
];

// randomNewMember에도 id 부여 - 매개변수로 받거나 함수 안에서 카운터 관리
export function randomNewMember(user, id) {
  return { id, name: ..., ... };
}

// Page.jsx
const nextIdRef = useRef(members.length + 1);
function makeNextId() {
  const id = nextIdRef.current;
  nextIdRef.current += 1;
  return id;
}

const newMembers = users.map((u) => randomNewMember(u, makeNextId()));

// 렌더링
{displayList.map((member) => (
  <div key={member.id} ...>
))}
```

## 2. `selected.introduce.map`의 key가 항상 undefined

```
{selected.introduce.map((text) => (
  <p key={text.name} className={styles["introduceMyself"]}>{text}</p>
))}
```

- `text`는 문자열입니다. `text.name`은 항상 `undefined`라서 모든 `<p>`가 같은 key를 갖습니다.
- 문자열 자체를 key로 쓰거나, 같은 문장이 중복될 수 있다면 인덱스 + 접두사를 사용하세요.

```
{selected.introduce.map((text, i) => (
  <p key={`${selected.id}-intro-${i}`} ...>{text}</p>
))}
```

## 3. 옵셔널 체이닝 누락 - contact가 null이면 런타임 에러

script.js에는 `contact: null`인 멤버가 있습니다(정서윤, 김아기사자, 최아기사자).
그런데 검색과 상세 모달에서 contact가 null일 때 에러가 발생합니다.

### 검색 코드

```
member.contact?.email.includes(sortSearch)
```

- `member.contact?.email` 까지는 안전하지만, `.includes`가 그 뒤에 붙어 있습니다.
- contact가 null이면 `undefined.includes(sortSearch)` → `TypeError`.
- 모든 단계에 `?.`를 붙여야 합니다.

```
member.contact?.email?.includes(sortSearch)
member.contact?.phone?.includes(sortSearch)
member.contact?.website?.label?.includes(sortSearch)
```

### 상세 모달

```
{!selected.contact && !selected.skills && !selected.last ? (
  <p>아직 준비 중입니다.</p>
) : (
  <>
    ...
    {(selected.contact.email || selected.contact.phone || selected.contact.website) && (
```

- "contact, skills, last가 **모두** 없으면" 안내문을 보여주고 그 외에는 contact.email을 접근합니다.
- 예를 들어 `contact: null`이지만 `skills: ["x"]`인 멤버가 있다면, 안내문 분기를 통과해서 `selected.contact.email` 접근 시 에러가 납니다.

```
{selected.contact && (selected.contact.email || selected.contact.phone || selected.contact.website) && (
  <>
    <h3>연락처</h3>
    <ul>
      {selected.contact.email && <li>Email: {selected.contact.email}</li>}
      ...
    </ul>
  </>
)}
```

## 4. setTimeout cleanup 없음 - unmount 후 setState 경고

```
finally {
  setTimeout(() => setFetching("ready"), 2000);
}
```

- 2초 후 콜백이 실행되는데, 그 사이에 컴포넌트가 사라지면 unmounted setState 경고가 발생합니다.
- timer id를 useRef에 저장하고 useEffect cleanup에서 clearTimeout 하세요.

```
const statusResetTimerRef = useRef(null);

const resetStatusLater = () => {
  if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
  statusResetTimerRef.current = setTimeout(() => setFetching("ready"), 2000);
};

useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
  };
}, []);
```

## 5. catch 블록이 빈 상태 - 어떤 에러인지 알 수 없음

```
catch {
  setFetching("error");
}
```

- 에러 객체를 무시하고 있어 "왜" 실패했는지 사용자에게도, 콘솔에도 남지 않습니다.
- 최소한 console.error로 남기고, errorMessage state에 정보를 담아 화면에 보여주세요.

```
const [errorMessage, setErrorMessage] = useState("");

catch (err) {
  console.error(err);
  setErrorMessage(`불러오기 실패: ${err.message}`);
  setFetching("error");
}
```

## 6. error 상태에서 버튼 disabled - 재시도가 불가능

```
disabled={fetching === "loading" || fetching === "error"}
```

- 에러가 났을 때 2초 후 자동으로 ready로 돌아갈 때까지 사용자는 아무것도 할 수 없습니다.
- 에러 시점에는 명시적인 "재시도" 버튼이 있어야 더 좋은 UX입니다.

```
disabled={fetching === "loading"}

{fetching === "error" && (
  <button className={styles.retryBtn} onClick={lastFetchActionRef.current}>
    재시도
  </button>
)}
```

마지막으로 시도한 액션을 useRef에 저장해두면 재시도가 단순해집니다.

```
const lastFetchActionRef = useRef(null);

const handleFetchRandom = async () => {
  lastFetchActionRef.current = handleFetchRandom;
  ...
};
```

## 7. 타임아웃 없음

- 서버 응답이 30초 걸리면 사용자는 그동안 loading 상태로 멈춰있게 됩니다.
- AbortController와 setTimeout을 결합해 5초 이내 응답 없으면 끊는 패턴을 적용하세요.

```
const TIMEOUT_MS = 5000;
let timedOut = false;
const controller = new AbortController();

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
    setErrorMessage("시간 초과");
  }
}
```

## 8. `<div style={styles}>` - 의미 없는 인라인 style

```
<div style={styles}>
  <textarea ... />
  ...
</div>
```

- `styles`는 CSS Modules 객체(`{ inputName: "abc_inputName_xyz", ... }`)입니다.
- 이걸 `style={...}` (인라인 CSS 객체)로 넘기면, style 속성으로 들어가서 `inputName: "abc_..."`처럼 의미 없는 CSS가 됩니다.
- 빈 `<div>`로 두거나, `className={styles["someClass"]}`로 바꾸세요.

## 9. 본인 식별이 이름으로 hard-coding

```
const myProfile = memberList.find((member) => member.name === "백태우");
```

- 추후 동명이인이 들어오거나 다른 사람이 이 코드를 복사해 쓰면 깨집니다.
- 데이터에 `isMe: true` 플래그를 두는 게 안전합니다.

```
// script.js
{ id: 4, name: "백태우", isMe: true, ... }

// Page.jsx
const myProfile = memberList.find((m) => m.isMe);
```

또한 myProfile이 undefined일 가능성도 고려해야 합니다.

```
const lionCount = myProfile ? memberList.length - 1 : memberList.length;
const users = await randomResult(lionCount);
const newMembers = users.map((u) => randomNewMember(u, makeNextId()));
setMemberList(myProfile ? [myProfile, ...newMembers] : newMembers);
```

## 10. 정렬 "newest"가 사실은 "오래된 것부터"

```
if (sortType === "newest") return a.id - b.id;
```

- 새로 추가될수록 id(Date.now())가 커지는데, `a.id - b.id`는 오름차순이라 오래된 것이 위로 옵니다.
- "최신 업데이트순"이라는 라벨과 동작이 반대입니다.

```
if (sortType === "newest") return b.id - a.id;
```

## 11. id를 Date.now()로 부여 - 동시 호출 시 충돌 가능

```
const newMember = { id: Date.now(), ... };
```

- 빠르게 여러 명이 추가되면 같은 ms 안에 호출되어 id가 겹칠 수 있습니다.
- 그리고 fetched member에는 id가 아예 부여되지 않습니다.
- useRef 카운터로 통일하세요(1번 항목 참고).

## 12. 사용하지 않는 useEffect import

```
import { useState, useEffect } from "react";
```

- Page.jsx에서 useEffect는 사용하지 않습니다. 죽은 import를 정리하세요.

## 13. input type 속성 누락

```
<input id="email" type="text" ... />
<input id="phone" type="text" ... />
<input id="website" type="text" ... />
```

- 검증을 직접 정규식으로 하고 계시지만, HTML 기본 type을 활용하면 모바일에서 키패드 종류도 달라지고 자동완성도 잘 동작합니다.

```
<input id="email" type="email" ... />
<input id="phone" type="tel" ... />
<input id="website" type="url" ... />
```

## 14. 이미지 로드 실패 fallback 없음

```
<img className={styles["profileImage"]} src={member.image} />
```

- 외부 URL이 404거나 차단되면 깨진 이미지가 보입니다. alt도 빠져 있어 대체 표시도 없습니다.

```
<img
  className={styles["profileImage"]}
  src={member.image}
  alt={`${member.name} 프로필 이미지`}
  onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/fallback/200/200"; }}
/>
```

## 15. CSS 오타 - refrash → refresh

- `refrashButton`, `refrashState` 클래스명이 오타입니다. `refresh`가 맞습니다.
- CSS Modules에서는 컴파일이 안 깨지지만, 검색·재사용 시 혼란이 생깁니다.

## 16. 체크리스트

- [v] 커스텀 훅 분리 (useFormData, usePageScrollDown)
- [v] 데이터/로직 파일 분리 (script.js)
- [v] fetch 상태 4단계 관리 (ready/loading/success/error)
- [v] 폼 검증 (email/phone/website 정규식)
- [v] touched로 dirty input만 경고
- [v] 모달 backdrop + e.stopPropagation + ESC + 스크롤 lock
- [v] 검색·정렬·필터 조합
- [v] 빈 결과 UI
- [v] CSS Modules 일관 사용
- [ ] map에 key prop 부여 (id 필드 기반)
- [ ] `selected.introduce.map`의 key={text.name} 버그 수정
- [ ] contact null 가능성에 옵셔널 체이닝 (`?.`)
- [ ] setTimeout cleanup (useEffect return + useRef)
- [ ] catch 블록에서 에러 정보 활용 (console.error + 사용자 메시지)
- [ ] error 상태에서 명시적 재시도 버튼
- [ ] fetch 타임아웃 처리
- [ ] `<div style={styles}>` 의미 없는 코드 제거
- [ ] 본인 식별 isMe 플래그로 전환
- [ ] 정렬 "newest" 방향 수정 (b.id - a.id)
- [ ] id를 useRef 카운터로 통일 (fetched member에도 부여)
- [ ] 사용하지 않는 useEffect import 제거
- [ ] input type="email"/"tel"/"url" 적용
- [ ] 이미지 onError fallback
- [ ] CSS 오타(refrash → refresh)

## 17. 핵심 학습 포인트

- 다음 단계는 "런타임 에러를 막는 방어 코드"입니다.
- key prop과 옵셔널 체이닝은 React에서 가장 자주 발생하는 두 가지 에러 원인입니다. 데이터 형태가 nullable이면 모든 단계에 `?.`를 붙여야 합니다.
- 비동기 작업에는 항상 "타임아웃(무한 대기 방지)", "setTimeout cleanup(unmount 안전)", "error state + 재시도 버튼" 세 가지가 함께 가야 합니다.
- 같은 폴더의 study.md에 위 세 가지 비동기 패턴과 옵셔널 체이닝 정리를 두었으니 참고하세요.
