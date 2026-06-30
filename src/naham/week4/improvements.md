# 5주차 나함 코드 개선 과제 리뷰

1~4주차 리뷰/study에서 지적한 개선사항을 4주차 컴포넌트에 적용한 결과물 기준으로,
런타임 영향이 있거나 미완 상태인 부분만 정리합니다.

## 1. import 구문 위치가 잘못됨 + 존재하지 않는 lions.js에서 import - 빌드 깨질 가능성

```
// 파일 최상단 (line 1~7)
import nhProfile from "./nhprofile.png";
import dyProfile from "./dyprofile.png";
...

// line 9~57 - 데이터 정의가 import 사이에 끼어있음
export const initialLions = [ ... ];

// line 59~61 - 또다시 import (파일 중간)
import { useState, useEffect, useRef } from "react";
import styles from "./Page.module.css";
import { initialLions } from "./lions";    // 존재하지 않는 파일에서 initialLions를 import
```

문제점:

- ES6 import 구문은 파일 최상단에 모여있어야 합니다. 중간에 다른 코드를 끼우면 ESLint 경고 + 일부 번들러에서 에러.
- `import { initialLions } from "./lions"`는 `src/naham/week4/lions.js`를 찾는데, 그 파일이 존재하지 않습니다. Vite/webpack은 "Module not found"로 빌드 실패.
- 또한 같은 파일에서 `export const initialLions = [...]`로 선언한 변수를 다시 import하려고 하는 건 자기 자신과 충돌.

### 해결 - 둘 중 하나

**A. lions.js 파일 분리 (권장)**

```
// src/naham/week4/lions.js 새 파일 생성
import nhProfile from "./nhprofile.png";
import dyProfile from "./dyprofile.png";
import jwProfile from "./jwprofile.gif";
import twProfile from "./twprofile.png";
import smProfile from "./smprofile.png";
import deProfile from "./deprofile.jpg";
import syProfile from "./syprofile.png";

export const initialLions = [
  { id: 1, name: "김나함", ... },
  { id: 2, name: "임도영", ... },
  ...
];
```

```
// src/naham/week4/Page.jsx - import만 최상단에
import { useState, useEffect, useRef } from "react";
import styles from "./Page.module.css";
import { initialLions } from "./lions";

export default function Week4Page() { ... }
```

**B. 같은 파일에 두기 (분리 안 함)**

```
// Page.jsx 최상단으로 모든 import 모으기
import { useState, useEffect, useRef } from "react";
import styles from "./Page.module.css";
import nhProfile from "./nhprofile.png";
import dyProfile from "./dyprofile.png";
import jwProfile from "./jwprofile.gif";
import twProfile from "./twprofile.png";
import smProfile from "./smprofile.png";
import deProfile from "./deprofile.jpg";
import syProfile from "./syprofile.png";

// 잘못된 import { initialLions } from "./lions" 라인은 삭제

const initialLions = [
  { id: 1, name: "김나함", ... },
  ...
];

export default function Week4Page() { ... }
```

- A 방식이 코드 가독성에 더 좋습니다. Page.jsx에는 컴포넌트 로직만, lions.js에는 데이터만.

## 2. 인라인 style 잔존 - CSS Modules로 분리 필요

```
<span style={{ marginLeft: '15px' }}>총 {filteredLions.length}명</span>
<span style={{ fontWeight: 'bold', color: '#555' }}>{lion.part}</span>
<p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>{lion.intro}</p>
```

- 로딩 배너/에러 배너는 CSS로 잘 분리했는데, 카운트/파트/소개 3곳에 인라인 style이 남았습니다.
- 4주차 review #1에서 지적했던 항목.

### 해결 - Page.module.css에 클래스 추가하고 className으로 변경

```
/* Page.module.css */
.totalCount {
  margin-left: 15px;
}

.cardPart {
  font-weight: bold;
  color: #555;
}

.cardIntro {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}
```

```
<span className={styles.totalCount}>총 {filteredLions.length}명</span>
...
<span className={styles.cardPart}>{lion.part}</span>
<p className={styles.cardIntro}>{lion.intro}</p>
```

## 3. 로딩/에러 배너의 이모지

```
<div className={styles.loadingBanner} role="status">
  ⏳ 외부 서버에서 데이터를 가져오는 중입니다... 잠시만 기다려주세요.
</div>

<div className={styles.errorBanner} role="alert">
  <span>🚨 {errorMessage}</span>
  ...
</div>
```

- `⏳`, `🚨` 이모지가 메시지에 포함되어 있습니다.
- 디자인 선택일 수 있지만, 다른 코드/문서와 톤을 맞추려면 텍스트만 또는 CSS로 별도 아이콘 처리.

### 해결 - 이모지 제거 (텍스트만)

```
<div className={styles.loadingBanner} role="status">
  외부 서버에서 데이터를 가져오는 중입니다... 잠시만 기다려주세요.
</div>

<div className={styles.errorBanner} role="alert">
  <span>{errorMessage}</span>
  <button onClick={() => lastFetchActionRef.current?.()}>재시도</button>
</div>
```

### 해결 - 시각 강조가 필요하다면 CSS로 색상 강조

