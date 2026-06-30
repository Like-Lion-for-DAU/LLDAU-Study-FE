# React 폼 패턴과 데이터 흐름 설계

3주차 과제의 핵심 개념을 정리한 학습 자료입니다.
useState, FormData, onSubmit, 함수 분리까지는 잘 활용하셨으니
이제 데이터 완성도, 상세 카드 구조, 추가 UX 패턴을 보완하는 데 도움이 되도록 작성했습니다.

---

## 1. 입력한 데이터를 화면에 모두 보여주기

### 1-a. 데이터 흐름의 핵심

폼에서 입력받은 데이터는 어딘가에서 표시되어야 합니다.
입력은 받지만 화면에 안 보이면 사용자는 추가가 됐는지 알 수 없습니다.

```
폼 입력 → state 저장 → 화면 표시
```

### 1-b. 도은 코드의 문제

```
// 폼에서 9개 필드 입력
formData.get("name"), part, tech, intro, description,
email, phone, website, comment

// 카드에는 5개만 표시
<h3>{member.name}</h3>
<span>{member.part}</span>
<p>{member.intro}</p>
<img src={member.image} />
<span>{member.tech}</span>

// description, email, phone, website, comment는 어디서 보지?
```

- 입력은 받지만 description, email 등을 표시할 곳이 없습니다.
- 결과적으로 사용자는 자신이 입력한 정보를 확인할 수 없습니다.

### 1-c. 두 가지 해결책

해결 1: 상세 카드 섹션 추가 (정답 방식)

```
<div className={styles.cardGrid}>
  {memberList.map((m) => (
    <SummaryCard key={m.name} member={m} />
  ))}
</div>

<div className={styles.detailList}>
  {memberList.map((m) => (
    <DetailCard key={m.name} member={m} />
  ))}
</div>
```

- 요약 카드는 핵심 정보만 (이름, 파트, 한 줄 소개, 이미지, tech)
- 상세 카드는 모든 정보 (자기소개, 연락처, 한 마디 등)

해결 2: 모달로 상세 표시

```
const [selected, setSelected] = useState(null);

<div onClick={() => setSelected(member)}>
  요약 카드
</div>

{selected && (
  <Modal member={selected} onClose={() => setSelected(null)} />
)}
```

- 카드 클릭 → 모달에 모든 정보 표시
- UI가 간결해지지만 클릭 후에야 정보 확인 가능

---

## 2. 기본값 챙기기 - image, isMe 등

### 2-a. 폼에서 받지 않는 필드는 기본값으로

```
// memberadd.js (현재)
return {
  name: formData.get("name"),
  part: formData.get("part"),
  ...
  // image, isMe 등 누락
};
```

### 2-b. 추가해야 할 기본값

```
// memberadd.js (개선)
return {
  id: Date.now(),  // 고유 id (key용)
  name: formData.get("name"),
  part: formData.get("part"),
  tech: formData.get("tech"),
  intro: formData.get("intro"),
  description: formData.get("description"),
  email: formData.get("email"),
  phone: formData.get("phone"),
  website: formData.get("website"),
  comment: formData.get("comment"),
  image: `https://picsum.photos/seed/${Date.now()}/200/200`, // 자동 이미지
  isMe: false,  // 본인 아님
};
```

### 2-c. 폼에 이미지 URL 필드 추가하는 옵션

```
<label htmlFor="image">이미지 URL (선택)</label>
<input id="image" name="image" type="url" placeholder="비워두면 자동 생성" />

// memberadd.js
const imageInput = formData.get("image");
return {
  ...,
  image: imageInput || `https://picsum.photos/seed/${Date.now()}/200/200`,
};
```

---

## 3. 함수형 setState 패턴

### 3-a. 직접 참조 vs 함수형

```
// 직접 참조 (현재 도은 코드)
setMemberList([...memberList, newMember]);
setMemberList(removeLastMember(memberList));

