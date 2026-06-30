# React state 관리 학습 자료

3주차 과제의 핵심 개념을 정리한 학습 자료입니다.
useState, 조건부 렌더링, FormData까지는 잘 활용했으니
이제 데이터 구조 일관성, 누락된 기능들을 보완하는 데 도움이 되도록 작성했습니다.

---

## 1. 데이터 구조 일관성

### 1-a. 왜 중요한가?

- React 컴포넌트는 prop의 형태에 의존합니다.
- 기존 데이터와 새로 추가하는 데이터의 형태가 다르면 어떤 카드는 정상, 어떤 카드는 빈 칸으로 보이게 됩니다.

### 1-b. 소민 코드의 문제

```
// members.js (기존)
{
  contact: {
    email: "sominjung1116@gmail.com",
    phone: "010-5615-8474",
  }
}

// handleSubmit에서 추가 (평면 구조)
{
  email: "...",
  phone: "...",
}
```

- 같은 컴포넌트에서 `member.email`로 접근 → 객체 구조에선 undefined
- 같은 컴포넌트에서 `member.contact.email`로 접근 → 평면 구조에선 undefined

### 1-c. 해결책 - 한쪽으로 통일

방법 1: 평면 구조로 통일 (간단함)

```
// members.js
{
  name: "정소민",
  email: "sominjung1116@gmail.com",
  phone: "010-5615-8474",
  website: "https://...",
  ...
}

// 새 멤버 추가
const newMember = {
  name: ...,
  email: ...,
  phone: ...,
};
```

방법 2: 객체 구조로 통일 (확장성 좋음)

```
// members.js (그대로)
{
  contact: { email: "...", phone: "..." }
}

// 새 멤버 추가도 객체로
const newMember = {
  contact: {
    email: formData.get("email").trim(),
    phone: formData.get("phone").trim(),
  }
};

// 컴포넌트에서 접근
member.contact?.email
```

### 1-d. 옵셔널 체이닝 (?.)

```
member.contact.email       // contact가 undefined면 에러
member.contact?.email      // contact가 undefined면 undefined 반환 (안전)
```

- 객체 구조를 사용할 때 ?.로 안전하게 접근하는 습관을 들이세요.

---

## 2. 새 데이터 추가 시 기본값 챙기기

### 2-a. 소민 코드의 누락

```
const newMember = {
  name: ...,
  role: ...,
  // image 누락 → 새 카드의 이미지 영역이 빔
  // isMe 누락 → 본인 카드 강조 적용 안 됨
};
```

### 2-b. 정답 패턴

```
const handleAddLion = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);

  // 기존 데이터의 가장 큰 id + 1
  const nextId = Math.max(...lions.map(l => l.id), 0) + 1;

  const newLion = {
    id: nextId,
    name: fd.get("name").trim(),
    part: fd.get("part"),
    skills: ...,
    // 자동 생성 placeholder
    imgSrc: `https://picsum.photos/seed/${nextId}/200/200`,
    // 기본값
    organization: "LION TRACK",
    isMe: false,
  };

  setLions(prev => [...prev, newLion]);
};
```

- 폼에 없는 필드는 기본값으로 채워줍니다.
- id는 안전하게 max + 1로 생성합니다.
- 이미지 같은 시각적 요소는 placeholder로라도 채워줍니다.

---

## 3. key 속성 - 인덱스 대신 고유값 사용

### 3-a. 인덱스를 key로 쓰면 생기는 문제

```
{members.map((member, index) => (
  <Card key={index} member={member} />
))}
```

- 처음에는 잘 동작하지만 추가/삭제 시 문제 발생
- 예: [A, B, C]에서 B(index 1)를 삭제하면 [A, C]가 되고 C의 index가 1로 바뀜
- React는 같은 key를 가진 컴포넌트는 같은 컴포넌트로 간주
- 결과적으로 React가 잘못된 DOM을 재사용하여 상태 꼬임 발생

### 3-b. 올바른 방법

```
// 데이터에 고유 id 추가
const newMember = {
  id: Date.now(), // 또는 Math.max + 1
  name: ...,
  ...
};

// key로 id 사용
{members.map((member) => (
  <Card key={member.id} member={member} />
))}
```

### 3-c. id가 없는 경우 임시 방편

```
// 이름이 고유하다면 임시로 사용 가능
{members.map((member) => (
  <Card key={member.name} member={member} />
))}
```

- 단, 동명이인이 있을 가능성이 있다면 id 사용 권장

---

## 4. 조건부 렌더링 패턴

### 4-a. 소민 코드의 inline style 중복

```
{isFormOpen && (
  <form style={{ display: "block" }}>
    ...
  </form>
)}
```

- 이미 `{isFormOpen && ...}`이 렌더링 자체를 막거나 통과시킵니다.
- inline style은 불필요합니다.

### 4-b. 상황별 적절한 패턴

```
// 1. && - 조건이 true일 때만 렌더링
{isLoading && <Spinner />}

