# 4주차 서윤 과제 리뷰

과제는 React로 작성해야 하는데 index.html, script.js, style.css로 작성하셨습니다.
Vite + React 프로젝트는 컴포넌트(Page.jsx)에서 작성한 코드가 화면에 렌더링되며,
지금처럼 Page.jsx에 "4주차" 텍스트만 있으면 다른 파일을 아무리 잘 만들어도 화면에 보이지 않습니다.

다행히 HTML과 script.js의 구조 자체는 잘 짜셨기 때문에,
React 패러다임으로 옮기기만 하면 됩니다.
이번에는 직접 변환한 결과물을 Page.jsx, Page.module.css, lions.js에 함께 올려두었으니
실행해보면서 어떤 식으로 React로 옮겨졌는지 비교해보세요.
단계별 변환 가이드는 같은 폴더의 study.md에 정리해두었습니다.

## 1. Page.jsx에 실제 코드가 없음

```
import "./Page.css";

export default function Week4Page() {
  return (
    <div className="week-page">
      <h2>4주차</h2>
    </div>
  );
}
```

- 화면에는 "4주차"만 표시됩니다.
- index.html과 script.js, style.css에 작성한 코드는 React 프로젝트에서 실행되지 않습니다.
- 이 프로젝트는 main.jsx → App.jsx → Page.jsx 흐름으로 컴포넌트만 렌더링합니다.

## 2. index.html / script.js / style.css가 사용되지 않는 이유

```
src/seoyun/week4/
├── index.html       // 사용 안 됨
├── script.js        // 사용 안 됨
├── style.css        // 사용 안 됨 (CSS Modules가 아니라서)
├── Page.jsx         // 이게 실제 렌더링되는 파일
├── Page.css         // (이번에 Page.module.css로 대체)
└── pfp.png          // 이미지는 import해서 활용 가능
```

- Vite는 프로젝트 루트의 `index.html`만 인식합니다 (현재 프로젝트에선 `LLDAU-Study-FE/index.html`).
- `src/seoyun/week4/index.html`은 빌드 산출물에 포함되지 않습니다.
- `script.js`는 `Page.jsx`에서 import하지 않으면 실행되지 않습니다.
- `style.css`는 CSS Modules가 아니어서, 그대로 import하면 전역으로 누수돼 다른 페이지에 영향을 줍니다.
- 그래서 변환본에서는 `Page.module.css`로 옮기고, body 스타일을 `.container`로 한정해 누수를 막았습니다.

## 3. DOM 직접 조작 - React 패러다임 위반

```
// script.js
document.getElementById('btn-toggle-form').addEventListener('click', toggleForm);
document.getElementById('total-count').textContent = `총 ${members.length}명`;
cardGrid.innerHTML = filtered.map(createSummaryCardHTML).join('');
wrapper.hidden = !wrapper.hidden;
```

- `getElementById`, `innerHTML`, `textContent`, `hidden = true/false` 모두 DOM 직접 조작입니다.
- React에서는 상태(state)를 바꾸면 화면이 자동으로 갱신됩니다.
- React 안에서 DOM 직접 조작은 가상 DOM과의 동기화가 깨져 권장되지 않습니다.

```
// React 방식 (이번 변환본에 적용됨)
const [members, setMembers] = useState(initialMembers);
const [showForm, setShowForm] = useState(false);

setMembers((prev) => prev.slice(0, -1));   // 마지막 삭제
setShowForm((prev) => !prev);              // 폼 토글

{showForm && <form>...</form>}             // 조건부 렌더링
{members.map((m) => <Card key={m.id} member={m} />)}  // 목록 렌더링
```

## 4. innerHTML로 카드 렌더링 - JSX map으로 변환

```
// script.js
function createSummaryCardHTML(member) {
  return `
    <li class="summary-card${mineClass}">
      <img src="${member.image}" alt="${member.name} 프로필 이미지" />
      ...
    </li>`;
}
cardGrid.innerHTML = filtered.map(createSummaryCardHTML).join('');
```

- 문자열 템플릿으로 HTML을 만들어 `innerHTML`로 주입하면 XSS 위험이 있고, 이벤트 핸들러도 다시 연결해야 합니다.

```
// React 방식
{visibleMembers.map((m) => (
  <li key={m.id} className={styles["summary-card"]}>
    <img src={m.image} alt={`${m.name} 프로필 이미지`} />
    ...
  </li>
))}
```

- key는 반드시 데이터의 고유 id를 사용합니다.
- 이벤트 핸들러도 JSX 안에 직접 작성하면 자동으로 연결됩니다.

