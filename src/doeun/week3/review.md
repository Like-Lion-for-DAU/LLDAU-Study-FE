# 3주차 도은 과제 리뷰

useState, FormData, form onSubmit 패턴, 함수 분리(memberadd.js)까지 React 기본기를 잘 잡았습니다.
다만 새 멤버에 이미지 필드 누락과 상세 카드 부재로 추가한 데이터를 화면에서 확인할 수 없는 점이 가장 큰 이슈입니다.
정답에 있는 상세 카드, 본인 강조, 파트 필터 등 누락된 기능들을 보완하면 좋아질 것 같습니다.

## 1. 새 멤버에 image 필드 누락

```
// memberadd.js
export const createNewMember = (event) => {
  const formData = new FormData(event.target);

  return {
    name: formData.get("name"),
    part: formData.get("part"),
    tech: formData.get("tech"),
    intro: formData.get("intro"),
    description: formData.get("description"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    comment: formData.get("comment")
    // image 필드 없음
  };
};
```

- 새로 추가된 멤버 카드의 이미지 영역이 빈 칸이 됩니다.
- 폼에 이미지 입력 필드도 없고, 자동 생성도 안 됩니다.

```
// memberadd.js 개선
export const createNewMember = (event) => {
  const formData = new FormData(event.target);

  return {
    name: formData.get("name"),
    part: formData.get("part"),
    tech: formData.get("tech"),
    intro: formData.get("intro"),
    description: formData.get("description"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    comment: formData.get("comment"),
    image: `https://picsum.photos/seed/${Date.now()}/200/200`,
    isMe: false,
  };
};
```

- picsum.photos는 시드(seed)에 따라 다른 랜덤 이미지를 반환합니다.
- 또는 폼에 이미지 URL 입력 필드를 추가할 수도 있습니다.

## 2. 상세 카드(자기소개/연락처) 누락 - 입력한 데이터를 볼 수 없음

```
<div className={styles.week3CardGrid}>
  {memberList.map((member, index) => (
    <div key={...} className={styles.week3card}>
      <img />
      <span>{member.tech}</span>
      <h3>{member.name}</h3>
      <span>{member.part}</span>
      <p>{member.intro}</p>  // 한 줄 소개만 표시
    </div>
  ))}
</div>
```

- 폼에서 description, email, phone, website, comment를 입력받지만
- 화면에는 이름, 파트, 한 줄 소개, tech, 이미지만 표시됩니다.
- 입력한 자기소개/연락처/한 마디 등을 어디서도 확인할 수 없습니다.

정답에서는 카드 클릭 시 상세 카드로 스크롤하거나, 별도 상세 카드 섹션을 두어 모든 정보를 보여줍니다.

```
<section className={styles.profileDetailList}>
  {memberList.map((member) => (
    <section key={member.name} className={styles.profileDetail}>
      <header>
        <h1>{member.name}</h1>
        <span>{member.part}</span>
      </header>
      <section>
        <h3>자기소개</h3>
        <p>{member.description}</p>
      </section>
      <section>
        <h3>연락처</h3>
        <ul>
          <li>Email: {member.email}</li>
          <li>Phone: {member.phone}</li>
          <li>{member.website}</li>
        </ul>
      </section>
      <section>
        <h3>한 마디</h3>
        <p>{member.comment}</p>
      </section>
    </section>
  ))}
</section>
```

## 3. 본인 카드 강조 누락

```
// week2의 member.js (data)
{
  name: "이도은",
  isMe: true,
  ...
}

// Page.jsx의 카드
<div className={styles.week3card}>  // isMe 활용 X
```

- week2의 `member.js`에 isMe: true가 이미 있는데 카드에서 활용하지 않습니다.
- 본인 카드를 시각적으로 강조하려면 조건부 클래스를 적용해야 합니다.

```
<div className={`${styles.week3card} ${member.isMe ? styles.myCard : ""}`}>
```

```
.myCard {
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 16px rgba(0, 51, 100, 0.15);
}
```

## 4. import 경로가 어색함

```
import { memberspro } from '../../doeun/week2/member.js';
```

- 현재 파일 위치: `src/doeun/week3/`
- import 경로: `../../doeun/week2/` (한 번 상위 → 다시 doeun으로 들어옴)
- 같은 doeun 폴더 안에서 한 번 빠져나갔다가 다시 들어오는 모양새가 어색합니다.

```
import { memberspro } from '../week2/member.js';
```

- `../week2/`로 한 단계만 올라갔다가 형제 폴더로 가는 게 더 자연스럽습니다.

## 5. week2의 memberspro를 직접 사용 - 데이터 결합도 높음

```
import { memberspro } from '../week2/member.js';

const [memberList, setMemberList] = useState(memberspro);
```

- week2와 week3가 같은 데이터 소스를 직접 공유합니다.
- week2의 데이터가 바뀌면 week3에도 자동으로 영향이 갑니다.
- week3 안에 별도의 members.js를 만들어 관리하는 것이 더 안전합니다.

```
// src/doeun/week3/members.js
import { memberspro } from '../week2/member.js';

