# React Hook 규칙과 폼 베스트 프랙티스

---

## 1. React Hook 명명 규칙

### 1-a. Hook은 use로 시작해야 함

React에는 두 가지 Hook 규칙이 있습니다.

1. Hook은 컴포넌트 또는 다른 Hook 안에서만 호출할 수 있다
2. Hook 이름은 `use`로 시작해야 한다

이 규칙은 `eslint-plugin-react-hooks`가 자동으로 검사합니다.

### 1-b. 왜 use 접두사가 중요한가?

```
// React 규칙 위반
function Page_Scroll_Down() {
  useEffect(() => {...}, []);
}

// React 규칙 준수
function usePageScrollLock() {
  useEffect(() => {...}, []);
}
```

- React가 함수가 Hook인지 일반 함수인지 구분하는 유일한 방법이 이름입니다.
- ESLint가 use로 시작하지 않는 함수에서 useEffect를 호출하면 경고합니다.
- 다른 개발자가 코드를 읽을 때도 use로 시작하면 "이 함수는 React 컴포넌트에서만 호출해야 한다"는 신호입니다.

### 1-c. 태우 코드 적용

기존

```
export function Page_Scroll_Down([selected, setSelected]) {
  useEffect(() => {
    if (!selected) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleEsc);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.documentElement.style.overflow = "";
    };
  }, [selected]);
}

// 호출
Page_Scroll_Down([selected, setSelected]);
```

개선

```
export function useEscapeAndScrollLock(state, onClose) {
  useEffect(() => {
    if (!state) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [state, onClose]);
}

// 호출
useEscapeAndScrollLock(selected, () => setSelected(null));
useEscapeAndScrollLock(showAdd, () => setShowAdd(false));
```

- 함수명을 use로 시작하고
- 인자를 destructuring 배열 대신 명확한 두 인자로 분리
- documentElement 대신 body 사용 (관습적)

---

## 2. 시맨틱 폼 구조

### 2-a. table 대신 form + flex/grid

table은 데이터 표시용이고 폼 구성에는 부적절합니다.

기존

```
<table>
  <tr>
    <td><p>이름</p><input id="name" /></td>
    <td><p>파트</p><select id="part" />...</td>
  </tr>
  <tr>
    <td colspan="2"><p>관심기술</p><input /></td>
  </tr>
</table>
```

개선

```
<form className={styles.form}>
  <div className={styles.row}>
    <div className={styles.field}>
      <label htmlFor="name">이름</label>
      <input id="name" name="name" />
    </div>
    <div className={styles.field}>
      <label htmlFor="part">파트</label>
      <select id="part" name="part">...</select>
    </div>
  </div>
  <div className={`${styles.row} ${styles.fullWidth}`}>
    <label htmlFor="skills">관심기술</label>
    <input id="skills" name="skills" />
  </div>
</form>
```

```
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.fullWidth {
  grid-template-columns: 1fr;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
```

### 2-b. label과 input 연결

label의 htmlFor와 input의 id가 같아야 클릭 시 input에 포커스가 갑니다.

```
<label htmlFor="email">이메일</label>
<input id="email" name="email" type="email" />
```

- 스크린 리더가 label과 input을 연결해서 읽어줌
- label 클릭 시 input 활성화 (UX 향상)

---

## 3. form 태그와 onSubmit 패턴

### 3-a. 버튼 onClick 대신 form onSubmit

기존

```
<table>
  <tr>...</tr>
</table>
<button onClick={() => {
  const newMember = {...};
  setMemberList((prev) => [...prev, newMember]);
}}>추가</button>
```

개선

```
<form onSubmit={handleAddSubmit}>
  ...
  <button type="submit" disabled={!isFormValid}>추가</button>
  <button type="button" onClick={() => setShowAdd(false)}>취소</button>
</form>

const handleAddSubmit = (e) => {
  e.preventDefault();
  const newMember = {...};
  setMemberList((prev) => [...prev, newMember]);
  setShowAdd(false);
  reset();
};
```

장점

- Enter 키로 제출 가능 (기본 폼 UX)
- type="submit", type="button" 명시로 의도 명확
- e.preventDefault()로 페이지 새로고침 방지
- 폼 외부 동작과 분리되어 추후 수정이 용이

---

## 4. 인라인 핸들러 vs 함수 추출

### 4-a. 짧은 핸들러는 인라인 OK

```
<button onClick={() => setShowAdd(true)}>열기</button>
<button onClick={() => setShowAdd(false)}>닫기</button>
```

- 1-2줄 정도면 인라인이 더 읽기 쉬움

### 4-b. 긴 핸들러는 함수 추출