## 5. initFromDOM으로 HTML에서 데이터를 역추출 - 데이터 파일로 분리

```
// script.js
members = Array.from(sumCards).map((sumCard, i) => {
  const detCard = detCards[i];
  return {
    id: i + 1,
    name: sumCard.querySelector('.card-name').textContent.trim(),
    ...
  };
});
```

- HTML에 정적으로 적어둔 멤버 정보를 다시 DOM에서 텍스트로 긁어와 객체로 만들고 있습니다.
- 동작은 하지만, "데이터를 화면에 그린다"의 흐름이 거꾸로 되어 있습니다.
- React에서는 데이터를 먼저 자바스크립트 객체로 작성하고, 그것을 화면에 렌더링합니다.

```
// lions.js (이번에 새로 작성됨)
export const initialMembers = [
  {
    id: 1,
    name: "정서윤",
    part: "Frontend",
    badge: "TypeScript",
    skills: ["TypeScript — 타입 기반 개발", ...],
    ...
  },
  ...
];

// Page.jsx
import { initialMembers } from "./lions";
const [members, setMembers] = useState(initialMembers);
```

## 6. 폼 input - getElementById 대신 controlled component

```
// script.js
function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('f-name').value.trim();
  const part = document.getElementById('f-part').value;
  ...
}
```

- 입력값을 submit 시점에 DOM에서 꺼내는 방식입니다.
- React에서는 각 input의 값을 state에 묶어두고(controlled component), 사용자가 입력할 때마다 state가 즉시 업데이트됩니다.

```
// React 방식
const [formData, setFormData] = useState({ name: "", part: "", ... });

const handleInput = (field) => (e) => {
  setFormData((prev) => ({ ...prev, [field]: e.target.value }));
};

<input value={formData.name} onChange={handleInput("name")} />
```

- 이렇게 하면 "랜덤 값 채우기" 같은 기능에서 setFormData만 호출해도 input 값이 자동으로 갱신됩니다.

## 7. AbortController / latestRequestId 없음 - race condition

```
// script.js
async function fetchAndAdd(count) {
  if (isLoading) return;
  lastFetchFn = () => fetchAndAdd(count);
  setStatus('loading');
  try {
    const res = await fetch(`https://randomuser.me/api/?results=${count}...`);
    ...
  }
}
```

- "랜덤 1명 추가"를 빠르게 두 번 누르면 두 요청이 모두 처리되어 의도하지 않은 결과가 나옵니다.
- `isLoading` 플래그로 막고는 있지만, React 컴포넌트가 unmount된 뒤 응답이 도착하면 unmounted setState 경고가 발생합니다.
- 변환본에서는 AbortController + latestRequestId 패턴을 적용했습니다.

```
// Page.jsx
const latestControllerRef = useRef(null);
const latestRequestIdRef = useRef(0);

async function runFetchAction(actionFn) {
  const requestId = ++latestRequestIdRef.current;
  if (latestControllerRef.current) latestControllerRef.current.abort();
  const controller = new AbortController();
  latestControllerRef.current = controller;

  try {
    await actionFn({ signal: controller.signal, isLatest: () => requestId === latestRequestIdRef.current });
    if (requestId !== latestRequestIdRef.current) return;
    ...
  }
}
```

## 8. 타임아웃 없음

- 서버가 30초 응답하지 않으면 사용자는 계속 loading 화면만 보게 됩니다.
- 변환본에서는 5초 타임아웃을 setTimeout + controller.abort()로 구현했습니다.

```
let timedOut = false;
const timeoutId = setTimeout(() => {
  timedOut = true;
  controller.abort();
}, TIMEOUT_MS);
```

## 9. setTimeout / setInterval cleanup 부재

```
// script.js
setTimeout(() => setStatus('idle'), 2000);
```

- 2초 후 콜백이 실행되는데, 컴포넌트가 unmount되어도 cleanup 되지 않습니다.
- React에서는 useRef로 timer id를 저장하고 useEffect cleanup에서 clearTimeout 합니다.

```
const statusResetTimerRef = useRef(null);

useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    if (latestControllerRef.current) latestControllerRef.current.abort();
  };
}, []);
```

## 10. alert로 에러 표시 - 화면 내 메시지 권장

```
// script.js
catch (err) {
  alert(`랜덤 값 채우기 실패: ${err.message}`);
}
```

- alert는 모바일/사파리에서 차단될 수 있고 UX가 좋지 않습니다.
- 변환본의 fetchStatus는 화면에 상태 텍스트로 표시되고, error 시 "재시도" 버튼이 함께 노출됩니다.

## 11. 잘한 점 (HTML/JS 코드 기준)

- 데이터 모델을 깔끔하게 설계하셨습니다 (id, name, part, badge, intro, image, isMine, club, about, skills, email, phone, website, quote, addedAt).
- `isMine` 플래그로 본인 카드를 강조한 부분 — 정답 코드의 `isMe`와 동일한 접근.
- `PARTS`, `SKILLS_BY_PART`, `ABOUT_PRESETS`, `QUOTE_PRESETS`, `INTROS_BY_PART` 같은 프리셋을 분리한 구조 — 데이터 변경/확장에 유리.
- fetch 상태를 `loading / success / error / idle` 4단계로 명확하게 관리.
- 에러 발생 시 `lastFetchFn`을 저장해 재시도 버튼으로 복구할 수 있게 한 패턴 — 정답 코드와 동일한 접근.
- 전체 새로고침에서 `isMine` 멤버는 보존하고 나머지만 교체하는 로직.
- `mapApiUser`에서 part를 먼저 정한 뒤 part에 맞는 skills를 뽑는 일관성.
- 필터/정렬/검색 세 가지 보기 옵션을 조합한 UI.
- 빈 결과 안내 메시지("표시할 아기 사자가 없습니다 / 필터/검색 조건을 확인해 주세요") - 사용자 배려.
- `summary-card--mine`, `card-part--frontend` 같은 BEM 스타일 변형 클래스 — 디자인 일관성 좋음.
- `address` / `blockquote` 같은 시맨틱 태그 활용.
- `target="_blank" rel="noopener noreferrer"` 외부 링크 보안 처리.
- 반응형 그리드 (3열 → 2열 → 1열).

## 12. 변환 시 추가된 개선점

다음 항목들은 변환본 Page.jsx에 반영되어 있습니다.

- AbortController로 이전 fetch 요청 취소
- latestRequestId로 stale 응답 무시
- 5초 타임아웃 + 타임아웃 메시지
- statusResetTimer cleanup (unmount 안전)
- 데이터 파일 분리 (lions.js)
- controlled component 패턴 (formData state)
- onError 이미지 fallback
- 모달 폼 열릴 때 이름 input에 자동 포커스
- ESC 키로 폼 닫기
- 옵셔널 체이닝 (`?.`)으로 null 데이터 방어

## 13. 체크리스트

- [v] 데이터 모델 설계 (id, isMine, club, badge, skills 등)
- [v] 프리셋 분리 (PARTS, SKILLS_BY_PART, ABOUT_PRESETS, QUOTE_PRESETS)
- [v] fetch 상태 4단계 관리
- [v] 재시도 패턴 (lastFetchFn)
- [v] 전체 새로고침에서 isMine 보존
- [v] mapApiUser의 part→skills 일관성
- [v] 필터/정렬/검색 조합
- [v] 빈 결과 UI
- [v] BEM 스타일 변형 클래스
- [v] 시맨틱 태그 (address, blockquote)
- [v] 외부 링크 보안 (rel="noopener noreferrer")
- [v] 반응형 그리드
- [ ] index.html / script.js / style.css → Page.jsx / Page.module.css / lions.js로 옮기기
- [ ] document.getElementById / innerHTML / textContent / hidden 제거
- [ ] addEventListener를 onClick/onChange로 전환
- [ ] 폼 input을 controlled component로 (formData state)
- [ ] CSS Modules로 전환 (`styles["x"]`)
- [ ] body 스타일을 `.container`로 한정해 누수 차단
- [ ] AbortController + latestRequestId 적용
- [ ] fetch 타임아웃
- [ ] setTimeout cleanup
- [ ] alert 대신 화면 내 에러 메시지

## 14. 핵심 학습 포인트

- HTML/JS 코드를 Page.jsx로 변환해야 합니다.
- 데이터 구조와 비동기 흐름 설계는 이미 잘 짜셨기 때문에, React 패턴으로 옮기기만 하면 됩니다.
- 핵심 변환 단계:
  1. HTML 정적 데이터를 lions.js의 자바스크립트 배열로 옮기기
  2. document.getElementById / innerHTML → useState + JSX map
  3. addEventListener → onClick/onChange/onSubmit
  4. form input → controlled component (value + onChange)
  5. style.css → Page.module.css (`styles["x"]`)
  6. fetch에 AbortController + latestRequestId + 타임아웃 추가
- 변환본 Page.jsx, Page.module.css, lions.js를 실행해보면서 한 줄씩 비교해보세요.
- 같은 폴더의 study.md에 HTML/JS → React 변환 단계별 가이드가 정리되어 있습니다.
