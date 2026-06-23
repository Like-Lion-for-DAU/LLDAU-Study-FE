# 7주차 태우 과제 리뷰

7주차 핵심은 "**React Router로 목록과 상세를 페이지로 분리하고, URL을 화면 상태의 진실의 소스로 만든다**" 입니다. 슬라이더 카드 UI나 폼 캡슐화(`useFormData`), 모달 ESC + 스크롤 락(`usePageScrollDown`) 추상화는 잘 잡혀 있어요. 다만 과제의 주요 요구사항 몇 개가 충족되지 않은 상태라 그 부분 중심으로 정리합니다.

---

## 1. 상세 페이지가 분리되지 않았습니다 (가장 큰 항목)

요구사항:

- 목록 페이지에서는 상세 카드 목록이 더 이상 표시되지 않는다
- 상세 정보는 개별 상세 페이지에서만 확인할 수 있다
- 카드 클릭 → URL 변경 → SPA 라우팅으로 상세 페이지 이동
- 브라우저 뒤로/앞으로 가기로 목록 ↔ 상세 이동 가능

현재 구현:

```jsx
// ScrollPage.jsx (line 465)
<div onClick={() => { if (!isDragging.current) setSelected(currentMember); }}>

// GridPage.jsx (line 250)
<div onClick={() => setSelected(member)}>

// 그리고 selected가 truthy면 모달 띄움
{selected && (
  <div className={styles["modalOverlay"]} onClick={() => setSelected(null)}>
    <div className={styles["modalContent"]} ...>
```

카드 클릭이 **URL을 바꾸지 않고 모달만 띄우는 방식**이에요. 그래서:

- 브라우저 주소창이 안 바뀜
- 뒤로 가기로 모달이 닫히지 않음 (이전 페이지로 가버림)
- `/taewoo/week7/lions/4` 같은 URL로 직접 백태우 상세를 열 수 없음
- 누군가에게 "이 사람 상세 보여줄게" 라고 URL 공유 불가
- 새로고침하면 상세가 닫힘

7주차 평가의 가장 핵심 항목입니다. 모달을 페이지로 바꿔야 해요.

수정 방향:

```jsx
// Router.jsx
<Routes>
  <Route index element={<ListPage />} />
  <Route path="lions/:id" element={<DetailPage />} />
</Routes>;

// 카드 클릭
import { Link } from "react-router-dom";
<Link to={`/taewoo/week7/lions/${member.id}`}>...</Link>;

// DetailPage.jsx
import { useParams, Link } from "react-router-dom";
export default function DetailPage() {
  const { id } = useParams();
  const member = members.find((m) => String(m.id) === id);
  if (!member) return <NotFound />;
  return (
    <div>
      <Link to="/taewoo/week7">← 목록으로</Link>
      <h2>{member.name}</h2>
      ...
    </div>
  );
}
```

지금 모달에 있는 자기소개/연락처/관심 기술/한 마디 블록을 그대로 DetailPage로 옮기면 됩니다.

---

## 2. 현재 두 페이지는 "목록 페이지 두 개"입니다

```jsx
// Router.jsx
<Routes>
  <Route index element={<Week7Page />} /> {/* /taewoo/week7      = 슬라이더 */}
  <Route path="list" element={<GridPage />} />{" "}
  {/* /taewoo/week7/list = 그리드 */}
</Routes>
```

`Week7Page`(슬라이더)와 `GridPage`(그리드) 둘 다 **목록을 보여주는 방식이 다른 것**일 뿐, 상세 페이지가 아닙니다. 즉 7주차에서 추가되어야 할 "상세 페이지"가 0개인 상태입니다.

슬라이더/그리드 두 보기 모드는 **하나의 목록 페이지 안에서 viewMode 상태**로 토글하고, 라우팅은 목록 vs 상세로 나누는 게 맞습니다.

```jsx
// 권장 Router 구조
<Routes>
  <Route index element={<ListPage />} /> {/* 목록 (슬라이더 or 그리드 토글) */}
  <Route path="lions/:id" element={<DetailPage />} /> {/* 상세 */}
  <Route path="*" element={<NotFound />} /> {/* 404 */}
</Routes>
```

---

## 3. 보기 옵션이 URL과 연동되지 않습니다

요구사항: 필터/정렬/검색을 URL 쿼리 파라미터에 반영. 기본값(전체/최신순/빈 검색어)은 URL에서 제외.

현재 구현:

```jsx
const [sortPart, setSortPart] = useState("all");
const [sortType, setSortType] = useState("newest");
const [sortSearch, setSortSearch] = useState("");
```

