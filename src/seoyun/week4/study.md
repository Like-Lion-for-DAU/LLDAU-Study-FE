# 4주차 학습 가이드 - HTML/JS/CSS를 React로 옮기는 법

서윤님이 작성한 index.html / script.js / style.css를 우리 프로젝트(Vite + React + CSS Modules)에 맞게 옮기는 단계를 정리합니다.
이번에는 변환본을 직접 올려두었으니, 코드를 보면서 이 가이드와 비교해보세요.

## 0. 프로젝트 구조 이해

```
LLDAU-Study-FE/
├── index.html                    // Vite가 인식하는 유일한 HTML (수정 X)
├── src/
│   └── seoyun/
│       └── week4/
│           ├── Page.jsx          // 화면에 렌더링되는 컴포넌트
│           ├── Page.module.css   // 이 컴포넌트 전용 CSS
│           ├── lions.js          // 데이터 분리 파일
│           └── pfp.png           // 이미지는 import해서 사용
```

- 우리 프로젝트는 `LLDAU-Study-FE/index.html` 하나만 빌드됩니다.
- `src/seoyun/week4/index.html`은 무시됩니다.
- 컴포넌트의 진입점은 항상 `Page.jsx`입니다.

## 1. HTML 정적 데이터 → JavaScript 배열로

### Before (index.html)

```
<li class="summary-card summary-card--mine">
  <img src="pfp.png" alt="정서윤 프로필 이미지" />
  <span class="badge">TypeScript</span>
  <h2 class="card-name">정서윤</h2>
  ...
</li>
<li class="summary-card">
  <img src="https://images.unsplash.com/photo-..." />
  ...
</li>
```

- 10명을 HTML에 직접 적어두고, script.js의 `initFromDOM`이 다시 DOM에서 텍스트를 긁어와 객체로 변환하는 흐름이었습니다.
- React에서는 데이터를 먼저 자바스크립트로 작성하고, 그 데이터로 화면을 그립니다.

### After (lions.js)

```
import pfp from "./pfp.png";

export const initialMembers = [
  {
    id: 1,
    name: "정서윤",
    part: "Frontend",
    badge: "TypeScript",
    intro: "열심히 배워가고있는 프론트엔드 개발자입니다!",
    image: pfp,
    isMine: true,
    club: "디스이즈",
    about: "안녕하세요, 프론트엔드를 맡고 있는...",
    skills: ["TypeScript — 타입 기반 개발", ...],
    email: "t01021124995@gmail.com",
    phone: "010-3846-5638",
    website: "https://github.com/dkjksd",
    quote: "기초를 탄탄히 다지며...",
  },
  ...
];
```

### 이미지 처리

- 로컬 이미지(`pfp.png`)는 `import pfp from "./pfp.png"`로 가져온 뒤 `image: pfp`로 할당합니다.
- 외부 URL은 그대로 문자열로 두면 됩니다.

## 2. document.getElementById / addEventListener → React state + onClick

### Before

```
<button id="btn-toggle-form" class="btn">아기 사자 추가</button>
<div id="form-wrapper" class="form-wrapper" hidden>...</div>

// script.js
document.getElementById('btn-toggle-form').addEventListener('click', toggleForm);

function toggleForm() {
  const wrapper = document.getElementById('form-wrapper');
  wrapper.hidden = !wrapper.hidden;
}
```

### After

```
const [showForm, setShowForm] = useState(false);

<button
  type="button"
  className={styles["btn"]}
  onClick={() => setShowForm((prev) => !prev)}
>
  아기 사자 추가
</button>

{showForm && (
  <div className={styles["form-wrapper"]}>
    <form>...</form>
  </div>
)}
```

- `hidden` 속성을 직접 조작하는 대신, state로 보이고/숨김을 결정합니다.
- 조건부 렌더링(`{showForm && <div>...</div>}`)이 더 직관적입니다.

## 3. innerHTML 렌더링 → JSX map

### Before

```
function createSummaryCardHTML(member) {
  return `
    <li class="summary-card${mineClass}">
      <img src="${member.image}" alt="${member.name} 프로필 이미지" />
      <span class="badge">${member.badge}</span>
      <h2 class="card-name">${member.name}</h2>
      ...
    </li>`;
}
cardGrid.innerHTML = filtered.map(createSummaryCardHTML).join('');
```

### After

```
{visibleMembers.map((m) => (
  <li
    key={m.id}
    className={`${styles["summary-card"]} ${
      m.isMine ? styles["summary-card--mine"] : ""
    }`}
  >
    <img src={m.image} alt={`${m.name} 프로필 이미지`} />
    <span className={styles["badge"]}>{m.badge}</span>
    <h2 className={styles["card-name"]}>{m.name}</h2>
    ...
  </li>
))}
```

핵심 차이:

