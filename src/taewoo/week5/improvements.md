# 5주차 태우 코드 개선 과제 리뷰

런타임 영향이 있거나 4주차 review에서 미완 상태인 부분만 정리합니다.

신규 버그와 일부 미완 항목입니다.

## 1. club 필드 - UI에 input이 없는데 isFormValid가 검사 - "추가" 버튼 영구 disabled

```
// script.js
const emptyForm = { name: "", part: "Frontend", club:"", skills: "", introduce: "", introduceDetail: "", email: "", phone: "", website: "", last: "" };

const isFormValid =
  Object.values(formData).every((v) => v.trim() !== "") &&
  validateEmail(formData.email) &&
  validateWebsite(formData.website) &&
  validatePhone(formData.phone);
```

- `emptyForm`에 `club: ""`이 추가됐는데, Page.jsx의 폼 UI에는 `club`을 입력받는 input이 없습니다.
- `isFormValid`는 `Object.values(formData).every((v) => v.trim() !== "")`로 모든 필드를 검사하므로, `club`이 영원히 빈 문자열 → `isFormValid`는 영원히 `false`.
- 결과: 사용자가 다른 모든 input을 채워도 "추가" 버튼이 disabled 상태 그대로 → **폼 자체가 동작 안 함**.
- `handleAddSubmit`에서 `formData.club`을 사용하지만 채워질 경로가 없습니다.
- `pushRandomMembers` 반환값에도 `club` 키 없음 → "랜덤 값 채우기"로도 채워지지 않음.

### 해결

**A. club input을 폼에 추가 (의도가 받기였다면)**

```
<div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
  <label htmlFor="club" className={styles["pushLabel"]}>동아리</label>
  <input id="club" type="text" className={styles["inputLongtype"]}
    placeholder="예: DAU_DSIS"
    value={formData.club} onChange={handleInput("club")}/>
  {warn("club") && <span className={styles["inputWarning"]}>...</span>}
</div>
```

그리고 `pushRandomMembers`에도 club 반환 추가:

```
// script.js
return {
  ...,
  club: "랜덤 유저 클럽",
};
```

**B. emptyForm과 handleAddSubmit에서 club 제거 (의도가 hard-coded였다면)**

```
// script.js
const emptyForm = { name: "", part: "Frontend", skills: "", introduce: "", introduceDetail: "", email: "", phone: "", website: "", last: "" };

// Page.jsx
const newMember = {
  ...,
  club: "DAU_DSIS",   // hard-coded
  ...
};
```

## 2. `import` 구문에 잘못된 `use` 포함

```
import { useState, useEffect, useRef, use } from "react";
```

- React 19의 새 hook인 `use`를 import했지만 코드 어디서도 사용 안 함.
- 의도하지 않게 IDE 자동완성으로 들어간 것 같음.
- 실제로 React 18이면 export되지 않는 이름이라 빌드 경고 또는 에러 가능.

### 해결

```
import { useState, useEffect, useRef } from "react";
```

## 3. `handleFetchRandom`/`handleFetchFiveRandom`/`handleRefresh`의 try 밖 return - ReferenceError

```
const handleFetchRandom = async () => {
  setFetching("loading");
  lastAction.current = handleFetchRandom;
  try {
    const user = await randomResult(1);
    const newMember = {...randomNewMember(user[0]), id: makeNextId() };
    setMemberList((prev) => [...prev, newMember]);
    setFetching("success");
    setTimeout(() => setFetching("ready"), 2000);
  } catch{
    setFetching("error");
  }
  return user[0];   // try 블록의 const라 여기서 ReferenceError
};
```

- `user`는 `try` 안에서 선언된 `const`. try 밖에서 접근 불가.
- 성공/실패 어느 경우든 `return user[0]` 줄에서 `ReferenceError: user is not defined`.
- 호출자가 await를 안 하니까 에러가 silently 발생.
- `handleFetchFiveRandom`(users)와 `handleRefresh`(users)도 동일한 패턴.

### 해결 - return 라인 삭제 (필요 없는 코드)

```
const handleFetchRandom = async () => {
  setFetching("loading");
  lastAction.current = handleFetchRandom;
  try {
    const user = await randomResult(1);
    const newMember = {...randomNewMember(user[0]), id: makeNextId() };
    setMemberList((prev) => [...prev, newMember]);
    setFetching("success");
    setTimeout(() => setFetching("ready"), 2000);
  } catch {
    setFetching("error");
  }
  // return user[0]; ← 삭제 (호출자가 사용 안 함)
};
```

세 함수 모두 `return ...` 한 줄씩 삭제.

## 4. `htmlForfor` 오타 - label과 input 연결 안 됨

