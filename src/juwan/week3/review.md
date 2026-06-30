# 3주차 주완 과제 리뷰

useState, controlled component, 모달 패턴까지 잘 활용했습니다.
정답 코드는 클릭 시 스크롤 방식이지만 모달 방식도 좋은 선택입니다.
다만 새 멤버 이미지 처리와 일부 데이터 오류, 누락된 기능들을 보완하면 더 좋아질 것 같습니다.

## 1. 새 멤버의 이미지가 김주완 사진으로 고정됨

```
const newMember = {
  ...
  image: members[0].image, // 항상 김주완 이미지
};
```

- 새로 추가되는 멤버 모두 김주완(자기 자신) 이미지를 사용하게 됩니다.

## 2. 폼 state가 너무 많이 분리됨

```
const [name, setName] = useState("");
const [role, setRole] = useState("Frontend");
const [intro, setIntro] = useState("");
const [badge, setBadge] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [website, setWebsite] = useState("");
const [comment, setComment] = useState("");
```

- input 필드마다 useState를 쓰면 필드 추가/제거 시 코드 변경이 많아집니다.
- 폼 필드가 8개라 setName, setEmail 등 setter도 8개 됐습니다.
- FormData를 쓰면 더 간결합니다.

```
const handleSubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);

  const newMember = {
    name: fd.get("name").trim(),
    role: fd.get("role"),
    intro: fd.get("intro").trim(),
    email: fd.get("email").trim(),
    phone: fd.get("phone").trim(),
    website: fd.get("website").trim(),
    comment: fd.get("comment").trim(),
    badge: fd.get("badge").trim(),
  };

  setMemberList((prev) => [...prev, newMember]);
  setShowForm(false);
  e.target.reset();
};

<form onSubmit={handleSubmit}>
  <input name="name" required />
  <select name="role">...</select>
  ...
</form>
```

- 각 input에 name 속성을 부여하고 FormData로 한 번에 추출합니다.
- e.target.reset()으로 모든 input 초기화 가능 → setName(""), setEmail("") 등 8줄이 1줄로.

## 3. members.js 데이터 오류

### 3-a. 정소민 website에 두 URL이 합쳐짐

```
website: "https://www.instagram.com/__z1siimhttps://example.com",
```

- 두 URL이 붙어서 잘못된 링크가 됩니다.
- 하나만 남기는 것이 좋습니다.

### 3-b. 김나함 website가 URL 형식이 아님

```
website: "kim_naham",
```

- 인스타그램 핸들로 보이지만 클릭하면 잘못된 URL로 이동합니다.
- 인스타로 이동시키려면 `https://instagram.com/kim_naham` 형식으로 작성해야 합니다.

### 3-c. 이도은 website 누락

```
{
  name: "이도은",
  email: "...",
  phone: "...",
  // website 없음
  comment: "...",
}
```

- 이도은 객체에는 website 필드가 없습니다.
- 모달에서 `{selectedMember.website}` 출력 시 undefined로 표시됩니다.
- 빈 문자열 ""이라도 추가하거나, 모달에서 조건부 렌더링하는 것이 좋습니다.

```
{selectedMember.website && <p>Website : {selectedMember.website}</p>}
```

## 4. 한 줄 소개와 자기소개 구분이 없음

```
<div className={styles["modalContent"]}>
  <h3>자기소개</h3>
  <p>{selectedMember.intro}</p> // 카드의 한 줄 소개와 동일
  ...
</div>
```

- 정답에는 oneLineIntro(요약 카드용)와 description(상세/모달용)이 분리되어 있습니다.
- 현재는 두 곳 모두 같은 intro를 보여주고 있어 모달의 자기소개가 짧고 정보가 부족합니다.

```
const newMember = {
  intro: ...,        // 한 줄 소개 (카드용)
  description: ..., // 자기소개 (모달용, 더 자세함)
  ...
};
```

- 두 필드를 분리하고 폼에도 두 개의 입력 필드를 만드는 것이 좋습니다.

## 5. club/organization 필드 누락 - 모달에 LION TRACK 하드코딩