```
// 60줄짜리 인라인 핸들러는 가독성 저하
<button onClick={() => {
  // 여기에 60줄...
}}>추가</button>
```

```
// 함수 추출
const handleAddMember = () => {
  const skillList = formData.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const newMember = {
    name: formData.name,
    part: formData.part,
    intro: formData.introduce,
    skills: skillList,
    badge: skillList[0] || "신규",
    image: `https://picsum.photos/seed/${Date.now()}/200/200`,
    introduce: [formData.introduceDetail],
    contact: {
      email: formData.email,
      phone: formData.phone,
      website: { label: formData.website, url: formData.website },
    },
    last: formData.last,
  };

  setMemberList((prev) => [...prev, newMember]);
  setShowAdd(false);
  reset();
};

<button onClick={handleAddMember}>추가</button>
```

- 컴포넌트 본문에 정의해도 매 렌더링마다 새로 만들어지지만 영향 없음
- useCallback은 props로 전달하는 핸들러에만 필요 (memo와 함께)

---

## 5. 폼 검증 패턴 심화

### 5-a. 태우의 패턴

```
const validateEmail = (v) => v.includes("@");
const validateWebsite = (v) => /^https?:\/\/.+\..+/.test(v);
const validatePhone = (v) => (v.match(/-/g) || []).length === 2 && v.length <= 13;

const warn = (field) => touched[field] && !formData[field].trim();
const warnFormat = (field) =>
  touched[field] && !!formData[field].trim() && validators[field] && !validators[field](formData[field]);
```

- touched로 사용자 입력 후에만 검증 (UX 좋음)
- warn은 빈 값, warnFormat은 형식 검증 분리

### 5-b. 이메일 검증 더 엄격하게

```
// 약한 검증
const validateEmail = (v) => v.includes("@");
// 통과: "abc@", "@abc"

