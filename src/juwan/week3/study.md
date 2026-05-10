# React state 관리 학습 자료

3주차 과제의 핵심 개념을 정리한 학습 자료입니다.
useState와 controlled component, 모달 패턴까지 잘 활용했으니
이제 폼 코드 간결화, 데이터 분리, 모달 UX 보완에 도움이 되도록 작성했습니다.

---

## 1. controlled component vs FormData

### 1-a. controlled component (현재 사용 중)

```
const [name, setName] = useState("");

<input value={name} onChange={(e) => setName(e.target.value)} />
```

- 각 input의 값이 React state와 항상 동기화됨
- 실시간 검증, 다른 컴포넌트와 값 공유 등에 좋음
- 단점: 필드 많으면 useState가 기하급수적으로 늘어남

### 1-b. uncontrolled + FormData

```
<form onSubmit={handleSubmit}>
  <input name="name" required />
</form>

const handleSubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get("name");
};
```

- 폼 제출 시점에 한 번에 값 추출
- 코드 짧고 필드 추가/제거 쉬움
- 단점: 입력 중 실시간으로 값 사용 불가

### 1-c. 어떤 것을 선택?

- 입력 중 다른 곳에 표시 (실시간 미리보기) → controlled
- 입력 중 검증 (비밀번호 강도 등) → controlled
- 폼 필드가 많고 단순 제출만 필요 → FormData
- 컴포넌트 간 값 공유 → controlled

- 주완 코드처럼 단순 입력 → 제출 흐름은 FormData가 더 간결합니다.

---

## 2. 새 데이터 추가 시 빠진 필드 챙기기

### 2-a. 주완 코드의 누락

```
const newMember = {
  name, role, intro, badge, email, phone, website, comment,
  image: members[0].image, // 항상 김주완 이미지
};
```

- image를 첫 번째 멤버의 이미지로 고정
- 새 멤버 추가 시 모두 같은 이미지가 됨

### 2-b. 자동 placeholder 이미지 생성

```
const newMember = {
  ...,
  image: `https://picsum.photos/seed/${Date.now()}/200/200`,
};
```

- picsum.photos는 시드(seed)에 따라 다른 랜덤 이미지를 반환
- Date.now()로 고유 시드를 만들면 멤버마다 다른 이미지가 보임

### 2-c. 폼에 이미지 입력 필드 추가

```
<input name="image" type="url" placeholder="이미지 URL" />

const newMember = {
  ...,
  image: fd.get("image") || `https://picsum.photos/seed/${Date.now()}/200/200`,
};
```

- 사용자가 입력한 이미지 사용, 없으면 자동 생성

---

## 3. 데이터 일관성과 옵셔널 처리

### 3-a. 일부 멤버에만 있는 필드

```
// 이도은은 website 없음
{
  name: "이도은",
  email: "...",
  // website 누락
}

// 모달에서 출력
<p>Website : {selectedMember.website}</p>  // undefined 표시
```

- 누락된 필드를 그대로 출력하면 "undefined" 또는 빈 값이 보입니다.
- 조건부 렌더링으로 처리해야 합니다.

```
{selectedMember.website && (
  <p>Website : {selectedMember.website}</p>
)}
```

### 3-b. URL 형식 검증

```
website: "kim_naham"  // URL 아님
```

- href에 들어갈 값은 URL 형식이어야 합니다.
- 인스타 핸들이라면 `https://instagram.com/kim_naham`처럼 완전한 URL로 작성합니다.

---

## 4. 모달 UX 베스트 프랙티스

### 4-a. backdrop 클릭으로 닫기

```
<div
  className={styles.modalBg}
  onClick={() => setSelectedMember(null)} // 배경 클릭으로 닫기
>
  <div
    className={styles.modalBox}
    onClick={(e) => e.stopPropagation()} // 내부 클릭은 닫히지 않게
  >
    <button onClick={() => setSelectedMember(null)}>×</button>
    ...
  </div>
</div>
```

- e.stopPropagation()이 핵심
- 이벤트가 부모로 전파되지 않게 막음
- modalBox 안쪽 클릭은 닫히지 않고, 바깥쪽 클릭은 닫히게 됨

### 4-b. ESC 키로 닫기

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

- selectedMember가 있을 때만 리스너 등록
- 모달 닫히면 cleanup으로 리스너 제거

### 4-c. body scroll lock (선택)

```
useEffect(() => {
  if (!selectedMember) return;

  const original = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = original;
  };
}, [selectedMember]);
```

- 모달이 열려있을 때 배경 페이지가 스크롤되지 않게 막음
- UX 향상

### 4-d. 접근성 속성

