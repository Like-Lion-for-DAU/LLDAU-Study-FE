# 5주차 도영 코드 개선 과제 리뷰

1~4주차 리뷰의 개선사항을 4주차 컴포넌트에 적용한 결과물 기준으로,
런타임 에러를 일으키거나 미완 상태인 부분만 정리합니다.

## 1. 컴포넌트 본문 최상단의 부수효과 - 매 렌더링마다 실행됨

```
export default function Week4Page() {
  ...
  const controller = new AbortController();   // 매 렌더마다 새로 생성
  const TIMEOUT_MS = 5000;
  let timedOut = false;
  const timeoutId = setTimeout(() => {        // 매 렌더마다 setTimeout 등록
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  ...
}
```

- 컴포넌트 본문(JSX 반환 전)은 매 렌더마다 실행됩니다.
- 위 코드는 렌더링이 일어날 때마다 AbortController를 새로 만들고 setTimeout을 등록 - 메모리 누수 + 5초 후 무관한 controller.abort() 호출.
- 또한 이 변수들은 어디서도 실제로 사용되지 않는 죽은 코드입니다 (`fetchRandomUsers` 안에서 각자 새로 만들고 있음).

### 해결

**삭제할 코드 (현재 117~124번 라인, 8줄)**

```
  const controller = new AbortController();

  const TIMEOUT_MS = 5000;
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
```

- 8줄이 사라지고 `latestRequestIdRef`/`sortType` 선언 바로 다음에 `fetchRandomUsers` 함수 선언이 옵니다.
- 이렇게 해도 동작에는 영향이 없습니다. `fetchRandomUsers`와 `fillRandomData` 각각이 함수 안에서 자기만의 `controller`, `timedOut`, `timeoutId`를 새로 만들기 때문입니다.

### 왜 삭제해도 되는가?

- 컴포넌트 본문(JSX 반환 전)은 화면이 다시 그려질 때마다 매번 실행됩니다.
- 따라서 위 8줄은 렌더링 1번마다 "새 AbortController 만들고 + 5초짜리 setTimeout 등록"을 반복합니다.
- 그런데 이 변수들을 컴포넌트 어디서도 사용하지 않습니다 (`fetchRandomUsers` 안에서 `const controller = new AbortController();`로 또 만듦).
- 사용 안 하면서 매 렌더마다 setTimeout만 등록되어 메모리 누수만 발생.

### TIMEOUT_MS 상수를 살리고 싶다면

같은 5000 값을 두 함수(`fetchRandomUsers`, `fillRandomData`)에서 모두 쓰고 있으니, 상수 하나로 묶고 싶다면 컴포넌트 **바깥**(파일 최상단, import 아래)에 한 번만 선언하세요.

```
import { useEffect, useRef, useState } from "react";
import styles from "./Page.module.css";
import { members as initialMembers } from "./members";

const TIMEOUT_MS = 5000;   // 여기에 한 번만

function SummaryCard(...) { ... }
function ContactList(...) { ... }
function DetailCard(...) { ... }

export default function Week4Page() {
  ...
}
```

그리고 두 함수 안의 `setTimeout(..., 5000)`을 `setTimeout(..., TIMEOUT_MS)`로 바꾸면 됩니다.

## 2. fetchRandomUsers의 `controller = true` 버그 - TypeError

```
const timeOutId = setTimeout(() => {
  timedOut = true;
  controller = true;       // controller에 boolean 할당
  controller.abort();      // TypeError: true.abort is not a function
}, 5000);
```

- 타임아웃이 발동되는 순간 `controller = true`로 덮어쓰고, 그 다음 줄 `true.abort()`가 호출되어 런타임 에러가 발생합니다.
- 또한 `controller`는 같은 함수에서 위에 `const`로 선언했기 때문에 재할당 자체가 불가능 - 엄격 모드에서 TypeError.

### 해결

- `controller = true;` 라인 삭제

```
const timeOutId = setTimeout(() => {
  timedOut = true;
  controller.abort();   // 이 한 줄만 남기면 됨
}, 5000);
```

## 4. clearTimeout 변수명 불일치

```
const timeOutId = setTimeout(() => {...}, 5000);   // timeOutId (대문자 O)
...
clearTimeout(timeoutId);                            // timeoutId (소문자 o)
```