```
<div>
  <h2>{selectedMember.name}</h2>
  <h3>{selectedMember.role}</h3>
  <p>LION TRACK</p>  // 하드코딩
</div>
```

- members.js에는 club/organization 정보가 없습니다.
- 모든 멤버의 모달에 똑같이 "LION TRACK"이 표시됩니다.
- 데이터로 분리하는 것이 좋습니다.

```
{
  name: "임도영",
  club: "디스이즈",
  ...
}

<p>{selectedMember.club}</p>
```

## 6. 모달 backdrop 클릭으로 닫기 안 됨

```
{selectedMember && (
  <div className={styles["modalBg"]}> // 클릭 핸들러 없음
    <div className={styles["modalBox"]}>
      <button onClick={() => setSelectedMember(null)}>×</button>
      ...
    </div>
  </div>
)}
```

- 일반적인 모달은 backdrop(어두운 배경) 클릭 시 닫히는 UX를 제공합니다.
- 현재는 X 버튼으로만 닫을 수 있습니다.

```
<div
  className={styles["modalBg"]}
  onClick={() => setSelectedMember(null)}
>
  <div
    className={styles["modalBox"]}
    onClick={(e) => e.stopPropagation()} // 모달 안쪽 클릭 시 닫히지 않게
  >
    ...
  </div>
</div>
```

- modalBox에 stopPropagation을 추가해야 모달 내부 클릭 시 닫히지 않습니다.

## 7. ESC 키로 모달 닫기 누락

- 모달이 열려있을 때 ESC 키를 누르면 닫히는 것이 일반적인 UX입니다.

```
useEffect(() => {
  if (!selectedMember) return;
  const handleEsc = (e) => {
    if (e.key === "Escape") setSelectedMember(null);
  };
  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, [selectedMember]);
```

## 8. 파트 필터 누락

- 정답에는 ALL/Frontend/Backend/Design 셀렉트 박스로 멤버를 필터링하는 기능이 있습니다.

```
const [partFilter, setPartFilter] = useState("ALL");

const visibleMembers = memberList.filter(
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

## 9. 빈 상태 메시지 누락

- 멤버가 0명이거나 필터 결과가 없을 때 안내 메시지가 없습니다.

```
{memberList.length === 0 ? (
  <p>아직 등록된 아기사자가 없습니다.</p>
) : (
  memberList.map(...)
)}
```

## 10. div 중첩과 클래스명 혼란

```
<div className={styles["week-page"]}>
  <div className={styles["weekPage"]}>
    ...
  </div>
</div>
```

- week-page와 weekPage 두 클래스가 비슷한 역할로 정의되어 있습니다.
- 둘 다 padding 같은 외곽 스타일을 담당하고 있어 중복이 발생합니다.
- 하나로 합치거나 명확히 역할을 구분해야 합니다.

## 11. 잘한 점

- useState로 상태 관리 잘 했습니다 (memberList, showForm, selectedMember).
- controlled component 패턴 잘 적용했습니다 (value/onChange).
- 본인 카드 isMe 조건부 강조 잘 했습니다.
- key={m.name}으로 인덱스 대신 고유값 사용했습니다.
- input에 required, type="email", type="url" 적절히 적용했습니다.
- 취소 버튼에 type="button" 명시했습니다.
- 멤버 이미지를 assets/juwan/ 폴더로 정리했습니다.
- alt 속성에 멤버 이름 포함시켰습니다 (a11y).
- 추가/삭제 기능 잘 동작합니다.

## 12. 핵심 학습 포인트

- 3주차의 핵심인 useState, 조건부 렌더링, 폼 처리 모두 잘 활용했습니다.
- 모달 패턴까지 추가로 구현한 점이 좋습니다.
- 보완할 부분: 새 멤버 이미지 자동 생성, FormData 활용으로 폼 코드 단축, 데이터 분리(club, description), 모달 backdrop/ESC 처리, 파트 필터 + 빈 상태 메시지.
- 같은 폴더의 study.md에 React state 패턴과 모달 베스트 프랙티스를 정리했으니 참고하세요.
