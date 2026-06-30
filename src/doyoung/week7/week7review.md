# 7주차 도영 과제 리뷰

---

## A. 이미 수정된 에러 (참고)

아래 7가지는 이번에 같이 잡았습니다. 어떤 문제였는지 학습 차원에서 정리합니다.

### 1. App.jsx의 컴포넌트 이름 불일치

```jsx
import WeekPage from "./Page";
...
<Route element={<Week7Page ... />} />   // 정의되지 않은 이름
```

`WeekPage`로 import해놓고 `<Week7Page>`로 사용 → ReferenceError.

수정: `<WeekPage ... />`로 통일.

---

### 2. import한 `./DetailPage`가 존재하지 않음

```jsx
import DetailPage from "./DetailPage"; // 실제 파일은 Detailcard.jsx
```

수정: `import DetailPage from "./Detailcard";`. 다만 파일명이 "Detailcard"인데 컴포넌트 역할은 페이지이므로, 나중에 `DetailPage.jsx`로 파일명을 바꾸는 게 더 깔끔합니다.

---

### 3. `Detailcard.jsx`에서 `<ContactList>` import 누락

```jsx
<ContactList contact={member.contact} /> // ReferenceError
```

`ContactList`는 `Page.jsx` 안의 내부 함수였어요. 수정:

- `Page.jsx`의 `function ContactList` 앞에 `export` 추가
- `Detailcard.jsx`에서 `import { ContactList } from "./Page";` 추가

지금은 가장 작은 변경이라 이렇게 했지만, 정석은 `ContactList.jsx`를 별도 파일로 분리해서 양쪽에서 import하는 거예요. 페이지 컴포넌트 파일에서 작은 컴포넌트를 가져오는 모양새는 모듈 책임이 모호해집니다.

---

### 4. `handleSubmit`의 `makeNextId(user)` — `user` 미정의

```jsx
const newMember = {
  id: makeNextId(user),   // user 변수 없음
  ...
};
```

`makeNextId`가 week7에서 user 객체를 인자로 받는 형태로 바뀌었는데 수동 폼 제출에는 user가 없어서 ReferenceError로 죽었어요.

수정: `makeNextId` 안에 분기 추가.

```jsx
function makeNextId(user) {
  if (user)
    return `${user.name.first}${user.name.last}${Date.now()}`.toLowerCase();
  return `manual-${Date.now()}`;
}
```

그리고 `handleSubmit`은 `id: makeNextId()`로 인자 없이 호출.

---

### 5. SummaryCard의 navigate 절대 경로 오류

```jsx
onClick={() => navigate(`/week7/${member.id}`)}
```

실제 마운트 경로는 `/doyoung/week7`인데 절대 경로로 `/week7/...`로 이동 → 메인 라우터에 정의되지 않은 경로 → NotFound로 빠짐.

수정: `navigate(\`/doyoung/week7/${member.id}\`)`.

---

### 6. App.jsx의 props가 무시되고 있었음

```jsx
// App.jsx
<WeekPage members={members} setMembers={setMembers} />

// Page.jsx (수정 전)
export default function WeekPage() {   // props 안 받음
  const [members, setMembers] = useState(initialMembers);   // 자기가 또 만듦
```

결과: App의 상태와 WeekPage 내부 상태가 따로 존재 → 추가한 멤버가 상세 페이지에 안 보임.

수정: `function WeekPage({ members, setMembers })`로 props 받게 변경, 내부 `useState(initialMembers)` 라인 삭제.

---

### 7. App.jsx가 메인 라우터에 연결되지 않은 상태였음 (가장 큰 구조 문제)

이게 1~6번 다음으로 가장 결정적인 문제였어요. 도영이 만든 `week7/App.jsx`(상태 끌어올림 + 라우팅 정의)는 **메인 앱 어디에서도 import되지 않은 dead code**였습니다.

실제 호출 체인:

```jsx
// src/App.jsx
<Route path="/doyoung/*" element={<DoyoungPage />} />;

// src/doyoung/Page.jsx
import Week7Page from "./week7/Page"; // ← 학생 App.jsx가 아니라 Page.jsx를 직접 import
<Route path="week7" element={<Week7Page />} />; // ← 학생 App.jsx 거치지 않음
```

