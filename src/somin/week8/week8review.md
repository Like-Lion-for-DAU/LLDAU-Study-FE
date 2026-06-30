# 8주차 소민 과제 리뷰

8주차는 두 가지: TypeScript 정리 md + 7주차 .tsx 마이그레이션. 두 결과물 따로 정리합니다.

---

## A. 동작/구조 문제

### 1. somin/Page.jsx에서 Week8App import 누락 (빌드 에러)

```jsx
// src/somin/Page.jsx
import Week7Page from "./week7/Page";
import Week8Page from "./week8/Page";    // ← 사용 안 함
...
import DetailPage from "./week7/DetailPage";  // ← 사용 안 함
import Week7App from "./week7/App";
//  ← Week8App import 없음

...
<Route path="week8/*" element={
  <Week8App membersList={membersList} setMembersList={setMembersList} />
}/>
```

`<Week8App>`을 element로 쓰는데 import가 없습니다. ReferenceError로 화면 자체가 안 뜹니다. `/somin/week8`로 들어가도 흰 화면.

수정:

```jsx
import Week8App from "./week8/App";
// 그리고 unused가 된 Week8Page, DetailPage import는 삭제
```

### 2. App.tsx의 함수명이 `Week7App`

```tsx
// src/somin/week8/App.tsx
export default function Week7App({ membersList, setMembersList }: AppProps) {
```

week8 폴더인데 함수 이름이 `Week7App`입니다. 7주차 App.jsx를 복사해 와서 함수명을 안 바꾼 것으로 보여요. default export라 import 측은 자유롭게 이름을 정할 수 있어서 빌드는 동작하지만, React DevTools에서 컴포넌트 트리가 헷갈리고 의도와 어긋납니다.

```tsx
export default function Week8App(...) {
```

### 3. Member.role / MemberFormData.part가 `string`

```tsx
// types.ts
export interface Member {
  ...
  role: string;
  ...
}
export interface MemberFormData {
  ...
  part: string;
  ...
}
```

Page.tsx에서는 `PARTS = ["Frontend", "Backend", "Design"] as const`로 잘 선언했는데, Member와 MemberFormData에서는 그냥 `string`을 받습니다. 결과:

- `setPartFilter("Bakcend")` 같은 오타가 컴파일 타임에 안 잡힘
- `select`에 `<option value="Hacker">`를 손으로 추가해도 타입 시스템이 막아주지 않음
- `pick(PARTS)`가 `"Frontend" | "Backend" | "Design"` 리터럴 유니온을 돌려주는데, `MemberFormData.part: string`에 할당하는 순간 그 정보가 string으로 widen되면서 사라짐

권장:

```tsx
// types.ts
export type Part = typeof PARTS[number];   // 또는 직접 유니온
// = "Frontend" | "Backend" | "Design"

export interface Member {
  role: Part;
  ...
}
export interface MemberFormData {
  part: Part | "";   // 폼 미선택 상태 허용
  ...
}
```

`as const`로 만든 배열을 유니온으로 끌어와 쓰는 패턴(`typeof PARTS[number]`)은 8주차 학습 노트에 적기 좋은 주제입니다.

### 4. `handleRandomFill`에 race 보호 부족

```tsx
const handleRandomFill = async (): Promise<void> => {
  fillControllerRef.current?.abort();
  const controller = new AbortController();
  fillControllerRef.current = controller;
  ...
  setIsFilling(true);
  ...
  try {
    const [raw] = await fetchRandomUsers(1, controller.signal);
    ...
    setFormData({ ... });
  }
};
```

`runFetchAction`은 `latestRequestIdRef`로 stale 응답을 차단하는데, `handleRandomFill`은 그게 없어요. 게다가 `isFilling` 진입 차단(`if (isFilling) return`)도 없어서 빠르게 두 번 누르면:

- 첫 요청 in-flight 상태에서 두 번째 요청 → abort + 새 controller
- 첫 응답이 늦게 와서 `setFormData(첫 값)` 호출 → 두 번째 응답이 와서 또 setFormData → 화면 깜빡임 가능
- 또는 timeout abort 분기가 second request에서 발동되는데 timedOut 변수는 첫 호출의 closure에 있어서 오판단 가능

`runFetchAction`과 동일한 requestId 패턴으로 통일 권장:

```tsx
const fillRequestIdRef = useRef(0);
...
const handleRandomFill = async () => {
  if (isFilling) return;
  const requestId = ++fillRequestIdRef.current;
  ...
  try {
    const [raw] = await fetchRandomUsers(1, controller.signal);
    if (requestId !== fillRequestIdRef.current) return;
    setFormData({ ... });
  }
};
```

### 5. `focusResetTimerRef`가 데드 코드

```tsx
const focusResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
...
useEffect(() => {
  return () => {
    ...
    if (focusResetTimerRef.current) clearTimeout(focusResetTimerRef.current);
    ...
  };
}, []);
```

선언과 cleanup에만 등장하고 어디서도 set되지 않습니다. 7주차에서 가져온 잔재로 보여요. 통째로 삭제.

### 6. `handleSubmit`의 검증 순서가 어색합니다

