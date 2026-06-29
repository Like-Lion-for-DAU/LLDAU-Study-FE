# 7주차 주완 과제 리뷰

7주차의 핵심 요구사항인 **목록 / 상세 페이지 분리**가 시도되지 않은 상태라, 그 부분 중심으로 정리합니다.

---

## 1. 페이지 분리가 전혀 되어 있지 않습니다 (가장 큰 문제)

7주차 과제의 요구사항 중 가장 비중이 큰 항목입니다.

요구사항:

- 목록 페이지에서는 상세 카드 목록이 **더 이상 표시되지 않는다**
- 상세 정보는 **개별 상세 페이지에서만** 확인할 수 있다
- 카드 클릭 → URL 변경 → SPA 라우팅으로 상세 페이지 이동
- 브라우저 뒤로/앞으로 가기로 목록 ↔ 상세 이동
- `/lions/3` 같은 URL 파라미터로 특정 멤버 식별

현재 구현:

```jsx
// week7/Page.jsx
import { useSearchParams } from "react-router-dom";   // ← Routes/Route는 import 안 함
...
return (
  <div>
    {/* 요약 카드 그리드 */}
    <div className={styles.cardContainer}>
      {visibleMembers.map((member) => (
        <article key={member.id} ...>      // ← onClick 없음
          <img .../>
          <h3>{member.name}</h3>
          ...
        </article>
      ))}
    </div>

    {/* 상세 카드 일괄 표시 — week6 구조 그대로 */}
    <section className={styles.detailSection}>
      <h2>상세 자기소개</h2>
      {visibleMembers.map((member) => (
        <article key={member.id + "-detail"}>
          <h3>{member.name}</h3>
          <p>파트 : {member.role}</p>
          ...
        </article>
      ))}
    </section>
  </div>
);
```

문제:

- 카드에 `onClick` 자체가 없음 → 페이지 이동 불가
- 목록 페이지 하단에 모든 멤버의 상세가 일괄 나열 → 6주차 구조와 동일 (7주차에서 명시적으로 빼야 한다고 한 부분)
- `Routes`/`Route` import도 없음 → 라우팅 자체가 없음
- `useParams` 사용 없음 → URL 파라미터 기반 식별 없음
- 상세 페이지 자체가 존재하지 않음

또 한 가지, 부모 라우터(`src/juwan/Page.jsx`)도 sub-route를 받을 수 있는 구조가 아닙니다:

```jsx
// src/juwan/Page.jsx
<Route path="week7" element={<Week7Page />} /> // ← 정확한 매칭만, sub-path 못 받음
```

자식에서 `/juwan/week7/3` 같은 sub-path를 받으려면 부모를 `path="week7/*"`로 바꿔야 합니다.

수정 방향 (큰 그림):

```jsx
// src/juwan/Page.jsx
<Route path="week7/*" element={<Week7App />} />   // ← /*로 변경

// src/juwan/week7/App.jsx (새 파일)
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { members as initialMembers } from "./members";
import ListPage from "./ListPage";       // 기존 Page.jsx 분리
import DetailPage from "./DetailPage";
import NotFoundPage from "./NotFoundPage";

export default function Week7App() {
  const [memberList, setMemberList] = useState(...);   // 부모에서 상태 보유

  return (
    <Routes>
      <Route index element={<ListPage memberList={memberList} setMemberList={setMemberList} />} />
      <Route path=":id" element={<DetailPage memberList={memberList} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// 카드 클릭은 Link로
import { Link } from "react-router-dom";
<Link to={`/juwan/week7/${member.id}`}>
  <article>...</article>
</Link>

// DetailPage.jsx
import { useParams, Link } from "react-router-dom";
export default function DetailPage({ memberList }) {
  const { id } = useParams();
  const member = memberList.find((m) => m.id === id);
  if (!member) return <NotFoundPage type="lion" />;
  return (
    <div>
      <Link to="/juwan/week7">← 목록으로</Link>
      <h2>{member.name}</h2>
      ...
    </div>
  );
}
```

