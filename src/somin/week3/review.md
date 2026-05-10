# 3주차 소민 과제 리뷰

전체적으로 useState, 조건부 렌더링, FormData를 잘 활용했습니다.
다만 기존 데이터 구조와 새로 추가되는 데이터의 형태가 달라 일부 정보가 화면에 표시되지 않는 문제가 있습니다.

## 1. 기존 멤버의 연락처가 화면에 표시되지 않음

```
// members.js (기존 데이터 구조)
{
  name: "정소민",
  contact: {
    email: "sominjung1116@gmail.com",
    phone: "010-5615-8474",
    instagram: { label: "@__z1siim", url: "..." },
  },
  ...
}

// Page.jsx의 DetailCard
<li>email : {member.email}</li>      // undefined
<li>phone : {member.phone}</li>      // undefined
<li>website : {member.website}</li>  // undefined
```

- members.js의 연락처는 `member.contact.email` 형태입니다.
- DetailCard에서는 `member.email`로 접근하고 있어 undefined가 출력됩니다.
- 정소민 포함 7명의 기존 멤버 모두 연락처가 빈 칸으로 보입니다.

```
// 해결 방법 1: members.js의 구조를 평면화
{
  name: "정소민",
  email: "sominjung1116@gmail.com",
  phone: "010-5615-8474",
  ...
}

// 해결 방법 2: DetailCard에서 contact 객체 접근
<li>email : {member.contact?.email}</li>
<li>phone : {member.contact?.phone}</li>
```

- 두 가지 데이터 형태가 섞이지 않도록 일관성을 맞춰야 합니다.

## 2. 새로 추가된 멤버에 이미지가 없음

```
const newMember = {
  name: formData.get("name").trim(),
  role: formData.get("part"),
  // image 필드 없음
  ...
};
```

- handleSubmit에서 newMember 객체에 image 필드가 빠져있습니다.
- 폼에는 이미지 입력 필드도 없습니다.
- 새 멤버의 SummaryCard 이미지 영역이 비게 됩니다.

```
const newMember = {
  ...
  image: `https://picsum.photos/seed/${Date.now()}/200/200`,
  ...
};
```

- 정답처럼 picsum.photos로 자동 이미지를 생성하거나
- 폼에 이미지 URL 입력 필드를 추가하는 것을 추천합니다.

## 3. 빈 website 입력 시 잘못된 링크 생성

```
{member.website && (
  <li>
    website : <a href={member.website}>{member.website}</a>
  </li>
)}
```

- `member.website && (...)` 조건은 빈 문자열("")일 때 false라 렌더링 안 됩니다.
- 그런데 폼의 website는 trim() 후 빈 문자열로 저장됩니다.
- 빈 문자열은 falsy라 잘 처리되지만, 만약 공백 한 칸이 들어오면 truthy가 됩니다.

```
// 더 안전하게
{member.website && member.website.trim() && (
  <li>
    website : <a href={member.website} target="_blank" rel="noopener noreferrer">
      {member.website}
    </a>
  </li>
)}
```

- target="\_blank"와 rel="noopener noreferrer"도 함께 추가하는 것이 좋습니다.

## 4. 본인 카드(isMe) 시각적 강조 누락

```
// members.js
{
  name: "정소민",
  isMe: true,
  ...
}

// SummaryCard
<div className={styles.card}>
  ...
</div>
```

- members.js에서 정소민에게 `isMe: true`를 지정했지만
- SummaryCard에서 isMe를 활용하지 않고 있습니다.
- 본인 카드를 시각적으로 강조하려면 조건부 클래스를 적용해야 합니다.

```
<div className={`${styles.card} ${member.isMe ? styles.myCard : ""}`}>
```

```
.myCard {
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 16px rgba(0, 51, 100, 0.15);
}
```

## 5. key={index} 사용 - 추가/삭제 시 안정성 문제

```
{membersList.map((member, index) => (
  <SummaryCard key={index} member={member} />
))}
```

- 배열의 인덱스를 key로 쓰면 추가/삭제 시 React가 컴포넌트를 잘못 매칭할 수 있습니다.
- 예: 3번 인덱스를 삭제하면 4번이 3번이 되어 React는 같은 key로 인식.
- 고유한 값(예: id 또는 name)을 key로 쓰는 것이 좋습니다.

```
// id 추가
const newMember = {
  id: Date.now(),
  ...
};

