# DOM 조작에서 React state 관리로 전환하기

3주차 과제의 핵심을 이해하기 위한 학습 자료입니다.
HTML/JS에서는 직접 DOM을 조작했지만, React에서는 state로 데이터를 관리하면 화면이 알아서 바뀝니다.

---

## 1. React가 화면을 그리는 방식

### 1-a. HTML/JS 방식 (DOM 직접 조작)

```
// 화면에 있는 요소를 직접 찾아서 변경
const el = document.getElementById("count");
el.textContent = "10";
el.style.display = "none";
```

- 데이터가 바뀌면 → 직접 DOM을 찾아서 변경
- 데이터와 화면이 분리되어 있어서 동기화가 어려움

### 1-b. React 방식 (state → 자동 렌더링)

```
const [count, setCount] = useState(0);

return <p>{count}</p>;
```

- state(데이터)가 바뀌면 React가 알아서 화면을 다시 그림
- 데이터와 화면이 항상 동기화됨

### 1-c. 핵심 원칙

- React에서는 document.getElementById, querySelector를 거의 쓰지 않습니다.
- state를 바꾸면 화면이 따라옵니다.
- "어떻게 화면을 바꿀까"가 아니라 "데이터가 어떻게 변할까"를 생각합니다.

---

## 2. useState - 데이터 상태 관리

### 2-a. 기본 문법

```
const [값, 값을_바꾸는_함수] = useState(초기값);
```

```
const [count, setCount] = useState(0);
const [name, setName] = useState("");
const [members, setMembers] = useState([]);
const [showForm, setShowForm] = useState(false);
```

### 2-b. 값 바꾸기

```
// 카운터 증가
setCount(count + 1);
setCount((prev) => prev + 1); // 이전 값 기반

// 배열에 추가
setMembers((prev) => [...prev, newMember]);

// 배열에서 마지막 제거
setMembers((prev) => prev.slice(0, -1));

// 토글
setShowForm((prev) => !prev);
```

### 2-c. 3주차 과제 적용 예시

- 학생 코드 (동작 안 함)

```
import { members } from "./members"; // 정적 import

<button onClick={handleDeleteLast}>삭제</button>
<span>총 {members.length}명</span>
```

- 정답 코드

```
import { members as initialMembers } from "./members";
const [members, setMembers] = useState(initialMembers);

const handleRemoveLast = () => {
  if (members.length === 0) return;
  setMembers((prev) => prev.slice(0, -1));
};

<button onClick={handleRemoveLast}>삭제</button>
<span>총 {members.length}명</span>
```

- members가 state라서 setMembers로 바꾸면 화면이 자동으로 갱신됩니다.

---

## 3. 조건부 렌더링 - 보여주기/숨기기

### 3-a. DOM 방식 (잘못된 방식)

```
function toggleForm() {
  if (document.getElementById("formSection").style.display === "none") {
    document.getElementById("formSection").style.display = "block";
  } else {
    document.getElementById("formSection").style.display = "none";
  }
}
```

- React는 가상 DOM으로 화면을 관리하기 때문에 직접 style을 바꾸면 동기화가 깨집니다.

### 3-b. React 방식

#### 1. && 연산자

```
const [showForm, setShowForm] = useState(false);

{showForm && <FormComponent />}
```

- showForm이 true면 컴포넌트를 보여줌
- false면 아예 렌더링 안 함

#### 2. 삼항 연산자

```
{isLoggedIn ? <Profile /> : <LoginButton />}
```

- 조건에 따라 다른 컴포넌트 렌더링

#### 3. 클래스 토글

```
<div className={isActive ? styles.active : styles.inactive}>
```

```
<div className={`${styles.card} ${isMe ? styles.myCard : ""}`}>
```

### 3-c. 3주차 과제 적용 예시

- 학생 코드

```
// script.js
export function toggleForm() {
  if (document.getElementById("formSection").style.display === "none") {
    document.getElementById("formSection").style.display = "block";
  } else {
    document.getElementById("formSection").style.display = "none";
  }
}

// Page.jsx
<section id="formSection">
  <form>...</form>
</section>
```

- 정답 코드

```
const [showForm, setShowForm] = useState(false);

<button onClick={() => setShowForm((prev) => !prev)}>토글</button>

{showForm && (
  <section className={styles.formSection}>
    <form>...</form>
  </section>
)}
```

---

## 4. useEffect - 사이드 이펙트 처리

### 4-a. 언제 사용?

- 컴포넌트가 마운트(처음 그려질 때) 되거나, state가 바뀔 때
- 외부 이벤트 등록 (keydown, scroll, resize)
- API 호출
- 타이머 (setTimeout, setInterval)

### 4-b. 기본 문법