```
<div
  className={styles.modalBox}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">{selectedMember.name}</h2>
  ...
</div>
```

---

## 5. useEffect로 사이드 이펙트 처리

### 5-a. 의존성 배열 패턴

```
useEffect(() => {
  // 매번 실행
});

useEffect(() => {
  // 마운트 시 1번만
}, []);

useEffect(() => {
  // count가 바뀔 때마다
}, [count]);

useEffect(() => {
  // 정리 함수
  return () => {
    console.log("정리됨");
  };
}, []);
```

### 5-b. 모달 ESC 키 통합 예시

```
useEffect(() => {
  if (!selectedMember) return;

  const handleEsc = (e) => {
    if (e.key === "Escape") setSelectedMember(null);
  };

  window.addEventListener("keydown", handleEsc);
  document.body.style.overflow = "hidden";

  return () => {
    window.removeEventListener("keydown", handleEsc);
    document.body.style.overflow = "";
  };
}, [selectedMember]);
```

- 한 useEffect 안에 ESC 처리와 scroll lock을 모두 묶을 수 있음
- cleanup은 등록한 순서대로 모두 정리

---

## 6. 데이터 구조 설계 - intro vs description

### 6-a. 한 줄 소개 vs 자기소개 분리

요약 카드와 상세 모달이 같은 텍스트를 보여주면 정보 풍부도가 떨어집니다.

```
{
  name: "김주완",
  intro: "성실히 배우고 싶은 학생입니다.", // 카드용 한 줄
  description: "컴퓨터공학과 1학년입니다. 웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.", // 모달용 자세히
}
```

```
// 카드
<p>{member.intro}</p>

// 모달
<h3>자기소개</h3>
<p>{member.description}</p>
```

### 6-b. 데이터에 club/organization도 포함

현재 모달에 "LION TRACK"이 하드코딩되어 있어 모든 멤버가 같습니다.

```
{
  name: "임도영",
  club: "디스이즈",
  ...
}

<p>{selectedMember.club}</p>
```

---

## 7. 폼 필터링 패턴

### 7-a. useState + filter

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

- 원본 memberList는 그대로 두고, 화면에 보일 visibleMembers만 따로 계산
- partFilter가 바뀌면 자동으로 visibleMembers가 다시 계산됨 (React 렌더링 메커니즘)

### 7-b. 다중 필터 조합

```
const [partFilter, setPartFilter] = useState("ALL");
const [searchQuery, setSearchQuery] = useState("");

const visibleMembers = memberList
  .filter((m) => partFilter === "ALL" || m.role === partFilter)
  .filter((m) => m.name.includes(searchQuery));
```

- 필터를 chain으로 연결할 수 있음
- 검색 + 필터 조합도 쉽게 가능

---

## 8. 빈 상태 처리

### 8-a. 단순 빈 상태

```
{memberList.length === 0 ? (
  <p>아직 등록된 아기사자가 없습니다.</p>
) : (
  memberList.map((m) => <Card key={m.name} member={m} />)
)}
```

### 8-b. 필터 결과 없음 vs 진짜 비어있음 구분

```
const isTrulyEmpty = memberList.length === 0;
const isFilterEmpty = memberList.length > 0 && visibleMembers.length === 0;

{isTrulyEmpty && <p>아직 등록된 아기사자가 없습니다.</p>}
{isFilterEmpty && <p>조건에 맞는 아기사자가 없습니다.</p>}
{!isTrulyEmpty && !isFilterEmpty && visibleMembers.map(...)}
```

- 사용자에게 명확한 메시지 제공
- "조건을 바꾸면 멤버가 나타날 수 있다"는 힌트 제공

---

## 9. 종합 예제 - FormData로 정리한 버전

