# 3주차 나함 과제 리뷰

3주차 과제는 React로 작성해야 하는데 index.html과 script.js로 작성하셨습니다.
Vite + React 프로젝트는 컴포넌트(Page.jsx)에서 작성한 코드가 화면에 렌더링되며,
지금처럼 Page.jsx에 "3주차" 텍스트만 있으면 다른 파일을 아무리 잘 만들어도 화면에 보이지 않습니다.

다행히 HTML과 script.js의 구조는 깔끔하게 잘 작성하셨기 때문에,
이를 React 컴포넌트로 변환하기만 하면 됩니다.
같은 폴더의 study.md에 단계별 변환 가이드를 정리했으니 참고하세요.

## 1. Page.jsx에 실제 코드가 없음

```
import styles from "./Page.module.css";

export default function Week3Page() {
  return (
    <div className={styles["week-page"]}>
      <h2>3주차</h2>
    </div>
  );
}
```

- 화면에는 "3주차"만 표시됩니다.
- index.html과 script.js에 작성한 코드는 React 프로젝트에서 실행되지 않습니다.
- 이 프로젝트는 main.jsx → App.jsx → Page.jsx 흐름으로 컴포넌트만 렌더링합니다.

## 2. index.html과 script.js를 사용하면 안 되는 이유

```
src/naham/week3/
├── index.html       // 사용 안 됨
├── script.js        // 사용 안 됨
├── Page.jsx         // 이게 실제 렌더링되는 파일
├── Page.module.css
├── nhprofile.png    // 이미지 파일들은 활용 가능
└── ...
```

- Vite는 프로젝트 루트의 `index.html`만 인식합니다 (현재 프로젝트에선 `LLDAU-Study-FE/index.html`).
- `src/naham/week3/index.html`은 빌드 산출물에 포함되지 않고, 직접 열어도 import 경로 등이 작동하지 않습니다.
- `script.js`는 `Page.jsx`에서 import하지 않으면 실행되지 않습니다.
- React 프로젝트에서는 모든 화면 로직을 `.jsx` 컴포넌트 안에서 작성합니다.

## 3. DOM 직접 조작 - React 패러다임 위반

```
// script.js
function render() {
  cardGrid.innerHTML = '';
  babyLions.forEach((lion, index) => {
    const card = `<div class="summary-card">...</div>`;
    cardGrid.insertAdjacentHTML('beforeend', card);
  });
}

document.getElementById('open-add-modal').onclick = () => {
  form.classList.remove('hidden');
  modal.classList.remove('hidden');
};

document.getElementById('delete-last-btn').onclick = () => {
  babyLions.pop();
  render();
};
```

- `document.getElementById`, `innerHTML`, `classList.add/remove` 모두 DOM 직접 조작입니다.
- React에서는 데이터(state)를 바꾸면 화면이 자동으로 갱신됩니다.
- React 안에서 DOM 직접 조작은 가상 DOM과 동기화가 깨져 권장되지 않습니다.

```
// React 방식
const [lions, setLions] = useState(initialLions);
const [showModal, setShowModal] = useState(false);

// state 바꾸기
setLions((prev) => prev.slice(0, -1));
setShowModal(true);

// 화면은 lions, showModal 값에 따라 자동 렌더링
{lions.map((lion) => <Card key={lion.name} lion={lion} />)}
{showModal && <Modal />}
```

## 4. 일반 변수로 데이터 관리

```
let babyLions = [...initialLions];

document.getElementById('delete-last-btn').onclick = () => {
  babyLions.pop();  // 변수 직접 변경
  render();         // 수동으로 화면 다시 그림
};
```

- `babyLions`가 일반 변수라 React가 변경을 감지하지 못합니다.
- 변경할 때마다 `render()`를 호출해야 화면이 갱신됩니다.

```
// React에서는 useState 사용
const [babyLions, setBabyLions] = useState(initialLions);

// 변경하면 자동으로 화면 갱신 (render 호출 불필요)
setBabyLions((prev) => prev.slice(0, -1));
```

## 5. 이미지 경로 - React에서는 import 필요

```
// script.js
{
  name: "김나함",
  image: "./nhprofile.png"  // 상대 경로 문자열
}

// HTML
<img src="./nhprofile.png" />
```

- HTML에서는 상대 경로가 동작하지만, React/Vite에서는 빌드 시점에 import해야 합니다.
- 이미지를 import하지 않으면 빌드 후 경로가 깨집니다.

```
// React 방식
import nhProfile from "./nhprofile.png";
import dyProfile from "./dyprofile.png";

const initialLions = [
  {
    name: "김나함",
    image: nhProfile,  // import한 변수
    ...
  },
];
```

- 또는 `public/` 폴더에 두고 절대 경로로 사용 가능.

## 6. classList로 hidden 토글 - React에서는 조건부 렌더링

```
// HTML/JS
<div id="modal-overlay" class="modal-overlay hidden">...</div>

modal.classList.remove('hidden');  // 보이기
modal.classList.add('hidden');     // 숨기기
```

```
// React
const [showModal, setShowModal] = useState(false);

{showModal && (
  <div className={styles.modalOverlay}>...</div>
)}

// 보이기
setShowModal(true);

// 숨기기
setShowModal(false);
```

- 조건부 렌더링이 더 직관적이고 React스럽습니다.

## 7. 폼 input 값 가져오기

```
// HTML/JS - getElementById로 값 추출
form.onsubmit = (e) => {
  e.preventDefault();
  const newLion = {
    name: document.getElementById('name').value,
    part: document.getElementById('part').value,
    ...
  };
};
```

```
// React - FormData 또는 controlled component
const handleSubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const newLion = {
    name: fd.get("name"),
    part: fd.get("part"),
    ...
  };
};

<form onSubmit={handleSubmit}>
  <input name="name" required />
  <select name="part" required>...</select>
</form>
```

- `id` 대신 `name` 속성을 사용하면 FormData로 한 번에 추출 가능.

## 8. 잘한 점 (HTML/JS 코드 기준)

- 데이터 구조 깔끔하게 잘 짰습니다 (initialLions 배열).
- 멤버 7명의 정보를 모두 채웠습니다.
- 폼에 required 속성 일관성 있게 적용했습니다.
- type="email", type="tel", type="url"로 HTML 기본 검증 활용했습니다.
- onerror 속성으로 이미지 로드 실패 시 fallback 처리했습니다.
- 모달 패턴을 시도했습니다 (form-row, form-group으로 레이아웃 구성).
- skills를 split(',')[0]으로 첫 번째 기술을 badge에 표시했습니다.
- 멤버 이미지 파일들을 폴더에 잘 정리했습니다 (nhprofile.png 등 7개).

## 9. 핵심 학습 포인트

- HTML/JS 코드를 Page.jsx로 변환해야 합니다..
- 다행히 데이터 구조와 폼 구조는 잘 짰기 때문에, React 패턴으로 옮기기만 하면 됩니다.
- 변환 단계: useState로 데이터 관리 → 조건부 렌더링으로 모달 → FormData로 폼 → import로 이미지.
- 같은 폴더의 study.md에 HTML/JS → React 변환 단계별 가이드를 정리했으니 참고하세요.