```
useEffect(() => {
  // 실행할 코드 (마운트 시 + 의존성 배열 값이 변할 때)
  console.log("실행됨");

  return () => {
    // 정리(cleanup) 코드 (언마운트 시 + 다음 실행 전)
    console.log("정리됨");
  };
}, [의존성배열]); // 이 배열의 값이 변하면 다시 실행
```

### 4-c. 의존성 배열에 따른 동작

```
useEffect(() => {...}, []);        // 마운트 시 1번만 실행
useEffect(() => {...}, [count]);   // count가 바뀔 때마다 실행
useEffect(() => {...});            // 매 렌더링마다 실행 (거의 안 씀)
```

### 4-d. 3주차 과제 적용 예시 (ESC 키로 폼 닫기)

```
const [showForm, setShowForm] = useState(false);

useEffect(() => {
  if (!showForm) return; // 폼이 안 열려있으면 무시

  const handleEsc = (e) => {
    if (e.key === "Escape") setShowForm(false);
  };

  window.addEventListener("keydown", handleEsc);

  // cleanup: 폼이 닫히거나 컴포넌트가 사라지면 이벤트 제거
  return () => {
    window.removeEventListener("keydown", handleEsc);
  };
}, [showForm]);
```

- showForm이 true가 되면 keydown 리스너를 등록
- false가 되면 cleanup 함수가 실행되어 리스너 제거
- 메모리 누수 방지

---

## 5. useRef - DOM 직접 참조

### 5-a. 언제 사용?

- DOM 요소에 직접 접근해야 할 때 (예: input.focus(), scrollIntoView)
- 렌더링과 무관한 값을 저장할 때 (예: setTimeout id)

### 5-b. 기본 문법

```
const ref = useRef(null);

<input ref={ref} />

// 사용
ref.current.focus();
ref.current.scrollIntoView({ behavior: "smooth" });
```

### 5-c. 3주차 과제 적용 예시 (카드 클릭 → 상세로 스크롤)

```
const detailRefs = useRef({}); // 여러 요소를 객체로 관리
const [focusedId, setFocusedId] = useState(null);

const handleCardClick = (name) => {
  // 해당 상세 카드로 스크롤
  detailRefs.current[name]?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  // 잠깐 강조
  setFocusedId(name);
  setTimeout(() => setFocusedId(null), 900);
};

<article onClick={() => handleCardClick(member.name)}>요약 카드</article>

<section
  ref={(el) => {
    if (el) detailRefs.current[member.name] = el;
  }}
  className={`${styles.detailcard} ${focusedId === member.name ? styles.isFocused : ""}`}
>
  상세 카드
</section>
```

### 5-d. useRef vs useState 차이

```
const [count, setCount] = useState(0); // 변경 시 화면 다시 그림
const countRef = useRef(0);             // 변경 시 화면 안 다시 그림

setCount(1);              // 리렌더링 발생
countRef.current = 1;     // 리렌더링 안 발생
```

- useState: 값 변경 → 화면 갱신
- useRef: 값 변경 → 화면 갱신 안 됨 (DOM 참조나 백그라운드 값 저장용)

---

## 6. 폼 데이터 다루기

### 6-a. 방법 1: FormData (간단한 폼에 추천)

```
<form onSubmit={handleSubmit}>
  <input name="email" type="email" required />
  <input name="phone" required />
  <button type="submit">제출</button>
</form>

const handleSubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const email = fd.get("email");
  const phone = fd.get("phone");
  console.log(email, phone);
};
```

- input마다 name 속성 필요
- e.preventDefault()로 페이지 새로고침 막기

### 6-b. 방법 2: Controlled Component (실시간 검증 등에 추천)

```
const [name, setName] = useState("");
const [email, setEmail] = useState("");

<input
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
<input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

const handleSubmit = (e) => {
  e.preventDefault();
  console.log(name, email);
};
```

- 입력할 때마다 state 업데이트
- 실시간 검증 가능
- 필드 많으면 관리 번거로움

---

## 7. 종합 예제 - 3주차 과제 미니 버전

