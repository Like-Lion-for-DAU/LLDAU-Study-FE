# HTML/JS를 React로 변환하기

3주차 과제를 HTML/JS로 작성하셨네요.
다행히 코드 구조가 깔끔해서 React로 변환하면 거의 그대로 활용할 수 있습니다.
이 학습 자료는 현재 작성한 코드를 단계별로 React로 옮기는 방법을 정리했습니다.

---

## 1. React 프로젝트 구조 이해하기

### 1-a. 파일 흐름

```
LLDAU-Study-FE/
├── index.html              ← 프로젝트 루트의 HTML (Vite가 인식)
└── src/
    ├── main.jsx            ← React 앱 진입점
    ├── App.jsx             ← 라우팅 설정
    └── naham/
        └── week3/
            ├── Page.jsx    ← 이 파일이 화면에 렌더링됨
            ├── Page.module.css
            ├── nhprofile.png
            └── ...
```

- 사용자가 `/naham/week3`로 접속하면 Page.jsx가 화면에 렌더링됩니다.
- 즉, 모든 화면 로직은 Page.jsx 안에 있어야 합니다.

### 1-b. Vite는 src/ 안의 index.html을 무시함

- `src/naham/week3/index.html`은 빌드되지 않습니다.
- 같은 폴더의 `script.js`도 어디서 import하지 않으면 실행되지 않습니다.
- 이 두 파일은 작업 흐름 정리 후 삭제하는 것이 좋습니다.

---

## 2. HTML 태그를 JSX로 변환하기

### 2-a. 기본 차이점

- `class` → `className` (JS 예약어와 충돌 방지)
- `for` → `htmlFor` (label 태그)
- 모든 태그는 닫혀야 함 (`<br>` → `<br />`)
- 인라인 스타일은 객체로 (`style="color: red"` → `style={{ color: "red" }}`)

### 2-b. HTML → JSX 변환 예시

HTML

```
<div class="card-grid">
  <div class="summary-card">
    <span class="badge">React</span>
    <img src="./nhprofile.png" alt="김나함 프로필">
    <h3>김나함</h3>
  </div>
</div>
```

JSX (CSS Modules 사용)

```
import styles from "./Page.module.css";
import nhProfile from "./nhprofile.png";

<div className={styles.cardGrid}>
  <div className={styles.summaryCard}>
    <span className={styles.badge}>React</span>
    <img src={nhProfile} alt="김나함 프로필" />
    <h3>김나함</h3>
  </div>
</div>
```

### 2-c. CSS Modules 클래스명 표기

이 프로젝트는 CSS Modules를 사용합니다.

```
// CSS 클래스명에 하이픈 있는 경우
<div className={styles["card-grid"]}>

// camelCase면 더 깔끔
<div className={styles.cardGrid}>
```

- camelCase가 dot notation 가능해서 더 편함.
- CSS 파일에서 `.card-grid` 대신 `.cardGrid`로 작성하면 좋음.

---

## 3. 이미지 import

### 3-a. HTML 방식

```
// HTML
<img src="./nhprofile.png" alt="..." />

// JS 데이터
{ image: "./nhprofile.png" }
```

### 3-b. React 방식

```
import nhProfile from "./nhprofile.png";
import dyProfile from "./dyprofile.png";
import jwProfile from "./jwprofile.gif";
import twProfile from "./twprofile.png";
import smProfile from "./smprofile.png";
import deProfile from "./deprofile.jpg";
import syProfile from "./syprofile.png";

const initialLions = [
  { name: "김나함", image: nhProfile, ... },
  { name: "임도영", image: dyProfile, ... },
  ...
];

<img src={lion.image} alt={`${lion.name} 프로필`} />
```

- import한 변수가 빌드 시점에 올바른 경로로 변환됩니다.
- 상대 경로 문자열은 빌드 후 경로가 깨질 수 있음.

---

## 4. innerHTML/insertAdjacentHTML → map

### 4-a. HTML/JS 방식