// 함수형 (권장)
setMemberList((prev) => [...prev, newMember]);
setMemberList((prev) => prev.slice(0, -1));
```

### 3-b. 왜 함수형이 안전한가?

```
// 빠른 클릭으로 두 번 호출되는 경우
setMemberList([...memberList, newMember1]); // 0개 + 1
setMemberList([...memberList, newMember2]); // 0개 + 1 (memberList가 아직 갱신 안 됨)
// 결과: 1명만 추가
```

```
// 함수형은 항상 최신 prev를 받음
setMemberList((prev) => [...prev, newMember1]); // prev: 0개 → 1개
setMemberList((prev) => [...prev, newMember2]); // prev: 1개 → 2개
// 결과: 2명 추가
```

- React는 setState를 batching할 때도 함수형을 안전하게 처리
- 비동기 콜백, 타이머 등에서 특히 중요

---

## 4. label과 input 연결

### 4-a. htmlFor 없이 label만 쓰면

```
<label>이름</label>
<input name="name" />
```

- 시각적으로는 라벨처럼 보이지만 input과 연결되지 않음
- 스크린 리더가 인식 못 함
- 라벨 클릭해도 input에 포커스 안 됨

### 4-b. htmlFor + id로 연결

```
<label htmlFor="name">이름</label>
<input id="name" name="name" />
```

- 접근성 확보
- 라벨 클릭 → input 포커스
- 스크린 리더가 "이름, 입력 필드"로 읽어줌

### 4-c. label로 input을 감싸는 방식

```
<label>
  이름
  <input name="name" />
</label>
```

- htmlFor/id 없이도 자동 연결
- HTML 표준 패턴

---

## 5. import 경로 깔끔하게

### 5-a. 도은 코드의 어색한 경로

```
// 현재 위치: src/doeun/week3/Page.jsx
import { memberspro } from '../../doeun/week2/member.js';
// ../../doeun/week2/ → 한 번 위로 → 다시 doeun으로 들어옴
```

### 5-b. 더 자연스러운 경로

```
import { memberspro } from '../week2/member.js';
// ../week2/ → 형제 폴더로 직접
```

### 5-c. 절대 경로 alias 활용 (advanced)

vite.config.js나 tsconfig.json에 alias를 설정하면

```
import { memberspro } from '@/doeun/week2/member';
```

- 깊은 경로에서도 명확하게 import 가능
- 파일 이동 시 경로 수정 부담 감소

---

## 6. 데이터 결합도 줄이기

### 6-a. week2와 week3가 같은 데이터 공유 시 위험

```
// week2/member.js
export const memberspro = [...];

// week3/Page.jsx
import { memberspro } from '../week2/member.js';
const [memberList, setMemberList] = useState(memberspro);
```

- week2의 데이터 형식이 바뀌면 week3도 영향받음
- week3에서 추가/삭제해도 useState 안에서만 변경되므로 week2에는 영향 없음 (다행)
- 하지만 새 필드 추가 시 두 곳 모두 고려해야 함

### 6-b. week3 자체 데이터로 분리

```
// week3/members.js (신규)
import { memberspro } from '../week2/member.js';

// 새 필드 추가나 변형이 필요하면 여기서 처리
export const initialMembers = memberspro.map((m) => ({
  ...m,
  id: m.name,  // 임시 id
  description: m.intro,  // 임시로 intro 복사
  email: "",
  phone: "",
  website: "",
  comment: "",
}));
```

```
// week3/Page.jsx
import { initialMembers } from './members';
const [memberList, setMemberList] = useState(initialMembers);
```

- week3 전용 데이터 가공 로직을 한 곳에 모음
- week2와 의존성 분리

---

## 7. required 일관성

### 7-a. HTML required 속성

```
<input name="name" required />
```

- 빈 값으로 폼 제출 시 브라우저가 자동으로 경고
- required 적용된 필드는 채워야 form submit 가능

### 7-b. 도은 코드의 비일관성

```
<input name="name" required />        // O
<input name="tech" />                  // X
<input name="email" type="email" />    // X
<input name="phone" required />        // O
```

- 어떤 필드는 required, 어떤 필드는 아닌 이유가 명확하지 않음
- 사용자가 한 가지 필드만 입력하고 제출하면 데이터가 부실해짐

### 7-c. 일괄 적용 또는 명시적 분리

모두 필수

```
<input name="name" required />
<input name="tech" required />
<input name="email" type="email" required />
...
```

선택 항목 명시

```
<label htmlFor="website">Website (선택)</label>
<input id="website" name="website" type="url" />
```

---

## 8. ESC 키 + body scroll lock

### 8-a. 폼 모달이 열렸을 때 ESC로 닫기

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

### 8-b. 폼이 열렸을 때 배경 스크롤 막기

```
useEffect(() => {
  if (!showForm) return;

  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "";
  };
}, [showForm]);
```

### 8-c. 두 개를 한 useEffect로 통합

```
useEffect(() => {
  if (!showForm) return;

  const handleEsc = (e) => {
    if (e.key === "Escape") setShowForm(false);
  };
  window.addEventListener("keydown", handleEsc);
  document.body.style.overflow = "hidden";

  return () => {
    window.removeEventListener("keydown", handleEsc);
    document.body.style.overflow = "";
  };
}, [showForm]);
```

---

## 9. 종합 예제 - 정리한 버전

```
import { useState, useEffect } from "react";
import styles from "./Page.module.css";
import { memberspro } from "../week2/member.js";
import { createNewMember } from "./memberadd.js";