즉 `/doyoung/week7`로 들어가면 `doyoung/Page.jsx`가 직접 `week7/Page.jsx`의 `WeekPage`를 props 없이 마운트했어요. 학생이 `App.jsx`에서 만든 `useState(initialMembers)`와 `<Route path="week7/:id">` 같은 모든 라우팅 정의가 무력화된 상태였습니다.

수정 두 곳:

```jsx
// src/doyoung/Page.jsx
import Week7App from "./week7/App"; // ← Page가 아니라 App을 import
<Route path="week7/*" element={<Week7App />} />;
```

```jsx
// src/doyoung/week7/App.jsx — 잔여 경로 기준으로 변경
<Routes>
  <Route
    index
    element={<WeekPage members={members} setMembers={setMembers} />}
  />
  <Route path=":id" element={<DetailPage members={members} />} />
  <Route path=":id/*" element={<NotFoundPage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

학생 `App.jsx`의 path가 원래 `"week7"`, `"week7/:id"`였는데, 부모 라우트에서 이미 `week7/*`로 매칭됐기 때문에 자식 라우터의 path는 **부모 매칭 이후 잔여 경로 기준**으로 적어야 합니다. 즉 `week7`은 빈 문자열(`index`), `week7/:id`는 `:id`가 돼야 매칭됩니다.

학습 포인트: React Router의 중첩 라우팅은 부모 매칭을 소비한 후 잔여 경로로 자식 매칭합니다. `path="week7/*"`로 부모에서 매칭이 끝났다면 자식은 그 다음 segment부터 정의해야 해요.

---

## B. 7주차 요구사항 평가

### 페이지 분리 — O

목록(`week7`)과 상세(`week7/:id`)로 라우트를 나눈 점 맞습니다. 목록 페이지에서 week6의 detail 일괄 표시가 빠진 것도 요구사항에 부합.

### URL 파라미터 — O

`useParams()`로 id 추출, `members.find((m) => String(m.id) === id)`로 매칭. `String()`으로 감싸서 문자열 비교한 점 정확합니다.

### 상태 공유 — O (위 6, 7번 수정 후)

App.jsx에서 상태를 끌어올린 것이 7주차 학습 목표의 핵심입니다. 이제 의도대로 동작해요.

### Not Found — O (구분도 함)

```jsx
<Route path=":id/*" element={<NotFoundPage />} />
<Route path="*" element={<NotFoundPage />} />
```

DetailPage에서 `if (!member) return <NotFoundPage type="lion" />;`로 존재하지 않는 id도 구분 처리. 보너스 요구사항인 "존재하지 않는 아기 사자 id"와 "정의되지 않은 경로" 구분도 잘 했어요. NotFoundPage가 `type` prop으로 메시지 분기하는 것도 깔끔합니다.

### 보기 옵션 URL 연동 — X (남은 핵심 요구사항)

```jsx
const [search, setSearch] = useState("");
const [partFilter, setPartFilter] = useState("ALL");
const [sortType, setSortType] = useState("recent");
```

전부 `useState`로만 관리합니다. URL 쿼리 파라미터와 연동되지 않아서:

- `?part=Backend&search=React` 같은 URL로 공유 불가
- 새로고침하면 필터 초기화
- 보기 옵션이 적용된 화면을 북마크 불가

`useSearchParams`로 바꿔야 합니다.

```jsx
import { useSearchParams } from "react-router-dom";

const [searchParams, setSearchParams] = useSearchParams();
const search = searchParams.get("q") ?? "";
const partFilter = searchParams.get("part") ?? "ALL";
const sortType = searchParams.get("sort") ?? "recent";

const updateParam = (key, value, defaultValue) => {
  const next = new URLSearchParams(searchParams);
  if (value === defaultValue || value === "") next.delete(key);
  else next.set(key, value);
  setSearchParams(next, { replace: true });
};

<input value={search} onChange={(e) => updateParam("q", e.target.value, "")} />
<select value={partFilter} onChange={(e) => updateParam("part", e.target.value, "ALL")}>
<select value={sortType} onChange={(e) => updateParam("sort", e.target.value, "recent")}>
```

요구사항 중 "기본값은 URL에서 제외"가 위 `if (value === defaultValue) next.delete(key)` 부분으로 해결됩니다.

### 공통 레이아웃 헤더 — X (보너스)

Layout 컴포넌트가 없고 헤더(앱 이름, 총 인원수, 목록으로 돌아가기 링크)가 없습니다. 보너스라 우선순위는 낮습니다.

```jsx
// Layout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout({ members }) {
  const location = useLocation();
  const isList = location.pathname === "/doyoung/week7";
  return (
    <div>
      <header>
        <Link to="/doyoung/week7">아기사자 명단</Link>
        <span>총 {members.length}명</span>
        {!isList && <Link to="/doyoung/week7">← 목록으로</Link>}
      </header>
      <Outlet context={{ members, setMembers }} />
    </div>
  );
}
```

---

## C. 그 외 정리할 부분 (직접 수정 필요)

### 8. sortType "recent"가 실제로 동작 안 함

```jsx
.sort((a,b) => {
  if (sortType === "name") {
    return a.name.localeCompare(b.name);
  }
  return 0;   // ← "recent"는 정렬 안 함
});
```

게다가 새 멤버 id가 `${first}${last}${Date.now()}` 문자열이라 숫자 비교가 안 됩니다 (week6의 nextIdRef 숫자 방식에서 바뀜).

권장: id를 다시 숫자(`nextIdRef.current++`)로 돌리고 `b.id - a.id`로 최신순. 또는 `addedAt: Date.now()` 같은 별도 필드를 두고 그걸로 정렬.

### 9. `fillRandomData`의 이중 fetch + 5초 대기 (week6 리뷰 4번 그대로)

week6 리뷰에서 지적한 그대로 남아 있습니다. try 밖 첫 fetch, 인위적 5초 대기, signal 없는 두 번째 fetch. 시간 초과로 거의 항상 실패합니다. 이번에 같이 잡아주세요.

### 10. `handleCardClick` 함수가 데드 코드

```jsx
function handleCardClick(id) {
  const member = members.find((m) => m.id === id);
  setSelectedMember(member);   // setSelectedMember 정의 없음
  ...
  setFocusedId(null);          // setFocusedId 정의 없음
}
```

어디서도 호출 안 되고, 호출되면 에러 납니다. week6 잔재예요. 라우팅으로 옮겼으니 통째로 삭제.

### 11. `useMemo` import 미사용

```jsx
import { useEffect, useRef, useState, useMemo } from "react"; // useMemo 사용 안 함
```

linter 경고. 빼주세요.

### 12. `nextIdRef`도 이제 사용 안 함

`makeNextId`가 ref 안 쓰는 형태로 바뀌어서 `nextIdRef` 선언이 데드 코드. 위 8번의 sortType "recent" 수정과 같이 고치는 게 자연스럽습니다 (다시 ref 기반 숫자 id로 돌리거나 완전 삭제).

### 13. 에러 메시지 콜론만 남는 케이스 (week6 리뷰 9번)

```jsx
<p className={styles["statusError"]}>불러오기 실패 :{statusMessage}</p>
```

`statusMessage` 빈 문자열일 때 콜론만 남습니다.

```jsx
<p>불러오기 실패{statusMessage ? ` : ${statusMessage}` : ""}</p>
```

### 14. DetailPage의 "목록으로 돌아가기"가 `navigate(-1)`

```jsx
<button onClick={() => navigate(-1)}>목록으로 돌아가기</button>
```

브라우저 history.back입니다. URL을 직접 입력해서 detail로 들어오면 이전 페이지가 없거나 외부 사이트라 의도와 다르게 동작합니다. `<Link to="/doyoung/week7">`이 명확해요.

---

## 정리

- **이미 잡힌 부분 (A 섹션, 1~7번)**: 7개의 동작/구조 에러. 1~6번은 학생 코드 내부, 7번은 App.jsx와 부모 라우터 연결.
- **남은 핵심 요구사항**: 보기 옵션을 `useSearchParams`로 URL 연동 (B 섹션).
- **남은 정리거리 (C 섹션, 8~15번)**: sortType, fillRandomData, 데드 코드 (handleCardClick, useMemo, nextIdRef), 에러 콜론, navigate(-1), 메모 정리.

라우팅 구조 자체는 잘 잡혔어요. A 섹션의 에러 처리(특히 7번의 부모-자식 라우터 잔여 경로 개념)는 React Router를 처음 만지면 자주 마주치는 패턴이니 한 번 이해해 두면 다음에 새 라우트 추가할 때도 도움이 됩니다. 다음 단계는 B 섹션의 `useSearchParams` 도입, 그다음 C 섹션 항목들 순서로 가는 흐름을 추천합니다.
