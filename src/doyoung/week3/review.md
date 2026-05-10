# 3주차 도영 과제 리뷰

## 1. useState 미사용 - 추가/삭제 동작 안 함

```
import { members } from "./members";

<span className={styles["count"]}>총 {members.length}명</span>
```

- members.js에서 정적으로 import한 배열을 그대로 사용했습니다.
- React state가 아니라서 화면 갱신이 일어나지 않습니다.
- 추가/삭제를 하려면 useState로 관리해야 합니다.

```
import { useState } from "react";
import { members as initialMembers } from "./members";

const [members, setMembers] = useState(initialMembers);

const handleRemoveLast = () => {
  if (members.length === 0) return;
  setMembers((prev) => prev.slice(0, -1));
};
```

- 이렇게 useState로 관리해야 화면이 자동으로 다시 렌더링됩니다.

## 2. DOM 직접 조작 - React 패러다임 위반

```
export function toggleForm() {
  if (document.getElementById("formSection").style.display === "none") {
    document.getElementById("formSection").style.display = "block";
  } else {
    document.getElementById("formSection").style.display = "none";
  }
}

export function handleCancle() {
  document.getElementById("formSection").style.display = "none";
}
```

- React에서 document.getElementById로 DOM 직접 조작은 안티패턴입니다.
- React는 가상 DOM으로 화면을 관리하기 때문에 직접 조작하면 동기화가 깨집니다.
- state로 보여줄지 말지를 관리해야 합니다.

```
const [showForm, setShowForm] = useState(false);

<button onClick={() => setShowForm((prev) => !prev)}>아기 사자 추가</button>

{showForm && (
  <section className={styles["formSection"]}>
    <form>...</form>
  </section>
)}
```

- 이렇게 조건부 렌더링으로 처리하는 게 React 방식입니다.

## 3. handleDeleteLast 호출 형태 오류

```
export function handleDeleteLast(members, setMembers) {
  if (members.length === 0) return;
  setMembers((prev) => prev.slice(0, -1));
}

<button onClick={handleDeleteLast}>...</button>
```

- handleDeleteLast는 (members, setMembers) 매개변수를 받지만
- onClick에서 그냥 함수만 전달하면 클릭 이벤트 객체가 첫 번째 매개변수로 들어갑니다.
- event.length는 undefined, event.slice도 호출되지 않아 에러가 납니다.

```
const handleRemoveLast = () => {
  if (members.length === 0) return;
  setMembers((prev) => prev.slice(0, -1));
};

<button onClick={handleRemoveLast}>...</button>
```

- 컴포넌트 내부에 함수를 정의하고 state를 직접 참조하는 게 좋습니다.

## 4. script.js 파일 자체가 부적절

```
import { useState } from "react";

export function handleDeleteLast(members, setMembers) { ... }
export function toggleForm() { ... }
export function handleCancle() { ... }
```

- useState를 import만 하고 실제로는 사용하지 않고 있습니다.
- React Hook은 컴포넌트 내부 또는 커스텀 훅에서만 사용 가능합니다.
- 일반 .js 파일에서 Hook을 호출하면 React가 에러를 발생시킵니다.
- script.js 파일을 삭제하고 모든 함수를 Page.jsx 컴포넌트 내부로 옮기는 것을 추천합니다.

## 5. 폼 데이터를 읽을 방법 없음

```
<input type="text" className={styles["form"]} id="name" placeholder="..." />
<input type="text" className={styles["form"]} id="email" placeholder="..." />
```

- input에 value/onChange도 없고, name도 없고, useRef도 없습니다.
- 사용자가 입력한 값을 가져올 방법이 전혀 없습니다.
- React에서는 보통 두 가지 방법을 사용합니다.

```
// 방법 1: FormData
<form onSubmit={handleAdd}>
  <input name="name" required />
  <input name="email" type="email" required />
</form>

const handleAdd = (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const name = fd.get("name");
  const email = fd.get("email");
};

// 방법 2: controlled component
const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />
```

- 둘 중 한 방식으로 폼 데이터를 관리해야 합니다.

## 6. 추가하기 버튼에 onClick 없음

```
<button className={styles["btn"]} id="add">
  <p className={styles["btnIcon"]} id="add">추가하기</p>
</button>
```

- 버튼을 눌러도 아무 일도 일어나지 않습니다.
- 폼 제출 처리 함수도 정의되어 있지 않습니다.
- form 안에 있다면 form의 onSubmit을 활용하는 것이 좋습니다.

```
<form onSubmit={handleAddLion}>
  ...
  <button type="submit">추가하기</button>
</form>
```

## 7. 버튼에 type="button" 누락

```
<button onClick={handleDeleteLast}>...</button>
<button onClick={handleCancle}>...</button>
```