// 사용
{membersList.map((member) => (
  <SummaryCard key={member.id || member.name} member={member} />
))}
```

## 6. style={{ display: "block" }} 불필요

```
{isFormOpen && (
  <form className={styles.formSection} style={{ display: "block" }} ...>
    ...
  </form>
)}
```

- 이미 `{isFormOpen && ...}` 조건부 렌더링으로 폼이 보이거나 사라집니다.
- inline style로 display: block을 강제할 필요 없습니다.

```
{isFormOpen && (
  <form className={styles.formSection} onSubmit={handleSubmit}>
    ...
  </form>
)}
```

## 7. 누락된 기능들

### 7-a. 파트 필터

- 정답에는 ALL/Frontend/Backend/Design 셀렉트 박스로 멤버를 필터링하는 기능이 있습니다.

```
const [partFilter, setPartFilter] = useState("ALL");

const visibleMembers = membersList.filter(
  (m) => partFilter === "ALL" || m.role === partFilter
);

<select value={partFilter} onChange={(e) => setPartFilter(e.target.value)}>
  <option value="ALL">전체</option>
  <option value="Frontend">Frontend</option>
  <option value="Backend">Backend</option>
  <option value="Design">Design</option>
</select>

{visibleMembers.map(...)}
```

### 7-b. 카드 클릭 시 상세로 스크롤

- 정답에는 요약 카드 클릭 시 해당 상세 카드로 스크롤되고 잠깐 강조되는 효과가 있습니다.

```
const detailRefs = useRef({});
const [focusedName, setFocusedName] = useState(null);

const handleCardClick = (name) => {
  detailRefs.current[name]?.scrollIntoView({ behavior: "smooth", block: "start" });
  setFocusedName(name);
  setTimeout(() => setFocusedName(null), 900);
};
```

### 7-c. 빈 상태 메시지

- 정답에는 멤버가 0명이거나 필터 결과가 없을 때 안내 메시지가 표시됩니다.

```
{visibleMembers.length === 0 ? (
  <p>해당하는 아기사자가 없습니다.</p>
) : (
  visibleMembers.map(...)
)}
```

### 7-d. ESC 키로 폼 닫기

- 정답에는 폼이 열려있을 때 ESC 누르면 폼이 닫힙니다.

```
useEffect(() => {
  if (!isFormOpen) return;
  const handleEsc = (e) => {
    if (e.key === "Escape") setIsFormOpen(false);
  };
  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, [isFormOpen]);
```

## 8. 잘한 점

- useState로 상태 관리 잘 했습니다 (membersList, isFormOpen).
- 조건부 렌더링으로 폼 토글 깔끔하게 처리했습니다.
- FormData로 폼 데이터 추출 잘 했습니다.
- input에 name과 required 속성 잘 적용했습니다.
- type="button"을 명시적으로 적어 의도하지 않은 submit 막았습니다.
- 컴포넌트 분리 (SummaryCard, DetailCard) 좋습니다.
- alert으로 폼 검증 메시지 표시했습니다.
- e.target.reset()으로 폼 제출 후 초기화 처리 좋습니다.
- skills를 split + trim + filter로 처리 잘 했습니다.

## 11. 핵심 학습 포인트

- 3주차의 핵심인 useState, 조건부 렌더링, FormData를 잘 사용했습니다.
- 다만 데이터 구조 일관성이 깨져서 기존 멤버의 연락처가 표시되지 않습니다.
- members.js의 데이터 구조와 새 멤버의 구조를 통일하는 것이 가장 시급합니다.
- 추가로 파트 필터, 빈 상태, ESC 처리, isMe 강조를 보완하면 정답에 가까워집니다.
- study.md에 React state 패턴과 DOM 조작 회피 방법을 정리했으니 참고하세요.