```
function render() {
  cardGrid.innerHTML = '';
  babyLions.forEach((lion, index) => {
    const card = `
      <div class="summary-card">
        <span class="badge">${lion.skills.split(',')[0]}</span>
        <img src="${lion.image}" alt="${lion.name} 프로필">
        <h3>${lion.name}</h3>
      </div>
    `;
    cardGrid.insertAdjacentHTML('beforeend', card);
  });
}

render(); // 처음 1번
// 데이터 바뀔 때마다 다시 호출
babyLions.pop();
render();
```

### 4-b. React 방식

```
const [lions, setLions] = useState(initialLions);

return (
  <div className={styles.cardGrid}>
    {lions.map((lion) => (
      <div key={lion.name} className={styles.summaryCard}>
        <span className={styles.badge}>{lion.skills.split(",")[0]}</span>
        <img src={lion.image} alt={`${lion.name} 프로필`} />
        <h3>{lion.name}</h3>
      </div>
    ))}
  </div>
);

// 데이터 바뀌면 자동으로 다시 렌더링됨
setLions((prev) => prev.slice(0, -1));
```

- React는 lions가 바뀌면 알아서 화면을 다시 그립니다.
- render() 함수를 직접 호출할 필요 없음.

---

## 5. classList 토글 → 조건부 렌더링

### 5-a. HTML/JS 방식

```
<div id="modal-overlay" class="modal-overlay hidden">...</div>

document.getElementById('open-add-modal').onclick = () => {
  modal.classList.remove('hidden');
};
document.getElementById('close-modal').onclick = () => {
  modal.classList.add('hidden');
};
```

### 5-b. React 방식

```
const [showModal, setShowModal] = useState(false);

<button onClick={() => setShowModal(true)}>모달 열기</button>

{showModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      ...
      <button onClick={() => setShowModal(false)}>취소</button>
    </div>
  </div>
)}
```

- showModal이 true일 때만 모달 JSX가 렌더링됨.
- false면 DOM에 아예 없음.

---

## 6. document.getElementById('xxx').value → name + FormData

### 6-a. HTML/JS 방식

```
<form id="add-lion-form">
  <input id="name" />
  <input id="email" type="email" />
</form>

form.onsubmit = (e) => {
  e.preventDefault();
  const newLion = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
  };
};
```

### 6-b. React 방식

```
<form onSubmit={handleSubmit}>
  <input name="name" required />
  <input name="email" type="email" required />
</form>

const handleSubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const newLion = {
    name: fd.get("name"),
    email: fd.get("email"),
  };
  setLions((prev) => [...prev, newLion]);
  e.target.reset();
};
```

- `id` 대신 `name`을 사용하면 FormData로 한 번에 추출 가능.
- 코드가 짧아지고 필드 추가/제거 쉬움.

---

## 7. button onclick → onClick (이벤트 처리)

### 7-a. HTML/JS 방식

```
<button id="delete-last-btn">삭제</button>

document.getElementById('delete-last-btn').onclick = () => {
  babyLions.pop();
  render();
};
```

### 7-b. React 방식

```
const handleRemoveLast = () => {
  setLions((prev) => prev.slice(0, -1));
};

<button onClick={handleRemoveLast}>삭제</button>
```

- 이벤트 핸들러를 JSX 안에 직접 연결.
- 컴포넌트 안에 함수 정의 → state 직접 참조.

---

## 8. 단계별 변환 가이드

### 8-a. Step 1: 데이터 import + state 등록

```
// Page.jsx
import { useState } from "react";
import styles from "./Page.module.css";
import nhProfile from "./nhprofile.png";
import dyProfile from "./dyprofile.png";
import jwProfile from "./jwprofile.gif";
import twProfile from "./twprofile.png";
import smProfile from "./smprofile.png";
import deProfile from "./deprofile.jpg";
import syProfile from "./syprofile.png";

const initialLions = [
  { name: "김나함", part: "Frontend", intro: "...", bio: "...",
    skills: "JavaScript, HTML / CSS", email: "...", phone: "...",
    image: nhProfile },
  // ... 나머지 6명
];

export default function Week3Page() {
  const [lions, setLions] = useState(initialLions);
  // ...
}
```

### 8-b. Step 2: 카드 렌더링