export const initialMembers = memberspro;
// 또는 deep copy로 격리
// export const initialMembers = JSON.parse(JSON.stringify(memberspro));
```

## 6. label에 htmlFor 누락 - 접근성 위반

```
<label>이름</label>
<input name="name" type="text" />
```

- label과 input이 시각적으로만 가까이 있을 뿐 연결되지 않습니다.
- 스크린 리더 사용자가 어떤 input인지 알 수 없습니다.
- label을 클릭해도 input에 포커스가 가지 않습니다.

```
<label htmlFor="name">이름</label>
<input id="name" name="name" type="text" required />
```

- htmlFor와 input의 id를 매칭시켜야 접근성이 확보됩니다.

## 7. required 속성 일관성 부족

```
<input name="name" required />        // O
<select name="part" required>...      // O
<input name="tech" />                 // X
<input name="intro" />                // X
<textarea name="description" />       // X
<input name="email" type="email" />   // X (필수일 텐데)
<input name="phone" required />       // O
<input name="website" type="url" />   // X
<input name="comment" />              // X
```

- 일부 필드만 required가 적용되어 있습니다.
- 빈 값으로 추가될 수 있어 데이터 품질이 떨어집니다.

```
<input name="email" type="email" required />
<input name="website" type="url" required />
<textarea name="description" required />
```

## 8. && 체크 불필요

```
{memberList && memberList.map((member, index) => (...))}
```

- memberList는 useState(memberspro)로 초기화되어 항상 배열입니다.
- null/undefined가 될 일이 없으므로 `&&` 체크가 불필요합니다.

```
{memberList.map((member, index) => (...))}
```

## 9. key에 index 포함 - 추가/삭제 시 안정성 문제

```
<div key={`${member.name}-${index}`} ...>
```

- 동명이인 대비로 index를 추가했지만, index가 들어가면 추가/삭제 시 key가 바뀝니다.
- 고유한 id를 데이터에 추가하는 것이 더 안전합니다.

```
// memberadd.js
return {
  id: Date.now(),
  ...
};

// Page.jsx
<div key={member.id || member.name}>
```

## 10. 함수형 setState 미사용

```
const handleSubmit = (e) => {
  ...
  setMemberList([...memberList, newMember]);
};

const handleDeleteLast = () => {
  setMemberList(removeLastMember(memberList));
};
```

- 현재 state를 직접 참조해서 새 배열을 만듭니다.
- React에서는 함수형 setState를 권장합니다.

```
setMemberList((prev) => [...prev, newMember]);
setMemberList((prev) => prev.slice(0, -1));
```

- 빠른 클릭이나 비동기 처리 시에도 항상 최신 state를 기반으로 안전하게 업데이트됩니다.

## 11. 누락된 기능

### 11-a. 파트 필터

- 정답에는 ALL/Frontend/Backend/Design 셀렉트 박스로 멤버를 필터링하는 기능이 있습니다.

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

### 11-b. 빈 상태 메시지

- 멤버가 0명이거나 필터 결과가 없을 때 안내 메시지가 없습니다.

```
{memberList.length === 0 ? (
  <p>아직 등록된 아기사자가 없습니다.</p>
) : (
  memberList.map(...)
)}
```

### 11-c. ESC 키로 폼 닫기

- 폼이 열려있을 때 ESC 키를 누르면 닫히는 것이 일반적인 UX입니다.

```
useEffect(() => {
  if (!showForm) return;
  const handleEsc = (e) => {
    if (e.key === "Escape") setShowForm(false);
  };
  window.addEventListener("keydown", handleEsc);
  return () => window.removeEventListener("keydown", handleEsc);
}, [showForm]);
```

### 11-d. 카드 클릭 시 상세 정보 표시

- 정답에는 카드 클릭 시 해당 상세 카드로 스크롤되는 기능이 있습니다.
- 또는 모달로 표시할 수도 있습니다.

## 12. 잘한 점

- useState로 상태 관리 잘 했습니다 (memberList, showForm).
- form 태그 + onSubmit 패턴으로 폼 처리했습니다.
- FormData로 폼 데이터 추출 잘 했습니다.
- 함수 분리(createNewMember, removeLastMember)로 비즈니스 로직과 UI 분리했습니다.
- type="email", type="url"로 HTML 기본 검증 활용했습니다.
- 취소 버튼에 type="button" 명시했습니다.
- 조건부 렌더링({showForm && <form />})으로 폼 토글 깔끔하게 처리했습니다.
- alt 속성에 멤버 이름 사용했습니다.
- JSDoc 주석으로 함수 설명 추가했습니다 (좋은 습관).

## 13. 핵심 학습 포인트

- 3주차의 핵심인 useState, form onSubmit, FormData를 잘 활용했습니다.
- memberadd.js로 함수 분리한 것도 좋습니다.
- 보완 할 점: 새 멤버 image 필드 추가, 상세 카드 섹션 구현(입력한 데이터를 화면에 표시).
- 추가: 본인 카드 isMe 활용, 파트 필터, 빈 상태, ESC 처리, label htmlFor 연결, required 일관성.
- 같은 폴더의 study.md에 React 폼 패턴과 데이터 흐름 설계를 정리했으니 참고하세요.