전부 `useState`로만 관리합니다. 결과적으로:

- `?part=Backend&search=React` 같은 URL로 공유 불가
- 북마크해서 같은 필터로 다시 접근 불가
- 새로고침하면 필터 초기화

`useSearchParams`로 바꿔야 합니다:

```jsx
import { useSearchParams } from "react-router-dom";

const [searchParams, setSearchParams] = useSearchParams();
const sortPart = searchParams.get("part") ?? "all";
const sortType = searchParams.get("sort") ?? "newest";
const sortSearch = searchParams.get("q") ?? "";

const updateParam = (key, value, defaultValue) => {
  const next = new URLSearchParams(searchParams);
  if (value === defaultValue || value === "") {
    next.delete(key);   // 기본값이면 URL에서 제거
  } else {
    next.set(key, value);
  }
  setSearchParams(next, { replace: true });
};

// 사용
<input value={sortSearch}
  onChange={(e) => updateParam("q", e.target.value, "")} />
<select value={sortPart}
  onChange={(e) => updateParam("part", e.target.value, "all")}>
```

이렇게 하면 URL 자체가 상태가 되어서, `/taewoo/week7?part=Backend&sort=nameAsc` 같이 공유/북마크가 가능해집니다.

---

## 4. 상태가 두 페이지에서 따로 관리되어서 데이터가 어긋납니다

가장 까다로운 부분이에요. ScrollPage와 GridPage 둘 다 자체 `useState`로 멤버 리스트를 관리합니다.

```jsx
// ScrollPage.jsx (line 7)
const [memberList, setMemberList] = useState(initialMembers);

// GridPage.jsx (line 9)
const [memberList, setMemberList] = useState(
  state?.memberList ?? initialMembers,
);
```

ScrollPage → GridPage 이동 시 `navigate("/taewoo/week7/list", { state: { memberList } })`로 location.state로 한 번만 넘기는데, 거기엔 두 가지 문제가 있습니다.

**문제 A** — GridPage → ScrollPage 돌아갈 때 state를 안 넘김:

```jsx
// GridPage.jsx (line 207)
<button onClick={() => navigate("/taewoo/week7")}>
```

GridPage에서 멤버 추가/삭제하고 ScrollPage로 돌아오면 ScrollPage는 처음 들고 있던 자기 memberList를 그대로 씁니다. 즉 **GridPage에서 한 변경이 사라져요**.

**문제 B** — 직접 URL 진입 시 데이터 손실:

브라우저 주소창에 `/taewoo/week7/list`를 입력해서 들어오면 `state?.memberList`가 `undefined`라 `initialMembers`만 표시됩니다. URL이 진실의 소스가 되지 못해요.

해결책 (7주차 학습 목표 중 "상태를 어디에 두어야 하는지"와 직결):

```jsx
// Router.jsx — 부모에서 상태 보유 + Outlet context로 자식에게 전달
import { Outlet, useOutletContext } from "react-router-dom";

export default function Week7Router() {
  const [memberList, setMemberList] = useState(initialMembers);
  return (
    <Routes>
      <Route element={<Layout context={{ memberList, setMemberList }} />}>
        <Route index element={<ListPage />} />
        <Route path="lions/:id" element={<DetailPage />} />
      </Route>
    </Routes>
  );
}

function Layout({ context }) {
  return <Outlet context={context} />;
}

// ListPage.jsx, DetailPage.jsx 등
const { memberList, setMemberList } = useOutletContext();
```

또는 React Context API를 별도로 만들어서 라우터 트리 위에 Provider로 감싸는 것도 같은 효과예요. 멤버 데이터처럼 여러 페이지가 공유하는 상태는 **공통 부모**에 두는 게 7주차의 핵심 학습 포인트입니다.

---

## 5. 정렬 "최신순"이 실제로는 가장 오래된 것부터 표시됩니다

```jsx
// ScrollPage.jsx (line 177), GridPage.jsx (line 147)
if (sortType === "newest") return a.id - b.id;
```

`a.id - b.id`는 **오름차순**입니다. ID가 작은 것 = 가장 먼저 추가된 것 = 가장 오래된 것이 먼저 와요. "최신 업데이트순"이라는 라벨과 정반대로 동작합니다.

```jsx
if (sortType === "newest") return b.id - a.id; // ← 이렇게
```

---

## 6. ScrollPage와 GridPage 코드가 거의 다 중복입니다

두 파일을 비교해보면:

- 폼 모달 전체 (165줄 정도) 동일
- 상세 모달 전체 동일
- 추가 기능 토글 영역 동일
- sortLabelRow (파트/정렬 select) 동일
- `handleAddSubmit`, `handleFetchRandom`, `handleFetchFiveRandom`, `handleRefresh`, `handleRetry`, `handlePushRandom`, `displayList` 필터/정렬, `fetchMessage`, `makeNextId` 등 거의 모든 핸들러가 동일

지금은 한쪽을 고치면 다른 쪽도 똑같이 손대야 합니다. 이미 정렬 로직 버그(5번)도 두 파일 모두에 동일하게 들어 있어요.

컴포넌트 추출 추천:

- `<MemberForm />` — 폼 모달 (165줄 분리)
- `<DetailModal />` (또는 위 1번대로 `<DetailPage />`로 승격)
- `<ExtraActions />` — 추가/삭제/랜덤/새로고침 패널
- `<FilterBar />` — 파트/정렬 select + 카운트
- `useMemberList()` 커스텀 훅 — 멤버 상태 + fetch 핸들러 묶기

위 4번에서 상태를 위로 끌어올리면 이 중복은 자연스럽게 줄어듭니다.

---

## 7. Not Found 페이지가 없습니다 (보너스)

`Router.jsx`에 `*` route가 없어서 `/taewoo/week7/asdf` 같은 곳으로 들어가면 빈 화면이 나옵니다.

```jsx
<Routes>
  <Route index element={<ListPage />} />
  <Route path="lions/:id" element={<DetailPage />} />
  <Route path="*" element={<NotFound />} /> {/* ← 추가 */}
</Routes>;

function NotFound() {
  return (
    <div>
      <h2>페이지를 찾을 수 없습니다</h2>
      <Link to="/taewoo/week7">목록으로 돌아가기</Link>
    </div>
  );
}
```

추가로 보너스 요구사항: 존재하지 않는 id(`/lions/9999`)와 정의되지 않은 경로(`/asdf`)를 구분 처리. 위 DetailPage 예시에서 `member`가 `undefined`면 "존재하지 않는 아기 사자입니다" 같은 다른 메시지를 보여주면 됩니다.

---

## 8. 공통 레이아웃/헤더가 없습니다 (보너스)

보너스 요구사항: 모든 페이지 공통 헤더(앱 이름, 총 인원 수, 목록 페이지가 아니면 "목록으로 돌아가기" 링크). 페이지 이동 시 헤더는 다시 렌더되지 않아야 함.

```jsx
// Router.jsx
<Routes>
  <Route element={<Layout />}>
    <Route index element={<ListPage />} />
    <Route path="lions/:id" element={<DetailPage />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>;

// Layout.jsx
function Layout() {
  const { memberList } = useOutletContext();
  const location = useLocation();
  const isList = location.pathname === "/taewoo/week7";
  return (
    <div>
      <header>
        <Link to="/taewoo/week7">아기사자 명단</Link>
        <span>총 {memberList.length}명</span>
        {!isList && <Link to="/taewoo/week7">← 목록으로</Link>}
      </header>
      <Outlet />
    </div>
  );
}
```

`Outlet` 안의 페이지가 바뀌어도 `<header>`는 재렌더되지 않아 SPA의 장점이 살아납니다.

---

## 정리

7주차 과제의 핵심 평가 기준에 맞춰 우선순위 매기면:

1. **상세 페이지 라우트 분리 (1번)** — 모달 → `/lions/:id` 페이지로. 가장 큰 항목입니다.
2. **목록/상세 페이지 구조 정리 (2번)** — 슬라이더/그리드는 하나의 목록 페이지 내부 토글로, 라우팅은 목록 vs 상세로.
3. **`useSearchParams`로 보기 옵션 URL 연동 (3번)** — 기본값은 URL에서 제외.
4. **상태를 라우터 부모로 끌어올리기 (4번)** — `Outlet context` 또는 Context API. 두 페이지 데이터 동기화 + 직접 URL 진입 시 데이터 유지.
5. **정렬 버그 (5번)** — 한 줄 수정.
6. **중복 컴포넌트 추출 (6번)** — 4번 적용 후 자연스럽게 진행.
7. **보너스: 404 페이지 (7번), 공통 레이아웃 헤더 (8번)**.

1번과 4번을 함께 진행하면(상세 라우트 만들 때 어차피 상위에서 데이터를 전달해야 하니까) 나머지가 줄줄이 풀립니다. 1, 4, 3 순서로 진행하고 그 다음 2, 5, 6, 보너스로 가는 흐름을 추천합니다.
