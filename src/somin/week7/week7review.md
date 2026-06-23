# 7주차 소민 과제 리뷰

라우팅, 상태 끌어올림, 보기 옵션 URL 연동까지 7주차 핵심은 모두 시도되어 있습니다. 다만 라우터 구조 설계와 Not Found 처리에 손볼 부분이 있어서 그쪽 중심으로 정리합니다.

---

## 1. 부모 라우터의 path 구조가 평탄합니다

```jsx
// src/somin/Page.jsx
<Route path="week7" element={<Week7Page ... />} />
<Route path="week8" element={<Week8Page />} />
<Route path="week9" element={<Week9Page />} />
<Route path="week10" element={<Week10Page />} />
<Route path="week7/lions/:id" element={<DetailPage ... />} />
```

문제 두 가지:

- **week7과 week7/lions/:id가 같은 부모 Routes에 평탄하게 등록**되어 있어요. week7의 자식 페이지가 SominPage 라우터에 직접 노출되는 구조라, week7 내부 라우팅 책임이 부모(SominPage)로 새어 나갑니다. 미래에 week7에 페이지가 더 늘면 SominPage가 모두 알아야 해요.
- **week7/lions/:id가 week10 뒤에 따로 떨어져 있어** 정렬도 깨졌습니다.

권장은 `week7/*`로 마운트하고, week7 폴더 안에 자식 라우터를 만들어 캡슐화하는 방식입니다.

```jsx
// src/somin/Page.jsx
import Week7App from "./week7/App"; // ← 새 파일

<Route
  path="week7/*"
  element={
    <Week7App membersList={membersList} setMembersList={setMembersList} />
  }
/>;
```

```jsx
// src/somin/week7/App.jsx (새 파일)
import { Routes, Route } from "react-router-dom";
import Week7Page from "./Page";
import DetailPage from "./DetailPage";
import NotFoundPage from "./NotFoundPage";

export default function Week7App({ membersList, setMembersList }) {
  return (
    <Routes>
      <Route
        index
        element={
          <Week7Page
            membersList={membersList}
            setMembersList={setMembersList}
          />
        }
      />
      <Route
        path="lions/:id"
        element={<DetailPage membersList={membersList} />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

이러면 SominPage는 "week7 폴더로 위임"만 하면 끝이고, week7 내부 라우트(상세, NotFound, 미래 추가될 페이지들)는 그 폴더 안에서 자율적으로 관리됩니다.

---

## 2. Not Found 페이지가 없습니다 (보너스)

`/somin/week7/asdf`, `/somin/week7/lions/abc/xyz` 같은 경로로 가면 빈 화면이 나옵니다. catch-all `<Route path="*">`가 없어요.

```jsx
// NotFoundPage.jsx
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className={styles.weekPage}>
      <h2>페이지를 찾을 수 없습니다</h2>
      <Link to="/somin/week7">목록으로 돌아가기</Link>
    </div>
  );
}
```

위 1번의 `Week7App.jsx` 안에 `<Route path="*" element={<NotFoundPage />} />`로 등록.

---

## 3. DetailPage의 "없는 멤버" 처리가 너무 빈약합니다

```jsx
if (!member) {
  return <div className={styles.weekPage}>존재하지 않는 아기사자입니다.</div>;
}
```

텍스트만 있고 목록으로 돌아가는 링크가 없어요. 잘못된 URL(`/somin/week7/lions/9999`)로 진입한 사용자는 Navbar 외에 빠져나갈 수단이 없습니다. NotFound 페이지를 만들면 거기로 보내는 게 자연스럽습니다.

```jsx
import NotFoundPage from "./NotFoundPage";