- `innerHTML`은 문자열을 HTML로 파싱하지만, JSX는 React가 가상 DOM으로 직접 만들어 그립니다.
- 변수를 끼워 넣을 때는 `${...}` 대신 `{...}`를 씁니다.
- `class` 대신 `className`을 사용합니다.
- 동적 클래스 조합은 템플릿 문자열로: `` `${styles["a"]} ${조건 ? styles["b"] : ""}` ``
- **key prop은 데이터의 고유 id를 사용하세요**. index는 정렬·필터 시 버그를 만듭니다.

## 4. form input - getElementById → controlled component

### Before

```
<input type="text" id="f-name" required />

function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('f-name').value.trim();
  const part = document.getElementById('f-part').value;
  ...
}
```

### After

```
const [formData, setFormData] = useState({
  name: "",
  part: "",
  skills: "",
  ...
});

const handleInput = (field) => (e) => {
  setFormData((prev) => ({ ...prev, [field]: e.target.value }));
};

<input
  id="f-name"
  type="text"
  value={formData.name}
  onChange={handleInput("name")}
  required
/>

const handleSubmit = (e) => {
  e.preventDefault();
  const name = formData.name.trim();
  ...
};
```

장점:

- 입력 즉시 state가 갱신되어 "랜덤 값 채우기" 같은 기능에서 `setFormData({...})`만 호출하면 input이 자동으로 갱신됩니다.
- `value`가 state와 묶여 있어 "현재 무슨 값이 들어있는지"를 항상 알 수 있습니다.

## 5. style.css → Page.module.css

### style.css의 문제

```
*, *::before, *::after { box-sizing: border-box; }
body { font-family: ...; background-color: ...; }
main { max-width: 1200px; }
.btn { ... }
.card-grid { ... }
```

- 그냥 `import "./style.css"` 하면 전역 CSS가 되어 다른 페이지(다른 사람들의 week 폴더)에 영향을 줍니다.
- `body`, `*` 셀렉터는 전체 문서에 적용됩니다.

### Page.module.css 패턴

```
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
  background-color: #f0f2f5;
  color: #1a1a2e;
  line-height: 1.6;
}

.container *,
.container *::before,
.container *::after {
  box-sizing: border-box;
}

.btn {
  padding: 8px 18px;
  border-radius: 20px;
  ...
}

.btn:hover:not(:disabled) {
  background-color: #1a1a2e;
  color: #fff;
}
```

핵심 변환 규칙:

- `body` → `.container` 클래스로 옮기고 컴포넌트 최상위에 적용
- `*` 전역 reset → `.container *`로 한정
- `main` 태그 셀렉터 → `.container` 클래스 셀렉터
- 클래스명은 그대로(kebab-case 유지) — JSX에서 `styles["btn"]`, `styles["card-grid"]` 식으로 접근

### JSX에서 CSS Modules 사용

```
import styles from "./Page.module.css";

<main className={styles["container"]}>
  <button className={styles["btn"]}>...</button>
  <ul className={styles["card-grid"]}>
    <li className={styles["summary-card"]}>...</li>
  </ul>
</main>
```

### 여러 클래스 조합

```
// BEM 변형 클래스 (summary-card + summary-card--mine)
className={`${styles["summary-card"]} ${
  m.isMine ? styles["summary-card--mine"] : ""
}`}

// 동적 색상 클래스 (card-part--frontend)
className={`${styles["card-part"]} ${
  styles[`card-part--${m.part.toLowerCase()}`] || ""
}`}
```

## 6. fetch에 AbortController + latestRequestId 추가

### Before

```
let isLoading = false;
let lastFetchFn = null;

async function fetchAndAdd(count) {
  if (isLoading) return;
  lastFetchFn = () => fetchAndAdd(count);
  setStatus('loading');

  try {
    const res = await fetch(url);
    const data = await res.json();
    data.results.forEach((u) => members.push(mapApiUser(u)));
    renderView();
    setStatus('success');
  } catch (err) {
    setStatus('error', err.message);
  }
}
```

문제:

- 빠르게 두 번 클릭하면 두 응답이 모두 처리됨
- 컴포넌트 unmount 후 setState 호출 가능
- 무한정 대기 (타임아웃 없음)

### After