```
return (
  <div className={styles.weekPage}>
    <div className={styles.cardGrid}>
      {lions.map((lion) => (
        <div key={lion.name} className={styles.summaryCard}>
          <span className={styles.badge}>{lion.skills.split(",")[0]}</span>
          <img src={lion.image} alt={`${lion.name} 프로필`} />
          <h3>{lion.name}</h3>
          <span>{lion.part}</span>
          <p>{lion.intro}</p>
        </div>
      ))}
    </div>
  </div>
);
```

### 8-c. Step 3: 추가/삭제 버튼

```
const handleRemoveLast = () => {
  setLions((prev) => prev.slice(0, -1));
};

<div className={styles.controls}>
  <button onClick={() => setShowModal(true)}>아기사자 추가</button>
  <button onClick={handleRemoveLast}>마지막 삭제</button>
  <span>총 {lions.length}명</span>
</div>
```

### 8-d. Step 4: 모달 + 폼

```
const [showModal, setShowModal] = useState(false);

const handleSubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);

  const newLion = {
    name: fd.get("name"),
    part: fd.get("part"),
    skills: fd.get("skills"),
    intro: fd.get("intro"),
    bio: fd.get("bio"),
    email: fd.get("email"),
    phone: fd.get("phone"),
    image: `https://picsum.photos/seed/${Date.now()}/200/200`,
  };

  setLions((prev) => [...prev, newLion]);
  setShowModal(false);
  e.target.reset();
};

{showModal && (
  <div
    className={styles.modalOverlay}
    onClick={() => setShowModal(false)}
  >
    <form
      className={styles.modalContent}
      onClick={(e) => e.stopPropagation()}
      onSubmit={handleSubmit}
    >
      <label htmlFor="name">이름</label>
      <input id="name" name="name" required />

      <label htmlFor="part">파트</label>
      <select id="part" name="part" required>
        <option value="Frontend">Frontend</option>
        <option value="Backend">Backend</option>
        <option value="Design">Design</option>
      </select>

      <label htmlFor="skills">관심 기술</label>
      <input id="skills" name="skills" required />

      <label htmlFor="intro">한 줄 소개</label>
      <input id="intro" name="intro" required />

      <label htmlFor="bio">자기소개</label>
      <textarea id="bio" name="bio" required />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="phone">Phone</label>
      <input id="phone" name="phone" type="tel" required />

      <button type="submit">추가하기</button>
      <button type="button" onClick={() => setShowModal(false)}>취소</button>
    </form>
  </div>
)}
```

---

## 9. 종합 예제 - HTML/JS를 React로 옮긴 결과

```
import { useState } from "react";
import styles from "./Page.module.css";
import nhProfile from "./nhprofile.png";
import dyProfile from "./dyprofile.png";
import jwProfile from "./jwprofile.gif";
import twProfile from "./twprofile.png";
import smProfile from "./smprofile.png";
import deProfile from "./deprofile.jpg";
import syProfile from "./syprofile.png";

const initialLions = [
  {
    name: "김나함",
    part: "Frontend",
    intro: "분야를 넘나들며 성장하는 개발자입니다.",
    bio: "동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다.",
    skills: "JavaScript, HTML / CSS",
    email: "naham9488@gmail.com",
    phone: "010-3626-9488",
    image: nhProfile,
    isMe: true,
  },
  {
    name: "임도영",
    part: "Frontend",
    intro: "아기사자 14기 프론트엔드 임도영입니다.",
    bio: "동아대 26학번 컴퓨터공학과 임도영입니다.",
    skills: "HTML/CSS, JavaScript, JAVA, C/C++",
    email: "dlaehdud342@naver.com",
    phone: "010-3516-6306",
    image: dyProfile,
  },
  // ... 나머지 5명도 동일한 형식
];