```tsx
const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
  const skills = formData.skills.split(",")...;
  const id = makeNextId();
  const newMember: Member = {
    id,
    name: formData.name.trim(),
    role: formData.part,    // ← 빈 문자열이어도 일단 박음
    ...
  };
  if (!newMember.name || !newMember.role) {
    setFormError("이름과 파트는 필수 항목입니다.");
    return;
  }
  ...
};
```

newMember 객체를 다 만들고 makeNextId까지 호출한 다음에 검증해서 거부합니다. 두 가지 부작용:

- 검증 실패하면 `nextIdRef.current`가 이미 1 올라간 상태 → 다음 추가에서 id가 한 칸 비어 보임
- `formData.part`가 빈 문자열일 때 잠깐이라도 `role: ""`인 Member가 생성됨 (위 3번처럼 role: Part 유니온으로 좁히면 컴파일 에러로 잡아줌)

검증을 먼저 하고 통과 후에 객체 생성:

```tsx
const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
  const name = formData.name.trim();
  const part = formData.part;
  if (!name || !part) {
    setFormError("이름과 파트는 필수 항목입니다.");
    return;
  }
  setFormError("");
  const skills = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const id = makeNextId();
  const newMember: Member = { id, name, role: part, ... };
  setMembersList((prev) => [...prev, newMember]);
  ...
};
```

### 7. `weekPage` / `weekPageInner` div가 3중 중첩

- Layout.tsx: `<div className={styles.weekPage}><div className={styles.weekPageInner}>...<Outlet /></div></div>`
- Page.tsx: 또 `<div className={styles.weekPage}><div className={styles.weekPageInner}>...</div></div>` (Outlet 안에서)
- DetailPage.tsx: 또 같은 두 div

Layout이 이미 weekPage + weekPageInner를 감싸는데 자식 페이지에서 또 감싸요. DOM 트리가 weekPage > weekPageInner > weekPage > weekPageInner > ... 식으로 중첩. CSS 영향(padding/margin 중복, max-width 두 번 적용 등)이 있을 수 있습니다.

자식 페이지에선 그 div를 빼고 바로 콘텐츠부터 시작:

```tsx
// Page.tsx
return (
  <>
    <div className={styles.controlBar}>...</div>
    ...
    <section className={styles.cardSection}>...</section>
  </>
);
```

Layout의 `<Outlet />`이 이 fragment 자리에 들어갑니다.

---

## B. TypeScript 정리 노트 (Typescript.md)

### 8. 분량이 매우 적습니다

다룬 항목: interface, props, useState, useRef. 4개 섹션 + 도입/마무리. 그런데 본인이 Page.tsx에서 실제로 사용한 TS 기능은 그 외에도 많아요. 정리 노트가 본인 학습용이라면 사용한 기능을 다 적어 두는 게 효과가 큽니다.

빠진 주제 (Page.tsx에서 본인이 사용한 것들):

- **`as const`** - `PARTS = [...] as const`로 readonly literal tuple 만들기
- **제네릭 함수** - `function pick<T>(arr: readonly T[]): T`
- **`keyof`** - `(field: keyof MemberFormData)`
- **`Record<K, V>`** - `Record<string, string>`
- **`ReturnType<typeof setTimeout>`** - 환경 독립 타입
- **`instanceof Error`로 unknown 좁히기** - catch(err) 안에서 `if (err instanceof Error)` 패턴
- **`React.Dispatch<React.SetStateAction<T>>`** - setState 함수 타입
- **`React.FormEvent<HTMLFormElement>`** - 폼 이벤트 타입
- **`React.ChangeEvent<HTMLInputElement | ...>`** - input 이벤트 타입
- **type-only import** - `import type { Member } from "./types"`
- **type alias vs interface** - `type AsyncStatus = "idle" | ...` (유니온) vs `interface Member`
- **유니온 타입** - `"idle" | "loading" | "success" | "fail"`

코드에 다 들어 있는데 노트에는 빠져 있어서, 노트가 코드의 일부만 설명하는 상태가 됐어요. 사용한 기능을 한 줄씩이라도 적어 두면 학습 자료로 훨씬 가치 있어집니다.

### 9. useRef 예시의 두 줄을 한 번 풀어 쓰면 좋음

```tsx
const statusResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const lastActionRef = useRef<(() => void) | null>(null);
```

코드만 던지지 말고 "왜 `ReturnType<typeof setTimeout>`을 쓰는지" (브라우저는 number, Node는 객체라 환경마다 다르다), "왜 `(() => void) | null`인지" (함수 또는 null을 보관하는 ref라 명시) 한 줄씩 보태면 다음에 본인이 다시 봐도 의도가 명확합니다.

### 10. 마지막 "react에서 typescript를 쓰는 이유"가 한 줄

```
자바스크립트는 실행해야지 오류를 알 수 있고
타입스크립트는 저장하는 순간 알려줘서 오류를 알 수 있다.
```

요지는 맞지만 너무 짧아요. 다음 항목을 추가하면 좋습니다.

- props 타입 명시로 부모-자식 계약이 명확해짐 (interface MemberCardProps)
- 자동완성, 리팩터링 안전성 (이름 바꿀 때 사용처가 자동으로 따라옴)
- API 응답 타입 정의로 백엔드 변경 시 빠르게 인식 (RandomUser interface)
- 유니온 타입으로 잘못된 값(오타) 방지 (`AsyncStatus = "idle" | ...`)