if (!member) {
  return <NotFoundPage type="lion" />;
}
```

또는 NotFoundPage에 `type` prop으로 메시지 분기:

```jsx
export default function NotFoundPage({ type = "route" }) {
  const isMissingLion = type === "lion";
  return (
    <div className={styles.weekPage}>
      <h2>
        {isMissingLion
          ? "존재하지 않는 아기사자입니다"
          : "페이지를 찾을 수 없습니다"}
      </h2>
      <Link to="/somin/week7">← 목록으로 돌아가기</Link>
    </div>
  );
}
```

이러면 보너스 요구사항인 "존재하지 않는 id"와 "정의되지 않은 경로" 구분도 함께 충족됩니다.

---

## 4. id 매칭에 `Number(id)` 사용

```jsx
const member = membersList.find((m) => m.id === Number(id));
```

지금은 모든 멤버 id가 숫자(`makeNextId`도 숫자 반환)라 동작합니다. 다만 외부 API의 uuid 같은 string id가 섞이는 순간 매칭이 깨져요. 더 안전한 패턴은 양쪽 다 문자열 비교:

```jsx
const member = membersList.find((m) => String(m.id) === id);
```

`useParams`의 id는 항상 문자열이라, 멤버 쪽을 `String()`으로 감싸는 게 형식에 맞습니다.

---

## 5. 공통 레이아웃 헤더가 없습니다 (보너스)

요구사항: 모든 페이지 공통 헤더(앱 이름, 총 인원 수, 목록 페이지가 아니면 "목록으로" 링크). 페이지 이동 시 헤더는 다시 렌더되지 않아야 함.

지금 구조에서는 `<div className={styles.heroBanner}>`가 Week7Page 안에만 있어서 DetailPage로 이동하면 사라집니다. Layout으로 빼고 Outlet으로 페이지를 갈아끼우면 헤더가 유지됩니다.

```jsx
// Layout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout({ membersList }) {
  const location = useLocation();
  const isList = location.pathname === "/somin/week7";
  return (
    <>
      <header>
        <Link to="/somin/week7">아기사자 명단</Link>
        <span>총 {membersList.length}명</span>
        {!isList && <Link to="/somin/week7">← 목록으로</Link>}
      </header>
      <Outlet />
    </>
  );
}

// Week7App.jsx
<Routes>
  <Route element={<Layout membersList={membersList} />}>
    <Route index element={<Week7Page ... />} />
    <Route path="lions/:id" element={<DetailPage ... />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
```

---

## 6. 폼 모달 외부 클릭 닫기 없음

```jsx
{
  isFormOpen && <div className={styles.formSection}>...</div>;
}
```

ESC 처리는 잘 되어 있어요. 다만 모달 오버레이가 아닌 인라인 패널이라 "바깥 클릭으로 닫기"가 안 됩니다. 디자인 선택일 수도 있지만, Spotify 컨셉이라면 보통 모달 오버레이 + 바깥 클릭 닫기 패턴이 일관성 있어요.

```jsx
<div className={styles.modalOverlay} onClick={() => setIsFormOpen(false)}>
  <div className={styles.formSection} onClick={(e) => e.stopPropagation()}>
    ...
  </div>
</div>
```

---

## 7. `updateParams`의 `q` 분기

```jsx
const updateParams = ({
  part = partFilter,
  sort = sortOrder,
  q = searchQuery,
}) => {
  const params = {};
  if (part !== "ALL") params.part = part;
  if (sort !== "latest") params.sort = sort;
  if (q.trim()) params.q = q;
  setSearchParams(params);
};
```

`q.trim()`만 빈 문자열 체크하는데, q 값을 set할 때는 `q`를 그대로 set (trim 안 함). 사용자가 " "처럼 공백만 입력하면 URL에 `?q=%20%20%20`이 박힙니다. set할 때도 trim 적용하거나, 아예 input의 onChange에서 trim된 값으로 store하는 게 일관적입니다.

```jsx
if (q.trim()) params.q = q.trim();
```

---

## 정리

우선순위:

1. **부모 라우터 평탄 구조 정리 (1번)** — `week7/*` 마운트로 캡슐화. 5번(레이아웃), 2번(NotFound), 3번(없는 멤버 처리) 모두 이 구조 위에서 자연스럽게 같이 해결됨
2. **id 비교를 `String()` 기반으로 (4번)** — 한 줄
3. **`updateParams` q trim 일관성 (8번)** — 한 줄
4. **보너스: NotFound 페이지 (2번), 공통 레이아웃 (5번)**
5. **폼 모달 외부 클릭 닫기 (6번)** — UX/접근성

1번부터 잡으면 2/3/5번이 자연스럽게 따라옵니다. 그 순서로 진행 추천합니다.