- form 안의 button은 기본 type이 "submit"입니다.
- 의도하지 않게 폼이 제출될 수 있습니다.
- submit 버튼이 아니면 명시적으로 type="button"을 적어야 합니다.

```
<button type="button" onClick={handleRemoveLast}>...</button>
```

## 8. required 속성 누락

```
<input type="text" className={styles["form"]} id="name" placeholder="..." />
```

- 빈 값으로도 제출이 가능한 상태입니다.
- 폼 검증을 위해 필수 입력 항목에는 required를 적어주는 것이 좋습니다.

```
<input type="text" name="name" required />
```

## 9. button 안에 p 태그 - 시맨틱 부적절

```
<button>
  <p className={styles["btnIcon"]}>아기 사자 추가</p>
</button>
```

- button 안에 p를 넣는 건 시맨틱적으로 어색합니다.
- 그냥 텍스트를 넣거나 span을 쓰는 게 좋습니다.

```
<button>아기 사자 추가</button>
```

## 10. label 대신 p 사용 - 접근성 위반

```
<p className={styles["text"]}>이름</p>
<input id="name" />
```

- 시각적으로는 label처럼 보이지만 input과 연결되지 않습니다.
- 스크린 리더 사용자가 어떤 input인지 알 수 없습니다.

```
<label htmlFor="lionName">이름</label>
<input id="lionName" name="name" />
```

- htmlFor와 input의 id를 매칭시켜야 접근성이 확보됩니다.

## 11. id="add" 중복

```
<button className={styles["btn"]} id="add">
  <p className={styles["btnIcon"]} id="add">추가하기</p>
</button>
```

- 같은 페이지 안에 동일한 id가 두 개 있습니다.
- HTML id는 페이지 내에서 유일해야 합니다.
- getElementById도 첫 번째 요소만 반환합니다.

## 12. 누락된 기능들

### 12-a. 파트 필터

- 정답에는 ALL/Frontend/Backend/Design 셀렉트 박스로 멤버를 필터링하는 기능이 있습니다.

```
const [partFilter, setPartFilter] = useState("ALL");

const visibleMembers = members.filter(
  (m) => partFilter === "ALL" || m.role === partFilter
);

<select value={partFilter} onChange={(e) => setPartFilter(e.target.value)}>
  <option value="ALL">전체</option>
  <option value="Frontend">Frontend</option>
  <option value="Backend">Backend</option>
  <option value="Design">Design</option>
</select>

{visibleMembers.map((m) => (...))}
```

### 12-b. 카드 클릭 시 상세로 스크롤

- 정답에는 요약 카드 클릭 시 해당 상세 카드로 스크롤되고 잠깐 강조되는 효과가 있습니다.

```
const detailRefs = useRef({});
const [focusedId, setFocusedId] = useState(null);

const handleCardClick = (name) => {
  detailRefs.current[name]?.scrollIntoView({ behavior: "smooth", block: "start" });
  setFocusedId(name);
  setTimeout(() => setFocusedId(null), 900);
};

<article onClick={() => handleCardClick(member.name)}>...</article>

<section
  ref={(el) => { if (el) detailRefs.current[member.name] = el; }}
  className={`${styles["detailcard"]} ${focusedId === member.name ? styles["isFocused"] : ""}`}
>...</section>
```

### 12-c. 빈 상태 메시지

- 정답에는 멤버가 0명이거나 필터 결과가 없을 때 안내 메시지가 표시됩니다.

```
const isEmpty = visibleMembers.length === 0;

{isEmpty ? (
  <p>조건에 맞는 아기사자가 없습니다.</p>
) : (
  visibleMembers.map(...)
)}
```

### 12-d. ESC 키로 폼 닫기

- 정답에는 폼이 열려있을 때 ESC 누르면 폼이 닫힙니다.

```
useEffect(() => {
  if (!showForm) return;
  const handleEsc = (e) => {
    if (e.key === "Escape") setShowForm(false);
  };
  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, [showForm]);
```

## 13. 잘한 점

- 컴포넌트 분리 (SummaryCard, DetailCard, ContactList) 잘 했습니다.
- members.js 데이터 파일 분리 + map함수 활용 잘 했습니다.
- 본인 카드(isMe) 조건부 강조 잘 했습니다.
- h3, h4 시맨틱 태그 사용 좋습니다.

## 14. 핵심 학습 포인트

- 3주차의 핵심은 "DOM 조작에서 React state 관리로의 전환"입니다.
- useState로 데이터 관리 → 자동 리렌더링
- 조건부 렌더링 → DOM display 조작 대신 사용
- useEffect → ESC 키, 외부 이벤트 처리
- useRef → DOM 참조가 꼭 필요할 때만 사용
- 추가/삭제/필터/스크롤 같은 기능들이 React state 패턴으로 깔끔하게 풀립니다.