// 표준에 가까운 검증
const validateEmail = (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
// 통과: "abc@def.com"
// 실패: "abc@", "@abc", "abc@def"
```

- 너무 엄격하면 정상 이메일도 거부될 수 있으니 적절히 조절
- 결국 서버에서 검증 + 인증 메일로 확인하는 게 표준

### 5-c. 전화번호 검증 정규식

```
// 태우 코드
const validatePhone = (v) =>
  (v.match(/-/g) || []).length === 2 && v.length <= 13;

// 정규식 사용
const validatePhone = (v) =>
  /^010-\d{3,4}-\d{4}$/.test(v);
```

- 정규식이 더 명확하고 의도가 드러남

---

## 6. key prop의 중요성

### 6-a. 인덱스를 key로 쓰면 안 되는 이유

```
{members.map((m, index) => <Card key={index} member={m} />)}
```

- 추가/삭제 시 인덱스가 바뀌어 React가 잘못된 DOM 재사용
- 입력값 같은 컴포넌트 내부 상태가 꼬일 수 있음

### 6-b. 고유값 사용

```
{members.map((m) => <Card key={m.name} member={m} />)}
```

- 동명이인 가능성이 있다면 id 추가:

```
const newMember = {
  id: Date.now(),
  ...
};

{members.map((m) => <Card key={m.id} member={m} />)}
```

---

## 7. 모달 처리 베스트 프랙티스

### 7-a. backdrop 클릭으로 닫기 + stopPropagation

```
<div className={styles.overlay} onClick={() => setSelected(null)}>
  <div
    className={styles.modal}
    onClick={(e) => e.stopPropagation()}
  >
    <button onClick={() => setSelected(null)}>×</button>
    ...
  </div>
</div>
```

### 7-b. 접근성 속성

```
<div
  className={styles.modal}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">{selected.name}</h2>
  ...
</div>
```

- 스크린 리더가 모달임을 인식하고 외부 페이지를 비활성화

### 7-c. 포커스 트랩 (advanced)

- 모달이 열렸을 때 Tab 키가 모달 내부에서만 순환하도록
- focus-trap 같은 라이브러리 활용 가능

---

## 8. 변수명과 의미

### 8-a. map 콜백의 단수형

```
// 의미상 어색
{memberList.map((members) => ...)}

// 자연스러움
{memberList.map((member) => ...)}
```

- 컬렉션을 순회하며 단일 요소를 다룰 때는 단수형 변수명

### 8-b. 일관된 작명

- members, member 같이 단복수를 명확히
- show + 명사 (showAdd, showModal)
- handle + 동사 (handleAddMember, handleClose)
- is + 형용사 (isFormValid, isLoading)
- on + 이벤트 (onSubmit, onChange)

---

## 9. 종합 예제 - 정리한 버전

```
import { useState, useEffect } from "react";
import styles from "./Page.module.css";
import { members as initialMembers } from "./script";

// Custom Hook (use 접두사)
function useEscapeAndScrollLock(state, onClose) {
  useEffect(() => {
    if (!state) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [state, onClose]);
}

export default function Week3Page() {
  const [memberList, setMemberList] = useState(initialMembers);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [partFilter, setPartFilter] = useState("ALL");

  useEscapeAndScrollLock(selected, () => setSelected(null));
  useEscapeAndScrollLock(showAdd, () => setShowAdd(false));

  const visibleMembers = memberList.filter(
    (m) => partFilter === "ALL" || m.part === partFilter,
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const skillList = fd.get("skills")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newMember = {
      name: fd.get("name"),
      part: fd.get("part"),
      intro: fd.get("intro"),
      skills: skillList,
      badge: skillList[0] || "신규",
      image: `https://picsum.photos/seed/${Date.now()}/200/200`,
      introduce: [fd.get("introduceDetail")],
      contact: {
        email: fd.get("email"),
        phone: fd.get("phone"),
        website: {
          label: fd.get("website"),
          url: fd.get("website"),
        },
      },
      last: fd.get("last"),
      club: "DAU_DSIS",
    };

    setMemberList((prev) => [...prev, newMember]);
    setShowAdd(false);
    e.target.reset();
  };

  const handleRemoveLast = () => {
    setMemberList((prev) => prev.slice(0, -1));
  };

  return (
    <div className={styles.weekPage}>
      <h2>3주차</h2>
      <div className={styles.controls}>
        <button onClick={() => setShowAdd(true)}>아기사자 추가</button>
        <button onClick={handleRemoveLast}>마지막 삭제</button>
        <select
          value={partFilter}
          onChange={(e) => setPartFilter(e.target.value)}
        >
          <option value="ALL">전체</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Design">Design</option>
        </select>
        <span>총 {memberList.length}명</span>
      </div>

      {visibleMembers.length === 0 ? (
        <p>해당하는 아기사자가 없습니다.</p>
      ) : (
        <div className={styles.grid}>
          {visibleMembers.map((member) => (
            <div
              key={member.name}
              className={styles.card}
              onClick={() => setSelected(member)}
            >
              <span>{member.badge}</span>
              <img src={member.image} alt={`${member.name} 프로필`} />
              <h3>{member.name}</h3>
              <p>{member.part}</p>
              <p>{member.intro}</p>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className={styles.overlay} onClick={() => setShowAdd(false)}>
          <form
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddSubmit}
          >
            <label htmlFor="name">이름</label>
            <input id="name" name="name" required />
            ...
            <button type="submit">추가</button>
            <button type="button" onClick={() => setShowAdd(false)}>
              취소
            </button>
          </form>
        </div>
      )}

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button onClick={() => setSelected(null)}>×</button>
            <h2>{selected.name}</h2>
            ...
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 10. 학습 체크리스트

이미 잘 한 것은 [v], 보완할 것은 [ ]로 표시했습니다.

- [v] useState로 상태 관리
- [v] Custom Hook으로 로직 재사용
- [v] controlled component
- [v] 폼 검증 (validateEmail, validateWebsite, validatePhone)
- [v] touched 상태로 사용자 입력 후에만 경고
- [v] isFormValid로 버튼 disabled
- [v] 모달 backdrop 클릭으로 닫기 + e.stopPropagation
- [v] ESC 키 처리
- [v] body scroll lock
- [v] introduce를 배열로 받아 map 렌더링
- [v] contact null 케이스 처리
- [ ] Custom Hook 이름을 use 접두사로 변경
- [ ] map 콜백 변수명 단수형으로 (members → member)
- [ ] map에 key prop 추가
- [ ] img 태그에 alt 속성 추가
- [ ] table 대신 form + flex/grid 구조
- [ ] p 태그 label을 label 태그로 변경
- [ ] form 태그 + onSubmit 패턴
- [ ] 긴 인라인 핸들러를 함수로 추출
- [ ] 새 멤버 image를 picsum.photos로 자동 생성
- [ ] 이메일 검증 정규식 강화
- [ ] 파트 필터 구현
- [ ] 빈 상태 메시지

---

## 11. 추가 학습 자료

- [React 공식 문서 - Hook 규칙](https://ko.react.dev/reference/rules/rules-of-hooks)
- [React 공식 문서 - Custom Hooks](https://ko.react.dev/learn/reusing-logic-with-custom-hooks)
- [React 공식 문서 - 폼](https://ko.react.dev/reference/react-dom/components/form)
- [MDN - label 요소](https://developer.mozilla.org/ko/docs/Web/HTML/Element/label)