```
<label className={styles["firstSortLabel"]} htmlForfor="sortPart">파트</label>
<label className={styles["sortLabel"]} htmlForfor="sortType">정렬</label>
<label className={styles["sortLabel"]} htmlForfor="searchInput">검색</label>
```

- 정확한 속성은 `htmlFor`. `htmlForfor`는 React가 인식하지 못해서 무시됨.
- 결과적으로 label 클릭이 input 포커스로 연결되지 않음 (접근성 손실).

### 해결

```
<label htmlFor="sortPart" className={styles["firstSortLabel"]}>파트</label>
<label htmlFor="sortType" className={styles["sortLabel"]}>정렬</label>
<label htmlFor="searchInput" className={styles["sortLabel"]}>검색</label>
```

## 5. `selected.skills.map`의 `key={skill.id}` - skill은 문자열

```
{selected.skills.map((skill) => (
  <li key={skill.id} className={styles["listStyle"]}>{skill}</li>
))}
```

- `skills`는 `["NLP", "LLM", "python"]` 같은 문자열 배열.
- `skill.id`는 항상 `undefined` → 모든 `<li>`가 같은 key.
- 4주차 review #2와 똑같은 패턴 버그가 다른 곳에서 재발.

### 해결

```
{selected.skills.map((skill, i) => (
  <li key={`${selected.id}-skill-${i}`} className={styles["listStyle"]}>{skill}</li>
))}
```

또는 문자열 자체가 유일하면:

```
{selected.skills.map((skill) => (
  <li key={skill} className={styles["listStyle"]}>{skill}</li>
))}
```

## 6. `handleRefresh`의 `setMemberList([myProfile, ...])` - myProfile이 undefined일 가능성

```
const handleRefresh = async () => {
  ...
  try {
    const myProfile = memberList.find((m) => m.isMe);
    const baseList = myProfile ? [myProfile] : [];   // baseList 만들었지만 사용 안 함

    const lionCount = myProfile ? memberList.length-1 : memberList.length;
    const users = await randomResult(lionCount);
    const newMembers = users.map((u) => ({...randomNewMember(u), id: makeNextId()}));
    setMemberList([myProfile, ...newMembers]);   // myProfile undefined면 [undefined, ...]
  }
  ...
};
```

- `baseList`를 만들어두고 정작 사용 안 함.
- `setMemberList([myProfile, ...newMembers])`는 `myProfile`이 undefined일 때 `[undefined, ...]` 배열을 만듦 → 렌더링 에러.

### 해결 - baseList를 실제로 사용

```
setMemberList([...baseList, ...newMembers]);
```

또는 직접 조건문:

```
setMemberList(myProfile ? [myProfile, ...newMembers] : newMembers);
```

## 7. 상세 모달의 `selected.contact.email` 옵셔널 체이닝 미흡

```
{!selected.contact && !selected.skills && !selected.last ? (
  <p className={styles["introduceMyself"]}>아직 준비 중입니다.</p>
) : (
  <>
    ...
    {(selected.contact.email || selected.contact.phone || selected.contact.website) && (
      ...
    )}
  </>
)}
```

- "contact, skills, last 모두 없으면" 안내문을 보여주고 외에는 `selected.contact.email` 접근.
- 예: `contact: null`이지만 `skills: ["x"]`인 멤버가 있다면(현재 김아기사자/최아기사자가 그런 경우는 아니지만 데이터가 늘면 발생 가능) 안내문 분기를 통과하면서 `selected.contact.email`에서 TypeError.
- 검색 코드에는 옵셔널 체이닝을 잘 적용했는데, 모달은 미흡.

### 해결

```
{selected.contact && (selected.contact.email || selected.contact.phone || selected.contact.website) && (
  <>
    <h3 className={styles["introduceTitle"]}>연락처</h3>
    <ul>
      {selected.contact.email && <li>...</li>}
      {selected.contact.phone && <li>...</li>}
      {selected.contact.website && <li>...</li>}
    </ul>
  </>
)}
```

`selected.contact &&` 한 단계를 앞에 추가.

## 8. `resetStatusLater` 정의만 하고 사용 안 함 - setTimeout cleanup 미완

```
const resetStatusLater = () => {
  if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
  statusResetTimerRef.current = setTimeout(() => setFetching("ready"), 2000)
};

// 실제 fetch 함수들에서는 여전히 직접 호출
setTimeout(() => setFetching("ready"), 2000);   // ← 이건 ref에 저장 안 됨
```

- `resetStatusLater` 헬퍼를 만들어둔 의도는 좋지만 실제 fetch 함수들에서 사용하지 않음.
- 결과적으로 setTimeout은 useRef에 저장되지 않고 cleanup도 안 됨 → 4주차 review #4 미해결.

### 해결 - resetStatusLater를 실제로 호출