// 2. 삼항 연산자 - 두 가지 중 선택
{isError ? <Error /> : <Content />}

// 3. 빈 상태 처리
{items.length === 0 ? (
  <EmptyState />
) : (
  items.map(...)
)}

// 4. 조건부 클래스
<div className={`${styles.card} ${isActive ? styles.active : ""}`}>
```

---

## 5. useEffect로 사이드 이펙트 처리

### 5-a. 언제 사용?

- 컴포넌트 마운트/언마운트 시 처리할 일
- state가 바뀔 때 외부와 동기화
- 외부 이벤트 등록/해제 (keydown, scroll, resize)

### 5-b. 기본 문법

```
useEffect(() => {
  // state가 바뀌거나 마운트 시 실행
  console.log("실행");

  return () => {
    // 다음 실행 전 또는 언마운트 시 실행 (정리)
    console.log("정리");
  };
}, [의존성]); // 이 값이 바뀔 때만 실행
```

### 5-c. ESC 키로 폼 닫기 예시

```
useEffect(() => {
  // 폼이 안 열려있으면 리스너 등록할 필요 없음
  if (!isFormOpen) return;

  const handleEsc = (e) => {
    if (e.key === "Escape") setIsFormOpen(false);
  };

  window.addEventListener("keydown", handleEsc);

  // cleanup: 폼 닫힐 때 리스너 제거
  return () => {
    window.removeEventListener("keydown", handleEsc);
  };
}, [isFormOpen]);
```

- cleanup 함수가 중요합니다. 메모리 누수와 중복 등록을 막아줍니다.

---

## 6. useRef로 DOM 직접 참조

### 6-a. 언제 useRef?

- input.focus() 같은 명령형 DOM 조작
- scrollIntoView() 같은 스크롤 제어
- setInterval/setTimeout id 저장 (렌더링과 무관한 값)

### 6-b. 카드 클릭 시 상세로 스크롤 예시

```
const detailRefs = useRef({});
const [focusedName, setFocusedName] = useState(null);

const handleCardClick = (name) => {
  // 해당 상세 카드로 부드럽게 스크롤
  detailRefs.current[name]?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  // 잠깐 강조 (state로 클래스 추가)
  setFocusedName(name);
  setTimeout(() => setFocusedName(null), 900);
};

// SummaryCard
<div onClick={() => handleCardClick(member.name)}>
  ...
</div>

// DetailCard
<section
  ref={(el) => {
    if (el) detailRefs.current[member.name] = el;
  }}
  className={`${styles.detail} ${focusedName === member.name ? styles.focused : ""}`}
>
  ...
</section>
```

### 6-c. useRef vs useState

```
const [count, setCount] = useState(0);  // 변경 시 리렌더링
const ref = useRef(0);                   // 변경 시 리렌더링 안 됨

setCount(1);          // 화면 다시 그림
ref.current = 1;      // 화면 안 그림 (값만 저장)
```

- 화면에 보여야 하는 값 → useState
- DOM 참조 또는 백그라운드 값 → useRef

---

## 7. 폼 처리 베스트 프랙티스

### 7-a. 소민 코드 (잘 함)

```
const handleSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  if (!newMember.name || !newMember.role) {
    alert("이름과 파트는 필수 항목입니다.");
    return;
  }

  setMembersList([...membersList, newMember]);
  setIsFormOpen(false);
  e.target.reset();
};
```

- e.preventDefault()
- FormData로 추출
- 검증 후 추가
- e.target.reset()

### 7-b. 더 개선할 점

```
// 함수형 setState 사용 (이전 값 기반)
setMembersList((prev) => [...prev, newMember]);

// alert 대신 인라인 에러 메시지 (UX 개선)
const [error, setError] = useState("");
{error && <p className={styles.error}>{error}</p>}

// 더 풍부한 검증
if (!email.includes("@")) {
  setError("올바른 이메일을 입력하세요");
  return;
}
```

---

## 8. 본인 카드 강조 패턴

### 8-a. 데이터에 isMe 플래그

```
// members.js
{
  name: "정소민",
  isMe: true,
  ...
}
```

### 8-b. 조건부 클래스

```
<div className={`${styles.card} ${member.isMe ? styles.myCard : ""}`}>
```

### 8-c. CSS

```
.card {
  border: 1px solid #ddd;
}