```
import { useState, useEffect, useRef } from "react";
import styles from "./Page.module.css";

const initialMembers = [
  { id: 1, name: "김주완", role: "Frontend", isMe: false },
  { id: 2, name: "임도영", role: "Frontend", isMe: true },
];

export default function Week3Page() {
  // 1. 데이터 state
  const [members, setMembers] = useState(initialMembers);
  // 2. UI state
  const [showForm, setShowForm] = useState(false);
  // 3. 필터 state
  const [filter, setFilter] = useState("ALL");
  // 4. ref
  const nameRef = useRef(null);

  // 필터링된 멤버
  const visibleMembers = members.filter(
    (m) => filter === "ALL" || m.role === filter,
  );

  // 5. ESC 키 처리
  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowForm(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showForm]);

  // 6. 폼 열릴 때 자동 포커스
  useEffect(() => {
    if (showForm) nameRef.current?.focus();
  }, [showForm]);

  // 7. 추가 함수
  const handleAdd = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name");
    const role = fd.get("role");
    if (!name || !role) return;

    const nextId = Math.max(...members.map((m) => m.id), 0) + 1;
    setMembers((prev) => [...prev, { id: nextId, name, role, isMe: false }]);
    setShowForm(false);
    e.currentTarget.reset();
  };

  // 8. 삭제 함수
  const handleRemove = () => {
    if (members.length === 0) return;
    setMembers((prev) => prev.slice(0, -1));
  };

  return (
    <div>
      <button type="button" onClick={() => setShowForm((p) => !p)}>
        추가
      </button>
      <button type="button" onClick={handleRemove}>
        삭제
      </button>

      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="ALL">전체</option>
        <option value="Frontend">Frontend</option>
        <option value="Backend">Backend</option>
      </select>

      {showForm && (
        <form onSubmit={handleAdd}>
          <input ref={nameRef} name="name" required />
          <select name="role" required>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
          </select>
          <button type="submit">추가하기</button>
        </form>
      )}

      <ul>
        {visibleMembers.length === 0 ? (
          <li>해당하는 멤버가 없습니다.</li>
        ) : (
          visibleMembers.map((m) => (
            <li
              key={m.id}
              className={`${styles.card} ${m.isMe ? styles.myCard : ""}`}
            >
              {m.name} - {m.role}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
```

- 이 미니 예제만 이해해도 3주차 과제의 80%는 풀립니다.

---

## 8. 패턴 비교 정리

### 8-a. DOM 조작 → React state

```
// HTML/JS
document.getElementById("count").textContent = "10";

// React
const [count, setCount] = useState(0);
setCount(10);
return <p>{count}</p>;
```

### 8-b. style 토글 → 조건부 렌더링

```
// HTML/JS
el.style.display = "none";
el.style.display = "block";

// React
{show && <Component />}
```

### 8-c. 클래스 추가/제거 → 조건부 클래스

```
// HTML/JS
el.classList.add("active");
el.classList.remove("active");

// React
className={isActive ? styles.active : ""}
```

### 8-d. innerHTML → JSX

```
// HTML/JS
el.innerHTML = `<div>${name}</div>`;

// React
return <div>{name}</div>;
```

### 8-e. addEventListener → onClick / useEffect

```
// HTML/JS
button.addEventListener("click", handleClick);

// React (컴포넌트 이벤트)
<button onClick={handleClick}>...</button>

// React (전역 이벤트는 useEffect)
useEffect(() => {
  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, []);
```

---

## 9. 흔히 하는 실수

### 9-a. state를 직접 변경

```
// 잘못된 코드
members.push(newMember);
members.pop();

// 올바른 코드
setMembers((prev) => [...prev, newMember]);
setMembers((prev) => prev.slice(0, -1));
```

- React는 state의 참조가 바뀌어야 변경을 감지합니다.
- 배열/객체를 직접 수정하면 React가 알아채지 못합니다.

### 9-b. 무한 루프

```
// 잘못된 코드
useEffect(() => {
  setCount(count + 1); // count 바뀜 → useEffect 다시 실행 → setCount → ...
});

// 올바른 코드
useEffect(() => {
  setCount(1);
}, []); // 의존성 배열로 1번만 실행
```

### 9-c. cleanup 누락

```
// 잘못된 코드
useEffect(() => {
  window.addEventListener("keydown", handleKey);
  // 정리 안 하면 메모리 누수
}, []);

// 올바른 코드
useEffect(() => {
  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, []);
```

### 9-d. useState를 컴포넌트 외부에서 사용

```
// 잘못된 코드 (script.js 같은 일반 파일)
import { useState } from "react";

export function helper() {
  const [x, setX] = useState(0); // Hook은 컴포넌트 안에서만!
}

// 올바른 코드 (Page.jsx 컴포넌트 안)
function Component() {
  const [x, setX] = useState(0);
}
```

---

## 10. 마무리 체크리스트

3주차 과제를 다시 풀 때 다음을 점검해 보세요.

- [ ] 데이터를 useState로 관리하고 있는가?
- [ ] 추가/삭제 시 setMembers((prev) => ...) 패턴을 쓰고 있는가?
- [ ] 폼 보이기/숨기기를 state + 조건부 렌더링으로 처리하는가?
- [ ] document.getElementById를 안 쓰고 있는가?
- [ ] 필터링은 members.filter()로 하고 있는가?
- [ ] ESC 키 등 외부 이벤트는 useEffect로 등록/해제하는가?
- [ ] DOM 참조가 필요할 때 useRef를 쓰고 있는가?
- [ ] form의 input에 name + required + onSubmit이 있는가?
- [ ] script.js 같이 컴포넌트 외부에 Hook을 두지 않았는가?
- [ ] 빈 상태(0명, 필터 결과 없음) 메시지를 보여주고 있는가?