```
import { useState, useEffect } from "react";
import styles from "./Page.module.css";
import { members as initialMembers } from "./members";

export default function Week3Page() {
  const [memberList, setMemberList] = useState(initialMembers);
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [partFilter, setPartFilter] = useState("ALL");

  const visibleMembers = memberList.filter(
    (m) => partFilter === "ALL" || m.role === partFilter,
  );

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!selectedMember) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedMember(null);
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [selectedMember]);

  const handleAddMember = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const newMember = {
      name: fd.get("name").trim(),
      role: fd.get("role"),
      intro: fd.get("intro").trim(),
      description: fd.get("description").trim(),
      badge: fd.get("badge").trim(),
      email: fd.get("email").trim(),
      phone: fd.get("phone").trim(),
      website: fd.get("website").trim(),
      comment: fd.get("comment").trim(),
      club: fd.get("club").trim(),
      image: `https://picsum.photos/seed/${Date.now()}/200/200`,
    };

    setMemberList((prev) => [...prev, newMember]);
    setShowForm(false);
    e.target.reset();
  };

  const deleteLastMember = () => {
    setMemberList((prev) => prev.slice(0, -1));
  };

  return (
    <div className={styles.weekPage}>
      <div className={styles.controlArea}>
        <button onClick={() => setShowForm(true)}>아기사자 추가</button>
        <button onClick={deleteLastMember}>마지막 삭제</button>
        <select
          value={partFilter}
          onChange={(e) => setPartFilter(e.target.value)}
        >
          <option value="ALL">전체</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Design">Design</option>
        </select>
        <strong>총 {memberList.length}명</strong>
      </div>

      {showForm && (
        <form onSubmit={handleAddMember}>
          <input name="name" required placeholder="이름" />
          <select name="role" required>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
          </select>
          <input name="badge" required placeholder="관심 기술" />
          <input name="intro" required placeholder="한 줄 소개" />
          <textarea name="description" required placeholder="자기소개" />
          <input name="club" required placeholder="동아리/소속" />
          <input name="email" type="email" required />
          <input name="phone" required />
          <input name="website" type="url" required />
          <input name="comment" required placeholder="한 마디" />
          <button type="submit">추가하기</button>
          <button type="button" onClick={() => setShowForm(false)}>
            취소
          </button>
        </form>
      )}

      {visibleMembers.length === 0 ? (
        <p>해당하는 아기사자가 없습니다.</p>
      ) : (
        <div className={styles.cardContainer}>
          {visibleMembers.map((m) => (
            <div
              key={m.name}
              onClick={() => setSelectedMember(m)}
              className={`${styles.card} ${m.isMe ? styles.mainCard : ""}`}
            >
              <img src={m.image} alt={`${m.name} 프로필`} />
              <span>{m.badge}</span>
              <h3>{m.name}</h3>
              <p>{m.role}</p>
              <p>{m.intro}</p>
            </div>
          ))}
        </div>
      )}

      {selectedMember && (
        <div
          className={styles.modalBg}
          onClick={() => setSelectedMember(null)}
        >
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button onClick={() => setSelectedMember(null)}>×</button>
            <img src={selectedMember.image} alt={selectedMember.name} />
            <h2>{selectedMember.name}</h2>
            <h3>{selectedMember.role}</h3>
            <p>{selectedMember.club}</p>
            <h3>자기소개</h3>
            <p>{selectedMember.description || selectedMember.intro}</p>
            <h3>관심 기술</h3>
            <span>{selectedMember.badge}</span>
            <h3>연락처</h3>
            <p>Email : {selectedMember.email}</p>
            <p>Phone : {selectedMember.phone}</p>
            {selectedMember.website && (
              <p>Website : {selectedMember.website}</p>
            )}
            <h3>각오 한 마디</h3>
            <p>"{selectedMember.comment}"</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

- 8개 useState → 1개의 form 처리로 압축
- backdrop/ESC/scroll lock까지 통합

---

## 10. 학습 체크리스트

이미 잘 한 것은 [v], 보완할 것은 [ ]로 표시했습니다.

- [v] useState로 데이터 관리하기
- [v] 조건부 렌더링 활용
- [v] controlled component 패턴
- [v] 모달 패턴 구현
- [v] 본인 카드 isMe 강조
- [v] key는 인덱스 대신 고유값(name) 사용
- [v] type="button" 명시
- [v] required 속성 사용
- [v] type="email", type="url" 활용
- [v] 이미지 폴더 정리 (assets/juwan/)
- [v] alt 속성에 이름 포함
- [ ] 새 멤버 이미지 자동 생성 또는 입력 필드 추가
- [ ] FormData로 폼 처리 단순화
- [ ] members.js 데이터 오류 수정 (정소민 website, 김나함 website)
- [ ] club/organization 데이터로 분리
- [ ] intro와 description 분리
- [ ] 모달 backdrop 클릭으로 닫기
- [ ] ESC 키로 모달 닫기
- [ ] body scroll lock
- [ ] 파트 필터 구현
- [ ] 빈 상태 메시지
- [ ] week-page와 weekPage 클래스 정리

---

## 11. 추가 학습 자료

- [React 공식 문서 - 폼 처리](https://ko.react.dev/reference/react-dom/components/form)
- [React 공식 문서 - useEffect](https://ko.react.dev/reference/react/useEffect)
- [MDN - FormData](https://developer.mozilla.org/ko/docs/Web/API/FormData)
- [MDN - 이벤트 전파(Event Propagation)](https://developer.mozilla.org/ko/docs/Web/API/Event/stopPropagation)