```
const latestControllerRef = useRef(null);
const latestRequestIdRef = useRef(0);
const lastFetchActionRef = useRef(null);
const TIMEOUT_MS = 5000;

async function runFetchAction(actionFn) {
  const requestId = ++latestRequestIdRef.current;
  lastFetchActionRef.current = actionFn;

  // 1) 이전 요청 취소
  if (latestControllerRef.current) latestControllerRef.current.abort();
  const controller = new AbortController();
  latestControllerRef.current = controller;

  // 2) 타임아웃 설정
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  setFetchStatus("loading");

  try {
    await actionFn({
      signal: controller.signal,
      isLatest: () => requestId === latestRequestIdRef.current,
    });

    // 3) stale 응답 무시
    if (requestId !== latestRequestIdRef.current) return;
    clearTimeout(timeoutId);
    setFetchStatus("success");
  } catch (err) {
    if (requestId !== latestRequestIdRef.current) return;
    clearTimeout(timeoutId);

    if (err.name === "AbortError" && timedOut) {
      setErrorMessage("불러오기 실패: 시간 초과");
      setFetchStatus("error");
      return;
    }
    if (err.name === "AbortError") return; // 사용자 취소

    setErrorMessage(`불러오기 실패: ${err.message}`);
    setFetchStatus("error");
  }
}

const handleFetchAdd = (count) =>
  runFetchAction(async (ctx) => {
    const users = await fetchRandomUsers(count, ctx.signal);
    if (!ctx.isLatest()) return;
    const newOnes = users.map((u) => mapApiUser(u, makeNextId()));
    setMembers((prev) => [...prev, ...newOnes]);
  });
```

다섯 가지 안전장치:

1. AbortController로 이전 요청 취소
2. latestRequestId로 stale 응답 무시
3. setTimeout으로 타임아웃 (5초)
4. AbortError는 사용자 취소 vs 타임아웃으로 구별
5. errorMessage state로 화면에 표시 + lastFetchActionRef로 재시도

## 7. setTimeout / AbortController cleanup

컴포넌트가 unmount되어도 setTimeout 콜백과 fetch는 살아있습니다.

```
const statusResetTimerRef = useRef(null);

useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    if (latestControllerRef.current) latestControllerRef.current.abort();
  };
}, []);
```

- useEffect의 return 함수는 unmount 시점에 실행됩니다.
- timer를 clearTimeout으로 정리하고, 진행 중인 fetch를 abort합니다.

## 8. useRef로 id 카운터

Date.now()는 같은 ms에 호출되면 중복됩니다. useRef로 단조 증가 카운터를 만드세요.

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

// 사용
const newMember = { id: makeNextId(), ... };
const newOnes = users.map((u) => mapApiUser(u, makeNextId()));
```

- useState가 아닌 useRef인 이유: id 카운터는 화면 갱신과 무관하므로 변경 시 리렌더링이 필요 없음.

## 9. 이미지 fallback

```
<img
  src={m.image}
  alt={`${m.name} 프로필 이미지`}
  onError={(e) => {
    e.currentTarget.onerror = null; // 무한 루프 방지
    e.currentTarget.src = `https://picsum.photos/seed/${m.id}/400/280`;
  }}
/>
```

- 외부 URL이 404이거나 차단되면 onError가 실행됩니다.
- `onerror = null`을 먼저 하지 않으면 fallback 이미지가 또 실패할 때 무한 루프가 돕니다.

## 10. 모달 폼 UX - 포커스 / ESC

### 자동 포커스

```
const nameInputRef = useRef(null);

useEffect(() => {
  if (showForm) {
    nameInputRef.current?.focus();
  }
}, [showForm]);

<input ref={nameInputRef} id="f-name" ... />
```

### ESC로 닫기

```
useEffect(() => {
  if (!showForm) return;
  const onEsc = (e) => {
    if (e.key === "Escape") {
      setShowForm(false);
      addBtnRef.current?.focus(); // 원래 버튼으로 포커스 복귀
    }
  };
  window.addEventListener("keydown", onEsc);
  return () => window.removeEventListener("keydown", onEsc);
}, [showForm]);
```

## 11. 빠른 변환 매핑 정리

- HTML `<li class="x">` → JSX `<li className={styles["x"]}>`
- `id`로 element 찾기 → useState로 데이터 관리 + ref가 필요하면 useRef
- `addEventListener('click', fn)` → `onClick={fn}`
- `innerHTML = htmlString` → `{array.map((item) => <Element />)}`
- `wrapper.hidden = true` → `{showWrapper && <div>...</div>}`
- `input.value` 읽기 → `formData.fieldName` (controlled)
- `input.value = "x"` 쓰기 → `setFormData((prev) => ({...prev, fieldName: "x"}))`
- `alert(msg)` → `setErrorMessage(msg)` + 화면 표시
- `style.css` → `Page.module.css`
- 전역 `body` → `.container` 클래스
- `class="a"` → `className={styles["a"]}`

## 12. 마무리

서윤님의 코드는 데이터 모델링, 프리셋 분리, fetch 상태 관리, 재시도 패턴, isMine 보존 등 React로 옮길 준비가 이미 잘 되어 있었습니다.
지금 올려둔 변환본(Page.jsx, Page.module.css, lions.js)을 실행해보면서:

1. 같은 동작이 React에서는 어떻게 표현되는지
2. AbortController/타임아웃/cleanup이 왜 필요한지
3. CSS Modules가 어떻게 전역 누수를 막는지

세 가지를 중심으로 살펴보시면 다음 주차부터는 처음부터 React로 작성하실 수 있을 것입니다.