```
.errorBanner {
  background-color: #fee2e2;
  color: #b91c1c;
  border-left: 4px solid #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
}

.loadingBanner {
  background-color: #fff3cd;
  color: #856404;
  border-left: 4px solid #f59e0b;
  padding: 12px 16px;
  border-radius: 8px;
}
```

## 4. handleSubmit의 alert 사용

```
const handleSubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);

  const name = String(fd.get("name") || "").trim();
  if (!name) return alert("이름을 입력해주세요.");
  ...
};
```

- HTML `required` 속성이 이미 빈 input 제출을 막아주고 있어 거의 도달 안 합니다.
- 그러나 도달 시 alert 사용은 다른 곳(errorMessage 화면 표시)과 일관성이 깨짐.

### 해결 - 화면 메시지로 통일

```
const [formError, setFormError] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = String(fd.get("name") || "").trim();

  if (!name) {
    setFormError("이름을 입력해주세요.");
    return;
  }

  setFormError("");
  ...
};

// 폼 안에 표시
{formError && <p className={styles.formError}>{formError}</p>}
```

## 5. 검색 / 정렬 기능 미구현

```
const filteredLions = filter === "All"
  ? lions
  : lions.filter((lion) => lion.part === filter);
```

- 현재는 파트 필터만 구현되어 있고, 4주차 정답 코드의 "이름 검색"과 "정렬 (최신순/이름순)"은 빠져 있습니다.
- 필수 사항은 아니지만, 5주차에 추가하면 완성도가 올라감.

### 해결 - 정답 코드 패턴 참고

```
const [searchName, setSearchName] = useState("");
const [sortOrder, setSortOrder] = useState("latest");

const visibleLions = (() => {
  let list = lions.slice();

  if (filter !== "All") {
    list = list.filter((l) => l.part === filter);
  }

  const query = searchName.trim();
  if (query) {
    list = list.filter((l) => l.name?.includes(query));
  }

  if (sortOrder === "name") {
    list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  } else {
    list.sort((a, b) => b.id - a.id);
  }

  return list;
})();
```

```
<input
  type="search"
  placeholder="이름으로 검색"
  value={searchName}
  onChange={(e) => setSearchName(e.target.value)}
/>

<select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
  <option value="latest">최신추가순</option>
  <option value="name">이름순</option>
</select>
```

## 6. 폼이 uncontrolled component 패턴 - 디자인 선택

```
<form ref={formRef} onSubmit={handleSubmit}>
  <input id="name" name="name" required />
  ...
</form>

const handleSubmit = (e) => {
  const fd = new FormData(e.target);
  const name = fd.get("name");
  ...
};

const handleCancel = () => {
  formRef.current?.reset();
  setShowModal(false);
};
```

- FormData + formRef.reset() 패턴이 잘 동작합니다.
- 다른 사람들 코드와 비교하면 controlled component(value/onChange로 state와 묶기) 쪽이 더 흔합니다.
- 폼이 단순하고 실시간 검증이 필요 없다면 uncontrolled도 충분합니다. 디자인 선택 사항.

### 해결 - controlled로 전환하고 싶다면

```
const EMPTY_FORM = {
  name: "", part: "Frontend", skills: "",
  intro: "", bio: "", email: "", phone: "",
};
const [formData, setFormData] = useState(EMPTY_FORM);

const handleInput = (field) => (e) =>
  setFormData((prev) => ({ ...prev, [field]: e.target.value }));

const handleSubmit = (e) => {
  e.preventDefault();
  const name = formData.name.trim();
  ...
  setLions((prev) => [...prev, newLion]);
  setFormData(EMPTY_FORM);
  setShowModal(false);
};

const handleCancel = () => {
  setFormData(EMPTY_FORM);
  setShowModal(false);
};

<input value={formData.name} onChange={handleInput("name")} required />
```

장점: 폼 값을 항상 알 수 있어서 실시간 검증/미리보기/자동저장 등을 추가하기 쉬움.

## 7. 데이터 형식 - skills가 문자열인 멤버 / 배열인 멤버 혼재 가능성

```
// initialLions
skills: "JavaScript, HTML / CSS"   // 문자열

// handleSubmit
skills: String(fd.get("skills") || "").trim(),   // 문자열

// fetchExternalData
skills: "API, Fetch, Async/Await",   // 문자열

// 사용처
lion.skills.split(",")[0].trim()   // 모두 문자열이라고 가정
```

- 모든 경로에서 skills를 문자열로 저장하고 있으니 현재 일관됨 - OK.
- 다만 정답 코드와 다른 사람들 코드는 `skills: ["A", "B", "C"]` 배열 형식을 사용. 만약 다른 사람 데이터를 import해서 사용하게 된다면 충돌이 날 수 있음.

### 해결 - 일관되게 배열로 통일하고 싶다면 (선택사항)

```
// initialLions
skills: ["JavaScript", "HTML / CSS"],

// handleSubmit
skills: String(fd.get("skills") || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean),

// fetchExternalData
skills: ["API", "Fetch", "Async/Await"],

// 사용처
lion.skills?.[0] || "Skill"
```