그리고 현재 Page.jsx 마지막의 `<section className={styles.detailSection}>` (664~685줄)은 통째로 삭제 — 그 내용을 DetailPage로 옮깁니다.

---

## 2. 함수명이 `Week6Page`입니다

```jsx
// week7/Page.jsx (100줄)
export default function Week6Page() {
```

week7 폴더의 컴포넌트인데 함수 이름이 `Week6Page`예요. week6 코드를 그대로 복사해 와서 함수명을 안 바꾼 것으로 보입니다. 부모(`juwan/Page.jsx`)에서는 default export로 import하니까 동작은 하지만, React DevTools에서 컴포넌트 트리가 헷갈리고 의도와 어긋납니다.

```jsx
export default function Week7Page() {   // 또는 ListPage
```

---

## 3. `updateUrlOption` 분기가 반복되어 있습니다

```jsx
const updateUrlOption = (key, value) => {
  const nextParams = new URLSearchParams(searchParams);

  if (key === "part") {
    if (value === "ALL") nextParams.delete("part");
    else nextParams.set("part", value);
  }
  if (key === "sort") {
    if (value === "latest") nextParams.delete("sort");
    else nextParams.set("sort", value);
  }
  if (key === "q") {
    if (value.trim() === "") nextParams.delete("q");
    else nextParams.set("q", value);
  }
  setSearchParams(nextParams);
};
```

세 키마다 같은 모양의 분기를 반복 작성했어요. 옵션이 더 늘어나면 분기가 계속 쌓입니다. 기본값을 인자로 받도록 일반화:

```jsx
const updateUrlOption = (key, value, defaultValue) => {
  const next = new URLSearchParams(searchParams);
  const normalized = typeof value === "string" ? value.trim() : value;
  if (normalized === defaultValue || normalized === "") next.delete(key);
  else next.set(key, value);
  setSearchParams(next);
};

// 사용
updateUrlOption("part", e.target.value, "ALL");
updateUrlOption("sort", e.target.value, "latest");
updateUrlOption("q", e.target.value, "");
```

---

## 4. 폼 — ESC/외부 클릭 닫기가 없습니다

```jsx
{
  showForm && (
    <form className={styles.formBox} onSubmit={handleSubmit}>
      ...
      <button
        type="button"
        onClick={() => {
          setFormData(EMPTY_FORM);
          setShowForm(false);
        }}
      >
        취소
      </button>
    </form>
  );
}
```

취소 버튼은 있지만:

- **ESC 키로 닫히지 않음** (`window.addEventListener("keydown", ...)` 없음)
- **모달 오버레이가 아니라 인라인 폼**이라 외부 클릭으로 닫기 개념이 없음 (디자인 선택이라 OK일 수도)
- 폼이 열린 상태에서 다른 작업을 하다가 ESC로 빠르게 닫는 UX가 빠짐

7주차 요구사항 6번 "토글, 입력, 유효성 검사, 랜덤 값 채우기, 취소/ESC"의 ESC 부분이 빠진 상태입니다.

추가 권장:

```jsx
useEffect(() => {
  if (!showForm) return;
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      setFormData(EMPTY_FORM);
      setShowForm(false);
    }
  };
  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, [showForm]);
```

---

## 5. Not Found 페이지가 없습니다 (보너스)

`/juwan/week7/asdf` 같은 곳으로 가도 그냥 빈 화면이 나옵니다. 라우터 자체가 없어서 더 그렇습니다. 위 1번 수정 후 catch-all `<Route path="*">`로 NotFound 추가가 필요해요.

보너스 요구사항 중 "존재하지 않는 아기 사자 id로 접근한 경우(`/lions/9999` 등)와, 아예 정의되지 않은 경로로 접근한 경우를 구분"도 같이 고려:

```jsx
// DetailPage.jsx
const member = memberList.find((m) => m.id === id);
if (!member) return <NotFoundPage type="lion" />; // id는 있는데 멤버 없음

// App.jsx
<Route path="*" element={<NotFoundPage />} />; // 아예 정의 안 된 경로
```

---

## 6. 공통 레이아웃 헤더가 없습니다 (보너스)