.myCard {
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 16px rgba(0, 51, 100, 0.15);
}
```

---

## 9. 종합 예제 - 완성도 높이기

```
import { useState, useEffect, useRef } from "react";
import styles from "./Page.module.css";
import { members as initialMembers } from "./members";

export default function Week3Page() {
  const [members, setMembers] = useState(initialMembers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [partFilter, setPartFilter] = useState("ALL");
  const [focusedName, setFocusedName] = useState(null);
  const detailRefs = useRef({});

  // 필터링
  const visibleMembers = members.filter(
    (m) => partFilter === "ALL" || m.role === partFilter,
  );

  // ESC 키
  useEffect(() => {
    if (!isFormOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsFormOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isFormOpen]);

  // 추가
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const skills = fd.get("skills")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const nextId = Date.now();

    const newMember = {
      id: nextId,
      name: fd.get("name").trim(),
      role: fd.get("part"),
      intro: fd.get("intro").trim(),
      bio: fd.get("bio").trim(),
      club: fd.get("club").trim(),
      email: fd.get("email").trim(),
      phone: fd.get("phone").trim(),
      website: fd.get("website").trim(),
      motto: fd.get("motto").trim(),
      skills,
      badge: skills[0] || "New",
      image: `https://picsum.photos/seed/${nextId}/200/200`,
      isMe: false,
    };

    setMembers((prev) => [...prev, newMember]);
    setIsFormOpen(false);
    e.target.reset();
  };

  // 삭제
  const deleteLast = () => {
    setMembers((prev) => prev.slice(0, -1));
  };

  // 카드 클릭 → 스크롤
  const handleCardClick = (name) => {
    detailRefs.current[name]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setFocusedName(name);
    setTimeout(() => setFocusedName(null), 900);
  };

  return (
    <div className={styles.weekPage}>
      <div className={styles.controls}>
        <span>총 {members.length}명</span>
        <button type="button" onClick={() => setIsFormOpen((p) => !p)}>
          추가
        </button>
        <button type="button" onClick={deleteLast}>
          삭제
        </button>
        <select value={partFilter} onChange={(e) => setPartFilter(e.target.value)}>
          <option value="ALL">전체</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Design">Design</option>
        </select>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit}>
          {/* ... 폼 input들 ... */}
        </form>
      )}

      {visibleMembers.length === 0 ? (
        <p>해당하는 멤버가 없습니다.</p>
      ) : (
        <>
          <div className={styles.cardGrid}>
            {visibleMembers.map((member) => (
              <div
                key={member.id || member.name}
                className={`${styles.card} ${member.isMe ? styles.myCard : ""}`}
                onClick={() => handleCardClick(member.name)}
              >
                <img src={member.image} alt={member.name} />
                <p>{member.name}</p>
                <p>{member.role}</p>
                <p>{member.intro}</p>
              </div>
            ))}
          </div>

          <div className={styles.detailList}>
            {visibleMembers.map((member) => (
              <section
                key={member.id || member.name}
                ref={(el) => {
                  if (el) detailRefs.current[member.name] = el;
                }}
                className={`${styles.detail} ${
                  focusedName === member.name ? styles.focused : ""
                }`}
              >
                <h2>{member.name}</h2>
                <h3>자기소개</h3>
                <p>{member.bio}</p>
                <h3>연락처</h3>
                <ul>
                  <li>{member.email}</li>
                  <li>{member.phone}</li>
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 10. 학습 체크리스트

이미 잘 한 것은 [v], 보완할 것은 [ ]로 표시했습니다.

- [v] useState로 데이터 관리하기
- [v] 조건부 렌더링 활용 ({isFormOpen && ...})
- [v] FormData로 폼 데이터 추출
- [v] e.preventDefault() 사용
- [v] e.target.reset() 사용
- [v] type="button" 명시
- [v] required 속성 사용
- [v] 컴포넌트 분리 (SummaryCard, DetailCard)
- [ ] members.js와 새 멤버 데이터 구조 일관성
- [ ] 새 멤버에 image 필드 챙기기
- [ ] isMe 활용한 본인 카드 강조
- [ ] key는 인덱스 대신 고유값 사용
- [ ] 파트 필터 구현 (useState + filter)
- [ ] 카드 클릭 → 스크롤 (useRef + scrollIntoView)
- [ ] 빈 상태 메시지 (length === 0 처리)
- [ ] ESC 키 처리 (useEffect)
- [ ] detail 섹션 제목 h3로 변경
- [ ] 빈 script.js 파일 삭제

---