- 변수명이 달라 fetchRandomUsers 안에서 만든 timer는 절대 clear되지 않습니다.
- 그리고 컴포넌트 본문 최상단의 `timeoutId`(1번 항목)를 잘못 clear하는 부작용까지.

### 해결

- 149번, 205번의 `clearTimeout(timeoutId)`을 `clearTimeout(timeOutId)`로 통일
- (선택) 변수명을 `timeoutId` 하나로 통일 - 카멜 케이스로 declare/clear

```
// fetchRandomUsers 내부
const timeoutId = setTimeout(() => {       // 소문자 o로 통일
  timedOut = true;
  controller.abort();
}, 5000);

try {
  ...
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);                  // 같은 이름으로 clear
  ...
} catch (error) {
  clearTimeout(timeoutId);
  ...
}
```

## 5. DetailCard는 `member.tell`을 표시하지만 데이터는 `motto` 사용 - "한 마디" 빈칸

```
// DetailCard (line 84)
<p>{member.tell}</p>

// members.js (initialMembers)
{ motto: "성실히 배워서..." }

// handleSubmit (line 373)
{ motto: memberInput.motto }
```

- initialMembers와 새로 추가되는 멤버 모두 `motto`로 저장하지만, DetailCard는 `member.tell`을 읽음. 한 마디 칸이 항상 비어 보입니다.
- 흥미롭게 `fetchRandomUsers`로 가져오는 멤버만 `tell: "잘 부탁드립니다!"`가 있어서 그 경우에만 표시됨.
- 한 곳으로 통일하세요.

### 해결 - `motto`로 통일

- DetailCard의 `member.tell`을 `member.motto`로 변경
- fetchRandomUsers의 fetched 멤버 객체에 `tell: "잘 부탁드립니다!"`를 `motto: "잘 부탁드립니다!"`로 변경

```
// DetailCard
<section className={styles["section"]}>
  <h4>한 마디</h4>
  <p>{member.motto}</p>   {/* tell 에서 motto 로 */}
</section>

// fetchRandomUsers
const newMember = data.results.map((user) => ({
  ...
  motto: "잘 부탁드립니다!",   {/* tell 에서 motto 로 */}
  ...
}));
```

## 6. `lastRequest` state 선언만 하고 미사용

```
const [lastRequest, setLastRequest] = useState(null);
```

- 선언만 되어 있고 어디서도 set/get하지 않음.

### 해결

1. 선언 자체를 삭제

```
// 삭제
// const [lastRequest, setLastRequest] = useState(null);
```

2. (의도 살리기) retryAction 대신 lastRequest로 통일 - fetchRandomUsers 시작 시 저장

```
const fetchRandomUsers = async (count, type = "add") => {
  setLastRequest({ count, type });
  ...
};

const handleRetry = () => {
  if (lastRequest) {
    fetchRandomUsers(lastRequest.count, lastRequest.type);
  }
};
```

이 경우 retryAction state는 fillRandomData 전용으로 분리하거나 통합 가능.

## 7. `fetchRandomUsers`가 `setRetryAction`을 호출 안 함

```
// fillRandomData
setRetryAction(() => fillRandomData);

// fetchRandomUsers - 누락
// setRetryAction(...) 없음
```

- 결과적으로 fetchRandomUsers가 실패하면 재시도 버튼을 누를 때 마지막에 호출된 `fillRandomData`가 실행됩니다 (또는 null).
- fetchRandomUsers 시작 시점에도 setRetryAction 호출이 필요.

### 해결

- `fetchRandomUsers` 시작 부분에 setRetryAction 호출 추가

```
const fetchRandomUsers = async (count, type = "add") => {
  const requestId = ++latestRequestIdRef.current;

  // 추가: 재시도용으로 현재 호출을 기억
  setRetryAction(() => () => fetchRandomUsers(count, type));

  if (latestControllRef.current) latestControllRef.current.abort();
  ...
};
```

**왜 `() => () => ...` 인가?**

- `setRetryAction(fn)`은 useState에 함수를 저장할 때 첫 번째 함수를 "초기값 lazy initializer"로 해석합니다.
- 함수를 저장하려면 `setRetryAction(() => fn)` 처럼 한 번 감싸야 함.
- 그래서 `setRetryAction(() => () => fetchRandomUsers(count, type))`로 두 번 감쌈.

## 8. setTimeout cleanup 없음

