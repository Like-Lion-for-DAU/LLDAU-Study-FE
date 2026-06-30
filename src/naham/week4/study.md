# 4주차 학습 가이드 - 안전한 fetch 다루기

3주차에서 React 컴포넌트 구조를 익혔다면, 4주차에서는 "외부 데이터를 가져오는 비동기 작업"을 안전하게 다루는 법을 배웁니다.
이 문서는 review.md의 1~10번 항목을 보충하는 내용입니다.

## 1. 인라인 style vs CSS Modules

JSX 안에서 `style={{ ... }}`를 쓰는 것은 가능하지만 다음과 같은 단점이 있습니다.

- 같은 색/여백을 여러 곳에서 반복 작성해야 함
- 디자인이 바뀌면 여러 컴포넌트를 수정해야 함
- `:hover`, `:focus`, `@media` 같은 의사 클래스/미디어 쿼리를 인라인으로 표현할 수 없음
- 정렬·검색이 어려워서 유지보수성이 떨어짐

### 변환 예시

```
// Before (인라인)
<button style={{ backgroundColor: '#ff7710', color: 'white', marginLeft: '10px' }}>
  랜덤 1명 불러오기
</button>

// After (CSS Modules)
<button className={styles.fetchBtn}>
  랜덤 1명 불러오기
</button>
```

```
/* Page.module.css */
.fetchBtn {
  background-color: #ff7710;
  color: white;
  margin-left: 10px;
}

.fetchBtn:hover:not(:disabled) {
  background-color: #e36608;
}
```

### 여러 클래스를 합치는 법

```
<button
  className={`${styles.fetchBtn} ${isLoading ? styles.isLoading : ""}`}
  disabled={isLoading}
>
  불러오기
</button>
```

## 2. key에 index를 쓰면 안 되는 이유

```
{lions.map((lion, index) => (
  <div key={index}>...</div>
))}
```

이런 식으로 `index`를 key로 쓰면, 목록의 순서가 바뀌거나 중간에서 삭제될 때 React가 잘못된 컴포넌트를 재사용합니다.

### 예시: 정렬 후 input 값이 섞임

1. 사자 3명이 [A, B, C] 순으로 렌더링 (key=0, 1, 2)
2. 사용자가 B의 input에 "hello"를 입력
3. 정렬을 바꿔 [C, B, A] 순이 됨
4. C에 key=0이 붙고, A에 key=2가 붙음
5. React는 "key=0인 컴포넌트는 그대로 두자"고 판단해서 A의 "hello"가 C에게 따라감

### 해결: 고유한 id를 부여

```
const nextIdRef = useRef(initialLions.length + 1);

function makeNextId() {
  const id = nextIdRef.current;
  nextIdRef.current += 1;
  return id;
}

const newLion = { id: makeNextId(), name, part, ... };

{lions.map((lion) => (
  <div key={lion.id}>...</div>
))}
```

- 초기 데이터에도 id를 부여해두면 더 안정적입니다 (`{ id: 1, name: "김나함", ... }`).
- `useState`로 카운터를 관리하면 변경 시 매번 리렌더링이 발생하므로 `useRef`가 적합합니다.

## 3. AbortController - fetch 요청 취소하기

`fetch`는 한 번 시작하면 응답이 올 때까지 멈출 수 없습니다.
하지만 `AbortController`를 사용하면 외부에서 강제로 요청을 중단할 수 있습니다.

### 기본 사용법

```
const controller = new AbortController();

fetch("https://api.example.com/data", { signal: controller.signal })
  .then(res => res.json())
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("요청이 취소되었습니다");
    }
  });

// 어딘가에서 요청을 취소하고 싶을 때
controller.abort();
```

### 컴포넌트에서 사용하는 패턴

```
const controllerRef = useRef(null);

const fetchData = async () => {
  // 이전 요청이 있으면 취소
  if (controllerRef.current) {
    controllerRef.current.abort();
  }

  const controller = new AbortController();
  controllerRef.current = controller;

  try {
    const res = await fetch(url, { signal: controller.signal });
    const data = await res.json();
    setData(data);
  } catch (err) {
    if (err.name === "AbortError") return; // 의도된 취소면 무시
    setError(err.message);
  }
};

// 언마운트 시에도 정리
useEffect(() => {
  return () => {
    controllerRef.current?.abort();
  };
}, []);
```

## 4. Race Condition (경쟁 조건)

빠르게 두 번 요청을 보내면 응답이 도착하는 순서가 보낸 순서와 다를 수 있습니다.

### 문제 상황

```
사용자: [1명 불러오기] 클릭 (서버 응답 2초 걸림, 요청 A)
사용자: [5명 불러오기] 클릭 (서버 응답 0.5초 걸림, 요청 B)

0.5초 후: 요청 B 응답 → setLions(5명)
2.0초 후: 요청 A 응답 → setLions(1명)  ← 사용자가 원한 건 5명인데 1명이 화면에 보임
```

### 해결: 최신 요청 id로 비교

```
const latestRequestIdRef = useRef(0);

const fetchData = async (count) => {
  const requestId = ++latestRequestIdRef.current;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // 응답이 도착했을 때, 내가 아직 최신 요청인지 확인
    if (requestId !== latestRequestIdRef.current) {
      return; // 더 최신 요청이 있으니 내 응답은 무시
    }

    setLions(data);
  } catch (err) { ... }
};
```