```
const handleFetchRandom = async () => {
  setFetching("loading");
  lastAction.current = handleFetchRandom;
  try {
    const user = await randomResult(1);
    const newMember = {...randomNewMember(user[0]), id: makeNextId() };
    setMemberList((prev) => [...prev, newMember]);
    setFetching("success");
    resetStatusLater();    // setTimeout(...) 대신 헬퍼 호출
  } catch {
    setFetching("error");
  }
};
```

`handleFetchFiveRandom`, `handleRefresh`에도 동일하게 적용.

## 9. `fetchTimeout` 함수 정의만 하고 사용 안 함 + `url` 미정의

```
async function fetchTimeout() {
  const controller = new AbortController();
  let checkOut = false;
  const timeoutId = setTimeout(() => {
    checkOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });   // url 미정의
    ...
  } catch (error) { ... }
}
```

- 타임아웃 로직을 만든 의도는 좋지만 실제로 호출되지 않음 (죽은 코드).
- 호출되더라도 `url`이 매개변수로도 없고 외부 변수도 없어서 ReferenceError.
- 결과적으로 `handleFetchRandom` 등에는 타임아웃이 적용되지 않음 → 4주차 review #7 미해결.

### 해결 - 매개변수 추가하고 실제 fetch에 적용

```
async function fetchTimeout(url) {
  const controller = new AbortController();
  let checkOut = false;
  const timeoutId = setTimeout(() => {
    checkOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError" && checkOut) {
      throw new Error("시간 초과");
    }
    throw error;
  }
}
```

그리고 `randomResult`를 이 헬퍼로 교체:

```
// script.js
export async function randomResult(number, signal) {
  const fetchURL = `https://randomuser.me/api/?results=${number}&nat=us,gb,ca,au,nz`;
  const res = await fetch(fetchURL, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.results;
}
```

그러면 `handleFetchRandom`에서:

```
const controller = new AbortController();
let timedOut = false;
const timeoutId = setTimeout(() => {
  timedOut = true;
  controller.abort();
}, TIMEOUT_MS);

try {
  const user = await randomResult(1, controller.signal);
  clearTimeout(timeoutId);
  ...
} catch (err) {
  clearTimeout(timeoutId);
  if (err.name === "AbortError" && timedOut) {
    setFetching("error");
    // 시간 초과 메시지
  }
  ...
}
```

## 10. catch 블록 - 여전히 빈 catch

```
} catch{
  setFetching("error");
}
```

- 4주차 review #5에서 지적한 사항. 에러 객체를 무시함.
- 콘솔에 에러 정보가 안 남고, 사용자에게도 자세한 정보 안 보임.

### 해결

```
} catch (err) {
  console.error(err);
  setFetching("error");
  // setStatusMessage 같은 state를 두면 화면에 메시지도 표시 가능
}
```

## 11. `<div style={styles}>` - 여전히 잔존

```
<div style={styles}>
  <textarea id="introduceDetail" ... />
  {warn("introduceDetail") && ...}
</div>
```

- 4주차 review #8에서 지적한 사항. `styles`는 CSS Modules 객체인데 `style` prop에 넘기면 의미 없는 인라인 CSS가 됨.

### 해결 - 그냥 `<div>` 또는 `className` 사용

```
<div>
  <textarea id="introduceDetail" className={styles["inputIntroduce"]} ... />
  {warn("introduceDetail") && ...}
</div>
```

## 12. 정렬 "newest"가 여전히 오름차순 - 4주차 review #10 미해결

```
.sort((a, b) => {
  if (sortType === "newest") return a.id - b.id;   // 오래된 게 위
  ...
});
```

- "최신 업데이트순" 옵션을 선택해도 가장 오래된 멤버가 위에 옴.

### 해결

```
if (sortType === "newest") return b.id - a.id;   // 최신이 위
```

## 13. `type="phone"`, `type="website"` - HTML5에 없는 type

```
<input id="phone" type="phone" ... />
<input id="website" type="website" ... />
```

- HTML5에 `type="phone"`, `type="website"`는 없음. 브라우저가 `type="text"`로 폴백.
- 모바일 키패드/자동완성 혜택 못 받음.

### 해결

```
<input id="phone" type="tel" ... />
<input id="website" type="url" ... />
```

## 14. CSS 오타 `refrash` - 여전히 사용

```
<button className={styles["refrashButton"]} ... />
<span className={styles["refrashState"]} ... />
```

- 4주차 review #15에서 지적한 사항. `refresh`가 맞는 영어.
- 동작에는 영향 없지만 검색/일관성 측면.

### 해결

- CSS Modules에서 `.refrashButton` → `.refreshButton`, `.refrashState` → `.refreshState` 변경
- Page.jsx에서 className 참조도 같이 변경