```
// fetchRandomUsers 성공 후
setTimeout(() => { setFetchStatus("idle"); }, 2000);

// handleCardClick
setTimeout(() => { setFocusedId(null); }, 1000);
```

- 두 setTimeout 모두 useRef + useEffect cleanup으로 정리 안 됨.
- unmount 직후 콜백이 실행되면 unmounted setState 경고.

### 해결

- timer id를 useRef에 저장
- useEffect cleanup에서 clearTimeout

```
// 컴포넌트 본문 상단
const statusResetTimerRef = useRef(null);
const focusResetTimerRef = useRef(null);

// fetchRandomUsers 성공 부분
setFetchStatus("success");
if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
statusResetTimerRef.current = setTimeout(() => {
  setFetchStatus("idle");
}, 2000);

// handleCardClick
function handleCardClick(name) {
  detailRefs.current[name]?.scrollIntoView({ behavior: "smooth", block: "start" });
  setFocusedId(name);

  if (focusResetTimerRef.current) clearTimeout(focusResetTimerRef.current);
  focusResetTimerRef.current = setTimeout(() => {
    setFocusedId(null);
  }, 1000);
}

// unmount cleanup
useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    if (focusResetTimerRef.current) clearTimeout(focusResetTimerRef.current);
    if (latestControllRef.current) latestControllRef.current.abort();
  };
}, []);
```

## 9. `fillRandomData`에서 fetch에 signal 안 전달

```
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  timedOut = true;
  controller.abort();
}, 5000);

const response = await fetch(`https://randomuser.me/api/?nat=us,gb,ca,au,nz`);
// signal 옵션 없음
```

- AbortController를 만들었지만 fetch에 `{ signal: controller.signal }`을 안 넘김.
- 타임아웃이 발동해도 fetch는 그대로 진행됨.

### 해결

- fetch 옵션에 signal 전달

```
const response = await fetch(
  `https://randomuser.me/api/?nat=us,gb,ca,au,nz`,
  { signal: controller.signal }                    // 추가
);
```

## 10. `fillRandomData`의 catch에서 alert 사용

```
catch (error) {
  console.error(error);
  alert("랜덤 데이터를 불러오지 못했습니다.");
}
```

- 다른 fetch는 `setFetchStatus("error")`로 화면에 표시하면서 fillRandomData만 alert 사용 - 일관성 깨짐.

### 해결

- alert 제거하고 fetchRandomUsers와 동일한 패턴

```
} catch (error) {
  console.error(error);
  if (error.name === "AbortError" && timedOut) {
    setFetchStatus("error");
    setStatusMessage("시간 초과");
  } else if (error.name !== "AbortError") {
    setFetchStatus("error");
    setStatusMessage("랜덤 데이터 불러오기 실패");
  }
}
```

## 11. id 부재 - `key={member.name}`의 한계

```
// members.js - id 필드 없음
{ name: "김주완", role: "Frontend", ... }

// 렌더링
<SummaryCard key={member.name} ... />
<DetailCard key={member.name} ... />
detailRefs.current[member.name] = el;

// fetchRandomUsers - newMember에 id 없음
const newMember = data.results.map((user) => ({
  name: ..., role: ..., ...
  // id 필드 누락
}));

// handleSubmit - newMember에 id 없음
const newMember = {
  name: memberInput.name, ...
  // id 필드 누락
};
```

- 동명이인이 추가되면 key 충돌 + ref 덮어쓰기 발생.

### 해결

- members.js에 id 부여

```
// members.js
export const members = [
  { id: 1, name: "김주완", role: "Frontend", ... },
  { id: 2, name: "임도영", role: "Frontend", ..., isMe: true },
  { id: 3, name: "김나함", ... },
  ...
];
```

- Page.jsx에 id 카운터 useRef + 헬퍼

```
const nextIdRef = useRef(
  initialMembers.length === 0
    ? 1
    : Math.max(...initialMembers.map((m) => m.id)) + 1
);

function makeNextId() {
  const id = nextIdRef.current;
  nextIdRef.current += 1;
  return id;
}
```

- handleSubmit / fetchRandomUsers의 newMember에 id 추가

```
// handleSubmit
const newMember = {
  id: makeNextId(),    // 추가
  name: memberInput.name,
  ...
};