요구사항: 모든 페이지 공통 헤더(앱 이름, 총 인원수, 목록 페이지가 아니면 "목록으로" 링크). 페이지 이동 시 헤더는 다시 렌더되지 않아야 함.

```jsx
// Layout.jsx (보너스)
import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout({ memberList }) {
  const location = useLocation();
  const isList = location.pathname === "/juwan/week7";
  return (
    <div>
      <header>
        <Link to="/juwan/week7">아기사자 명단</Link>
        <span>총 {memberList.length}명</span>
        {!isList && <Link to="/juwan/week7">← 목록으로</Link>}
      </header>
      <Outlet />
    </div>
  );
}
```

---

## 7. 폼 형식 검증이 약합니다

```jsx
<input type="email" required value={formData.email} ... />
<input type="tel" required value={formData.phone} ... />
<input type="url" required value={formData.website} ... />
```

HTML5 `required`와 input type 정도만 두고 있어요. type="email"은 `@` 포함 정도만 체크하고, type="tel"은 사실상 아무 검증 없음, type="url"도 폼 제출 시점에만 검증. 잘못된 형식이 입력되어도 입력 중에는 사용자에게 표시되지 않습니다.

다른 학생들이 한 정도의 정규식 검증을 추가하는 게 좋아요.

```jsx
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validatePhone = (v) => /^010-\d{3,4}-\d{4}$/.test(v);
const validateUrl = (v) => /^https?:\/\/.+\..+/.test(v);

{
  formData.email && !validateEmail(formData.email) && (
    <span className={styles.errorMsg}>이메일 형식이 올바르지 않습니다</span>
  );
}
```

---

## 8. `userToFormData`와 `makeRandomMember`가 거의 같은 변환을 두 번 합니다

```jsx
function makeRandomMember(user, order) {
  const role = getRandomItem(roles);
  const badge = getRandomItem(badges);
  return { id: ..., name: ..., role, badge, intro: ..., description: ..., image: ..., email: user.email, phone: user.phone, website: ..., comment: ..., club: ..., createdAt: order };
}

function userToFormData(user) {
  const role = getRandomItem(roles);
  const badge = getRandomItem(badges);
  return { name: ..., role, badge, intro: ..., description: ..., email: user.email, phone: user.phone, website: ..., image: ..., comment: ... };
}
```

두 함수가 거의 같은 필드를 같은 방식으로 만듭니다. 차이는 id/club/createdAt 같은 멤버 객체 메타 필드뿐. 공통 변환부를 따로 빼서 두 함수에서 재사용하면 한 곳만 고치면 양쪽이 같이 바뀝니다.

```jsx
function userToBaseFields(user) {
  const role = getRandomItem(roles);
  const badge = getRandomItem(badges);
  return {
    name: user.name.first + " " + user.name.last,
    role,
    badge,
    intro:
      role +
      " · " +
      user.location.country +
      " " +
      user.location.city +
      "에서 합류했어요.",
    description:
      user.name.first +
      "는 " +
      role +
      " 파트에 관심이 있으며, " +
      badge +
      "를 배우고 있습니다.",
    image: user.picture.large,
    email: user.email,
    phone: user.phone,
    website: "https://example.com",
    comment: "데이터가 바뀌면 화면도 바뀜",
  };
}

function makeRandomMember(user, order) {
  return {
    ...userToBaseFields(user),
    id: user.login.uuid,
    club: "LION TRACK",
    isMe: false,
    createdAt: order,
  };
}

function userToFormData(user) {
  return userToBaseFields(user);
}
```

---

## 정리

우선순위:

1. **페이지 분리 (1번)** — 가장 큰 평가 항목
2. **함수명 `Week6Page` → `Week7Page` (2번)** — 한 줄
3. **`updateUrlOption` 일반화 (3번)** — 작은 리팩터링
4. **폼 ESC 닫기 (4번)** — 요구사항 항목
5. **Not Found 페이지 (5번)** — 1번과 같이
6. **공통 레이아웃 헤더 (6번, 보너스)**
7. **폼 형식 검증 (7번)**
8. **`userToFormData`와 `makeRandomMember` 공통화 (8번)**
