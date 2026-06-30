# 3주차 태우 과제 리뷰

useState, custom hook, controlled component, 폼 검증, 모달 backdrop/ESC 처리까지
3주차에서 요구되는 React 패턴을 풍부하게 구현했습니다.
정답에 없는 폼 검증 UX, custom hook 분리까지 추가로 구현했네요.
다만 React Hook 명명 규칙, 일부 시맨틱, 접근성 이슈를 보완하면 더 좋아질 것 같습니다.

## 1. Custom Hook은 use 접두사로 명명해야 함 / Hook 명명법

```
export function Page_Scroll_Down([selected, setSelected]) {
  useEffect(() => {
    ...
  }, [selected]);
}
```

- 함수 안에서 useEffect를 호출하므로 React Custom Hook입니다.
- React 규칙상 Hook은 반드시 `use`로 시작해야 합니다.
- ESLint plugin-react-hooks가 이 규칙을 검사하며, 어기면 경고를 발생시킵니다.

```
export function usePageScrollLock(state, setState) {
  useEffect(() => {
    if (!state) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setState(null);
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [state]);
}

// 사용
usePageScrollLock(selected, setSelected);
usePageScrollLock(showAdd, setShowAdd);
```

- 이름만 바꿔도 React가 정상 인식하고 ESLint 경고도 사라집니다.

## 2. map 콜백의 변수명이 복수형(members) / 단수형 변경

```
{memberList.map((members) => (
  <div onClick={() => setSelected(members)} ...>
    ...
    <span>{members.badge}</span>
    ...
  </div>
))}
```

- 배열의 각 요소를 가리키는데 `members`라는 복수형 이름을 썼습니다.
- 한 명의 멤버 객체이므로 단수형 `member`가 의미상 적절합니다.

```
{memberList.map((member) => (
  <div onClick={() => setSelected(member)} ...>
    <span>{member.badge}</span>
  </div>
))}
```

## 3. map에 key prop 누락 / map key 업데이트

```
{memberList.map((members) => (
  <div onClick={...} className={...}>  // key 없음
    ...
  </div>
))}
```

- React가 리스트 항목을 추적할 수 없어 콘솔에 경고가 출력됩니다.
- 추가/삭제 시 React가 잘못된 DOM을 재사용할 수 있습니다.

```
{memberList.map((member) => (
  <div key={member.name} onClick={...} className={...}>
    ...
  </div>
))}
```

- 동명이인이 없다면 name을 key로 써도 되고, id를 별도로 추가하는 것이 더 안전합니다.

## 4. img 태그의 alt 속성 누락 / 2주동안 적혀있었는데 안한 레전드 보법 

```
<img className={styles["profileImage"]} src={members.image} />
```

- alt 없는 이미지는 접근성(스크린 리더)에서 문제가 됩니다.
- 이미지 로드 실패 시에도 빈 영역만 보입니다.

```
<img
  className={styles["profileImage"]}
  src={member.image}
  alt={`${member.name} 프로필`}
/>
```

## 5. 새 멤버 이미지가 placeholder URL로 고정 / 5번 끝

```
const newMember = {
  ...,
  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:...",
};
```

- 새로 추가되는 멤버 모두 같은 회색 placeholder 이미지가 됩니다.
- 정답처럼 picsum.photos로 자동 생성하면 멤버마다 다른 이미지를 보여줄 수 있습니다.

```
image: `https://picsum.photos/seed/${Date.now()}/200/200`,
```

## 6. table 태그로 폼 구성 / 2주차에 해결해놓음

```
<table className={styles["pushLionTable"]}>
  <tr>
    <td><p>이름</p>
      <input id="name" ... />
    </td>
    ...
  </tr>
</table>
```

- HTML 잔재로, 시맨틱적으로 적절하지 않습니다.
- 폼은 `<form>` + flex/grid CSS로 구성하는 것이 React와 모던 웹에서 일반적입니다.
- `colspan`도 CSS로 충분히 대체 가능합니다.

```
<form className={styles["pushLionForm"]}>
  <div className={styles["formRow"]}>
    <div className={styles["formField"]}>
      <label htmlFor="name">이름</label>
      <input id="name" ... />
    </div>
    <div className={styles["formField"]}>
      <label htmlFor="part">파트</label>
      <select id="part">...</select>
    </div>
  </div>
  <div className={`${styles["formRow"]} ${styles["fullWidth"]}`}>
    <label htmlFor="skills">관심기술</label>
    <input id="skills" ... />
  </div>
  ...
</form>
```

## 7. p 태그로 label 대체 / label로 대체 완료

```
<p>이름</p>
<input id="name" ... />
```

- `<p>`는 시각적 효과만 있고 input과 연결되지 않습니다.
- 스크린 리더 사용자는 어떤 input인지 인식 못합니다.

```
<label htmlFor="name">이름</label>
<input id="name" ... />
```

## 8. form 태그 미사용 - submit 패턴 활용 안 함 / submit 패턴으로 바꿈 

```
<button onClick={() => {
  const skillList = ...;
  const newMember = {...};
  setMemberList((prev) => [...prev, newMember]);
  setShowAdd(false);
}}>
추가</button>
```

- table 안에 input들이 있지만 `<form>` 태그로 감싸지 않았습니다.
- Enter 키로 제출 같은 기본 폼 UX가 작동하지 않습니다.
- onSubmit 패턴을 쓰면 type="submit" 버튼만으로 처리 가능합니다.

```
<form onSubmit={handleAddSubmit}>
  <input ... />
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