// fetchRandomUsers
const newMember = data.results.map((user) => ({
  id: makeNextId(),    // 추가
  name: `${user.name.first} ${user.name.last}`,
  ...
}));
```

- key/ref를 id 기반으로 변경

```
<SummaryCard key={member.id} ... onClick={() => handleCardClick(member.id)} />
<DetailCard key={member.id} ... innerRef={(el) => { if (el) detailRefs.current[member.id] = el; }} />

function handleCardClick(id) {
  detailRefs.current[id]?.scrollIntoView({...});
  setFocusedId(id);
  ...
}
```

## 12. 이미지 onError fallback 없음

```
<img src={member.image} alt={`${member.name} 프로필`} className={styles["photo"]}/>
```

- fetched 이미지가 404이거나 차단되면 깨진 이미지 그대로 노출.

### 해결

- SummaryCard의 img에 onError 추가

```
<img
  src={member.image}
  alt={`${member.name} 프로필`}
  className={styles["photo"]}
  onError={(e) => {
    e.currentTarget.onerror = null;          // 무한 루프 방지
    e.currentTarget.src = `https://picsum.photos/seed/${member.id || member.name}/300/300`;
  }}
/>
```

- `onerror = null`을 먼저 호출 안 하면 fallback 이미지도 실패할 경우 무한 onError 루프 발생.

## 13. phone / website input type 누락

```
<input id="phone" type="text" ... />
<input id="web" type="text" ... />
```

- email에는 `type="email"`이 잘 들어가 있지만, phone과 website는 `type="text"` 기본값.

### 해결

- phone과 web의 type 변경

```
<input id="phone" type="tel"
  className={styles["form"]}
  value={memberInput.phone}
  onChange={(event) => handleInputChange("phone", event)}
  placeholder="예: 010-1234-5678"
  required />

<input id="web" type="url"
  className={styles["form"]}
  value={memberInput.web}
  onChange={(event) => handleInputChange("web", event)}
  placeholder="예: https://example.com"
  required />
```

- `type="tel"`: 모바일에서 숫자 키패드 노출
- `type="url"`: 모바일에서 URL 키패드 + "http://"가 포함됐는지 기본 검증

## 14. 1주차 개선사항 미적용 - 전역 셀렉터

- Page.module.css에 `:global(body) { ... }` 같은 전역 스타일이 있다면 `src/styles/globals.css`로 옮기는 게 좋음.
- 4주차 컴포넌트만 본 기준에서는 큰 문제 없지만, 다음 주차에서도 동일한 원칙 유지.

### 해결

- Page.module.css에서 `body`, `html`, `*` 등 전역 셀렉터가 있다면 `src/styles/globals.css`로 이동
- 컴포넌트 css 파일은 컴포넌트 안의 클래스만 다루도록 유지

```
/* src/styles/globals.css - 전역 */
body {
  margin: 0;
  font-family: ...;
}

/* Page.module.css - 컴포넌트 전용 */
.weekPage { ... }
.card { ... }
```

## 15. 2주차 개선사항 - CSS Modules camelCase

```
// 현재
styles["controlInner"], styles["btnIcon"], styles["my-card"], styles["week-page"]
```

- `controlInner`, `btnIcon`은 이미 camelCase로 잘 되어 있음.
- 하지만 `my-card`, `week-page`처럼 일부는 여전히 kebab-case + bracket notation 사용.
- 하나의 컨벤션으로 통일하는 게 가독성에 좋음.

### 해결

- Page.module.css의 클래스명을 camelCase로 통일
- Page.jsx의 className도 dot notation으로 변경

```
/* Page.module.css */
.weekPage { ... }   /* .week-page 에서 .weekPage 로 */
.myCard { ... }     /* .my-card 에서 .myCard 로 */
.detailCard { ... } /* .detailcard 에서 .detailCard 로 (대소문자 통일) */
.detailCardPack { ... }  /* .detailcardpack 에서 .detailCardPack 로 */
.cardPack { ... }   /* .cardpack 에서 .cardPack 로 */
.isFocused { ... }  /* 이미 camelCase */

/* Page.jsx */
<div className={styles.weekPage}>
<div className={`${styles.card} ${member.isMe ? styles.myCard : ""}`}>
<section className={styles.cardPack}>
<div className={`${styles.detailCard} ${isFocused ? styles.isFocused : ""}`}>
```

- 한 번 통일해두면 자동완성, 검색, 가독성 모두 좋아짐.