export default function Week3Page() {
  const [memberList, setMemberList] = useState(memberspro);
  const [showForm, setShowForm] = useState(false);
  const [partFilter, setPartFilter] = useState("ALL");

  const visibleMembers = memberList.filter(
    (m) => partFilter === "ALL" || m.part === partFilter,
  );

  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowForm(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showForm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMember = createNewMember(e);
    setMemberList((prev) => [...prev, newMember]);
    setShowForm(false);
    e.target.reset();
  };

  const handleRemoveLast = () => {
    setMemberList((prev) => prev.slice(0, -1));
  };

  return (
    <div className={styles.weekPage}>
      <div className={styles.controls}>
        <button onClick={() => setShowForm((p) => !p)}>아기사자 추가</button>
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

      {showForm && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">이름</label>
          <input id="name" name="name" required />

          <label htmlFor="part">파트</label>
          <select id="part" name="part" required>
            <option value="">선택</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
          </select>

          <label htmlFor="tech">관심 기술</label>
          <input id="tech" name="tech" required />

          <label htmlFor="intro">한 줄 소개</label>
          <input id="intro" name="intro" required />

          <label htmlFor="description">자기소개</label>
          <textarea id="description" name="description" required />

          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />

          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" required />

          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="url" />

          <label htmlFor="comment">한 마디</label>
          <input id="comment" name="comment" required />

          <button type="submit">추가하기</button>
          <button type="button" onClick={() => setShowForm(false)}>
            취소
          </button>
        </form>
      )}

      {visibleMembers.length === 0 ? (
        <p>해당하는 아기사자가 없습니다.</p>
      ) : (
        <>
          <div className={styles.cardGrid}>
            {visibleMembers.map((m) => (
              <div
                key={m.id || m.name}
                className={`${styles.card} ${m.isMe ? styles.myCard : ""}`}
              >
                <img src={m.image} alt={`${m.name} 프로필`} />
                <span>{m.tech}</span>
                <h3>{m.name}</h3>
                <span>{m.part}</span>
                <p>{m.intro}</p>
              </div>
            ))}
          </div>

          <div className={styles.detailList}>
            {visibleMembers.map((m) => (
              <section key={m.id || m.name} className={styles.detail}>
                <h2>{m.name}</h2>
                <p>{m.part}</p>
                <h3>자기소개</h3>
                <p>{m.description}</p>
                <h3>연락처</h3>
                <ul>
                  <li>Email: {m.email}</li>
                  <li>Phone: {m.phone}</li>
                  {m.website && <li>{m.website}</li>}
                </ul>
                <h3>한 마디</h3>
                <p>{m.comment}</p>
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

- [v] useState로 상태 관리
- [v] form 태그 + onSubmit 패턴
- [v] FormData로 폼 데이터 추출
- [v] 함수 분리 (memberadd.js로 createNewMember, removeLastMember)
- [v] type="email", type="url"로 HTML 기본 검증
- [v] type="button" 명시 (취소 버튼)
- [v] 조건부 렌더링 ({showForm && ...})
- [v] alt 속성에 멤버 이름 사용
- [v] JSDoc 주석 활용
- [ ] 새 멤버 image 필드 추가 (picsum.photos 등)
- [ ] 새 멤버 isMe: false 기본값 추가
- [ ] 상세 카드 섹션 또는 모달로 입력한 데이터 모두 표시
- [ ] 본인 카드 isMe 활용한 강조
- [ ] import 경로 정리 (../week2/)
- [ ] label에 htmlFor 추가
- [ ] required 일관성 (모든 필수 필드)
- [ ] && 체크 제거 (memberList는 항상 배열)
- [ ] key를 인덱스 없는 고유값으로
- [ ] 함수형 setState 패턴
- [ ] 파트 필터 구현
- [ ] 빈 상태 메시지
- [ ] ESC 키로 폼 닫기

---

## 11. 추가 학습 자료

- [React 공식 문서 - 폼 처리](https://ko.react.dev/reference/react-dom/components/form)
- [React 공식 문서 - state 업데이트](https://ko.react.dev/learn/queueing-a-series-of-state-updates)
- [MDN - label 요소](https://developer.mozilla.org/ko/docs/Web/HTML/Element/label)
- [MDN - FormData](https://developer.mozilla.org/ko/docs/Web/API/FormData)