`AbortController`와 함께 쓰면, 이전 요청은 abort되고 stale 응답도 무시되어 이중으로 안전합니다.

## 5. 타임아웃 처리

네트워크 상태에 따라 서버 응답이 매우 늦게 올 수 있습니다.
일정 시간이 지나면 강제로 요청을 중단하고 사용자에게 알려주는 게 좋습니다.

```
const TIMEOUT_MS = 5000;

const fetchData = async () => {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    const data = await res.json();
    setData(data);
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      if (timedOut) {
        setError("시간 초과");
      }
      // timedOut이 아니면 사용자가 직접 취소한 것 → 무시
      return;
    }

    setError(err.message);
  }
};
```

## 6. 에러 + 재시도 UI

```
const [errorMessage, setErrorMessage] = useState("");
const lastFetchActionRef = useRef(null);

const fetchData = async (action) => {
  lastFetchActionRef.current = action;
  setErrorMessage("");

  try {
    await action();
  } catch (err) {
    setErrorMessage("불러오기 실패: " + err.message);
  }
};

// UI
{errorMessage && (
  <div className={styles.errorBanner} role="alert">
    {errorMessage}
    <button
      onClick={() => fetchData(lastFetchActionRef.current)}
    >
      재시도
    </button>
  </div>
)}
```

- 마지막에 시도한 작업을 `useRef`에 저장해두면 재시도 버튼이 어떤 작업을 다시 할지 알 수 있습니다.
- `alert`보다 화면 안에 표시하는 게 모바일/사파리에서도 안정적입니다.

## 7. 정체성 있는 랜덤값 생성

같은 사용자에게 매번 다른 part가 부여되면 어색합니다.
사용자의 username이나 uuid 같은 고유값을 시드로 사용하면 같은 사용자에게는 항상 같은 결과가 나옵니다.

```
const PARTS = ["Frontend", "Backend", "Design"];

function pickPart(seedStr) {
  const seed = String(seedStr || "");
  let sum = 0;
  for (let i = 0; i < seed.length; i++) {
    sum += seed.charCodeAt(i);
  }
  return PARTS[sum % PARTS.length];
}

// 같은 username이면 항상 같은 part
pickPart("alice") // "Frontend"
pickPart("alice") // "Frontend"
pickPart("bob")   // "Backend"
```

이미지 URL의 seed도 마찬가지로 사용자 식별자를 넣으면 새로고침해도 같은 이미지가 나옵니다.

```
const imgSrc = `https://picsum.photos/seed/${user.username}/200/200`;
```

## 8. 데이터 파일 분리

```
// src/naham/week4/lions.js
import nhProfile from "./nhprofile.png";
import dyProfile from "./dyprofile.png";
// ...

export const initialLions = [
  {
    id: 1,
    name: "김나함",
    part: "Frontend",
    ...
    image: nhProfile,
  },
  // ...
];

// src/naham/week4/Page.jsx
import { initialLions } from "./lions";

export default function Week4Page() {
  const [lions, setLions] = useState(initialLions);
  ...
}
```

- 컴포넌트 본문이 한눈에 들어옵니다.
- 데이터가 늘어나도 Page.jsx의 줄 수가 폭증하지 않습니다.

## 9. 폼 UX 보강 - 포커스 / reset

```
const formRef = useRef(null);
const nameInputRef = useRef(null);
const openBtnRef = useRef(null);

// 모달이 열릴 때 이름 input에 포커스
useEffect(() => {
  if (showModal) nameInputRef.current?.focus();
}, [showModal]);

// ESC로 모달 닫을 때 원래 버튼으로 포커스 복귀
useEffect(() => {
  if (!showModal) return;
  const onEsc = (e) => {
    if (e.key === "Escape") {
      setShowModal(false);
      openBtnRef.current?.focus();
    }
  };
  window.addEventListener("keydown", onEsc);
  return () => window.removeEventListener("keydown", onEsc);
}, [showModal]);

const handleCancel = () => {
  formRef.current?.reset();
  setShowModal(false);
  openBtnRef.current?.focus();
};

// JSX
<button ref={openBtnRef} onClick={() => setShowModal(true)}>추가</button>

<form ref={formRef} onSubmit={handleSubmit}>
  <input ref={nameInputRef} name="name" required />
  ...
  <button type="button" onClick={handleCancel}>취소</button>
</form>
```

## 10. 정리 - 안전한 fetch 컴포넌트 한 줄 요약

- "취소 가능한 fetch" 한 가지만 익히면 4주차의 절반은 끝납니다.
- AbortController로 이전 요청을 끊고, latestRequestId로 stale 응답을 무시하고, setTimeout으로 타임아웃을 걸고, error state로 화면에 보여주고, lastAction을 저장해 재시도까지 — 이 다섯 가지가 fetch 컴포넌트의 표준 도구입니다.
- 인라인 style 대신 CSS Modules, index key 대신 고유 id — 두 가지 습관만 들이면 React 코드의 안정성이 크게 올라갑니다.