export default function Week3Page() {
  const [lions, setLions] = useState(initialLions);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const newLion = {
      name: fd.get("name"),
      part: fd.get("part"),
      skills: fd.get("skills"),
      intro: fd.get("intro"),
      bio: fd.get("bio"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      image: `https://picsum.photos/seed/${Date.now()}/200/200`,
    };

    setLions((prev) => [...prev, newLion]);
    setShowModal(false);
    e.target.reset();
  };

  const handleRemoveLast = () => {
    setLions((prev) => prev.slice(0, -1));
  };

  return (
    <div className={styles.weekPage}>
      <div className={styles.controls}>
        <button onClick={() => setShowModal(true)}>아기사자 추가</button>
        <button onClick={handleRemoveLast}>마지막 삭제</button>
        <span>총 {lions.length}명</span>
      </div>

      <div className={styles.cardGrid}>
        {lions.map((lion) => (
          <div
            key={lion.name}
            className={`${styles.summaryCard} ${lion.isMe ? styles.myCard : ""}`}
          >
            <span className={styles.badge}>
              {lion.skills.split(",")[0].trim()}
            </span>
            <img
              src={lion.image}
              alt={`${lion.name} 프로필`}
              onError={(e) => {
                e.target.src = "https://picsum.photos/id/64/400/300";
              }}
            />
            <h3>{lion.name}</h3>
            <span>{lion.part}</span>
            <p>{lion.intro}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <form
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <label htmlFor="name">이름</label>
            <input id="name" name="name" required />

            <label htmlFor="part">파트</label>
            <select id="part" name="part" required>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Design">Design</option>
            </select>

            <label htmlFor="skills">관심 기술 (쉼표로 구분)</label>
            <input id="skills" name="skills" required />

            <label htmlFor="intro">한 줄 소개</label>
            <input id="intro" name="intro" required />

            <label htmlFor="bio">자기소개</label>
            <textarea id="bio" name="bio" required />

            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />

            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" required />

            <button type="submit">추가하기</button>
            <button type="button" onClick={() => setShowModal(false)}>
              취소
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
```

---

## 10. HTML/JS 패턴과 React 패턴 매핑

- `class="x"` → `className={styles.x}` 또는 `className={styles["x"]}`
- `<img src="./a.png">` → `import a from "./a.png"; <img src={a} />`
- `<div class="hidden">` 토글 → `{show && <div>...</div>}`
- `let data = [...]` → `const [data, setData] = useState([...])`
- `data.push(x); render()` → `setData(prev => [...prev, x])`
- `data.pop(); render()` → `setData(prev => prev.slice(0, -1))`
- `document.getElementById('x').value` → `<input name="x" />` + `FormData`
- `element.classList.add/remove("hidden")` → `useState(boolean)` + 조건부 렌더링
- `element.innerHTML = '...'` → JSX 직접 작성
- `array.forEach(...) + insertAdjacentHTML` → `array.map(...)`
- `button.onclick = fn` → `<button onClick={fn} />`
- `form.onsubmit = fn` → `<form onSubmit={fn} />`

---

## 11. 학습 체크리스트

이미 잘 한 것은 [v], 보완할 것은 [ ]로 표시했습니다.

- [v] 데이터 구조 잘 짰음 (initialLions 7명)
- [v] 폼에 required, type 속성 일관성 있게 적용
- [v] 이미지 onerror로 fallback 처리
- [v] CSS 모듈 클래스 분리
- [v] skills.split(',')[0]으로 첫 번째 기술 추출
- [ ] index.html, script.js 삭제 (Page.jsx로 옮긴 후)
- [ ] Page.jsx에 useState로 데이터 관리
- [ ] 이미지 import로 변경 (./xxx.png → import xxx from "./xxx.png")
- [ ] map으로 카드 렌더링
- [ ] 모달을 조건부 렌더링으로
- [ ] 폼을 FormData + onSubmit으로
- [ ] DOM 직접 조작 제거
- [ ] 본인(김나함) 카드 isMe 강조
- [ ] 파트 필터 구현
- [ ] 빈 상태 메시지
- [ ] ESC 키로 모달 닫기
- [ ] 모달 backdrop 클릭으로 닫기

---

## 12. 추가 학습 자료

- [React 공식 문서 - state](https://ko.react.dev/learn/state-a-components-memory)
- [React 공식 문서 - 폼](https://ko.react.dev/reference/react-dom/components/form)
- [React 공식 문서 - 조건부 렌더링](https://ko.react.dev/learn/conditional-rendering)
- [React 공식 문서 - 리스트 렌더링](https://ko.react.dev/learn/rendering-lists)