## 9. onClick 인라인 핸들러가 너무 길어 가독성 저하 / jsx 안으로 함수 추출

```
<button onClick={() => {
  const skillList = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const newMember = {
    name: formData.name,
    part: formData.part,
    intro: formData.introduce,
    club: "DAU_DSIS",
    badge: skillList[0] || "신규",
    image: "https://...",
    introduce: [formData.introduceDetail],
    contact: {
      email: formData.email,
      phone: formData.phone,
      website: { label: formData.website, url: formData.website },
    },
    skills: skillList,
    last: formData.last,
  };
  setMemberList((prev) => [...prev, newMember]);
  setShowAdd(false);
}}>
추가</button>
```

- onClick 안에 60줄 가까운 로직이 들어있어 JSX 가독성이 떨어집니다.
- 별도 함수로 추출하면 더 깔끔해집니다.

```
const handleAddMember = () => {
  const skillList = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const newMember = {
    name: formData.name,
    part: formData.part,
    intro: formData.introduce,
    club: "DAU_DSIS",
    badge: skillList[0] || "신규",
    image: "https://...",
    introduce: [formData.introduceDetail],
    contact: {
      email: formData.email,
      phone: formData.phone,
      website: { label: formData.website, url: formData.website },
    },
    skills: skillList,
    last: formData.last,
  };
  setMemberList((prev) => [...prev, newMember]);
  setShowAdd(false);
  reset();
};

<button onClick={handleAddMember}>추가</button>
```

## 10. club 데이터 모두 "DAU_DSIS"로 고정 / emptyform에 club key 추가, AddSubmit에서 forData.club 받음

```
{
  name: "임도영",
  club: "DAU_DSIS",  // 실제로는 디스이즈
  ...
},
{
  name: "이도은",
  club: "DAU_DSIS",  // 실제로는 LION TRACK
  ...
}
```

- 멤버마다 실제 동아리가 다른데 모두 "DAU_DSIS"로 통일되어 있습니다.
- 정확한 정보로 분리하는 것이 좋습니다.

## 11. 이메일 검증이 너무 약함 / 정규식 변경 완료

```
const validateEmail = (v) => v.includes("@");
```

- "abc@", "@abc", "@@@@" 같은 잘못된 형식도 통과합니다.
- 더 엄격한 정규식 사용 권장합니다.

```
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
```

## 12. 누락된 기능

### 12-a. 파트 필터 /구현 완료

- 정답에는 ALL/Frontend/Backend/Design 필터가 있습니다.

```
const [partFilter, setPartFilter] = useState("ALL");

const visibleMembers = memberList.filter(
  (m) => partFilter === "ALL" || m.part === partFilter
);

<select value={partFilter} onChange={(e) => setPartFilter(e.target.value)}>
  <option value="ALL">전체</option>
  <option value="Frontend">Frontend</option>
  <option value="Backend">Backend</option>
  <option value="Design">Design</option>
</select>

{visibleMembers.map(...)}
```

### 13-b. 빈 상태 메시지 / 필터와 총인원 없을때 안내메시지 구분

- 멤버가 0명이거나 필터 결과가 없을 때 안내 메시지가 없습니다.

```
{visibleMembers.length === 0 ? (
  <p>해당하는 아기사자가 없습니다.</p>
) : (
  visibleMembers.map(...)
)}
```

## 14. 잘한 점

- useState로 상태 관리 잘 했습니다 (memberList, selected, showAdd).
- Custom Hook(useFormData) 분리해서 폼 로직 재사용 가능하게 만들었습니다.
- controlled component 패턴 잘 적용했습니다.
- 폼 검증 로직이 정말 우수합니다 (validateEmail, validateWebsite, validatePhone).
- touched 상태로 사용자가 입력한 후에만 경고 표시 (좋은 UX).
- isFormValid로 추가 버튼 disabled 처리 잘 했습니다.
- 모달 backdrop 클릭으로 닫기 + e.stopPropagation 패턴 잘 사용했습니다.
- ESC 키 처리와 body scroll lock까지 구현했습니다.
- 모달 두 개(추가 모달, 자기소개 모달) 분리했습니다.
- contact, skills, last가 null인 멤버 처리 잘 했습니다 (정서윤, 김아기사자, 최아기사자).
- introduce 배열로 받아서 map으로 렌더링하여 줄바꿈 처리.

## 15. 핵심 학습 포인트

- 3주차에서 요구되는 모든 핵심 패턴을 잘 활용했고, custom hook과 폼 검증 UX까지 추가로 구현했습니다.
- 보완할 부분: Hook 명명 규칙(use 접두사), key prop, alt 속성, label 시맨틱, table → form 구조, 이메일 검증 강화, 파트 필터, 빈 상태 메시지.
- 같은 폴더의 study.md에 React Hook 규칙과 폼 베스트 프랙티스를 정리했으니 참고하세요.
