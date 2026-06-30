# 8주차 주완 과제 리뷰

먼저 결론부터: **TS 빌드 오류는 없습니다**. `.jsx`로 두었으니 TS 검사 자체가 안 일어나서 그래요(프로젝트 tsconfig는 `*.ts/*.tsx`만 검사하고 `.jsx`는 무시). 빌드 자체는 `vite build`로 정상 통과합니다.

다만 7주차 피드백을 반영해서 만든 페이지 분리가 **실제로는 동작하지 않는 상태**입니다. 그 부분 중심으로 정리합니다.

---

## 1. App.jsx가 부모 라우터에 연결되지 않은 상태입니다 (큰 버그)

주완이 만든 `week8/App.jsx`는 다음과 같이 라우트를 정의했어요.

```jsx
// src/juwan/week8/App.jsx
export default function Week8App() {
  return (
    <Routes>
      <Route index element={<Week8Page />} />
      <Route path="lions/:memberId" element={<Week8Page />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
```

그런데 부모(`src/juwan/Page.jsx`)는 `Week8App`이 아니라 **`Week8Page`를 직접 마운트**하고 있어요.

```jsx
// src/juwan/Page.jsx
import Week8Page from "./week8/Page";
...
<Route path="week8/*" element={<Week8Page />} />   // ← App.jsx 거치지 않음
```

결과:

- `week8/App.jsx`가 **dead code** 상태(import도 안 됨, 마운트도 안 됨)
- 부모는 `week8/*` 매칭만 하지 `:memberId`를 캡처하지 않음
- `Page.jsx` 121줄의 `const { memberId } = useParams();`가 항상 `undefined`
- 따라서 카드를 클릭해서 `/juwan/week8/lions/3`로 이동해도 `memberId`가 잡히지 않아 **상세 페이지 화면이 안 뜨고 목록만 계속 보임**

수정은 부모 라우터에서 마운트할 컴포넌트를 바꾸기만 하면 됩니다.

```jsx
// src/juwan/Page.jsx
import Week8App from "./week8/App";   // ← 추가
...
<Route path="week8/*" element={<Week8App />} />   // ← Week8Page → Week8App
```

이렇게만 바꾸면 `App.jsx`의 Routes가 활성화되어, `/juwan/week8/lions/3` 진입 시 부모(Week8App)가 `:memberId`를 캡처하고, 그게 Week8Page의 `useParams()`로 흘러갑니다. 상세 페이지가 정상 동작해요.

도영의 7주차에서도 정확히 같은 패턴이 있었어요. React Router 중첩 라우팅 처음 만지면 자주 마주치는 패턴입니다. **App.jsx를 만들면 부모도 그걸 마운트하도록 같이 바꿔야** 한다는 점만 기억해 두면 다음에 안 헷갈려요.

---

## 2. TS 변환 부분

### 2-1. 1번 항목 — `JSX.Element` 반환 타입

```tsx
export default function Week8App(): JSX.Element {
```

설명 자체는 맞는데, React 18+에서는 `React.ReactNode`나 그냥 반환 타입 생략(추론에 맡김)이 더 권장돼요. `JSX.Element`는 string, number, fragment 같은 다른 반환값을 막아서 조건부 렌더링 때 불편할 수 있습니다. 일반적으로 함수 컴포넌트는 반환 타입을 명시 안 하고 TS의 추론에 맡기는 게 표준입니다.

### 2-2. 2번 항목 — Member interface가 두 군데로 갈라짐

`Member`에는 `name, role, intro, description, image, badge, ...`가 있고, 6번에서 또 `MemberItem extends Member`로 `id, isMe, createdAt`를 추가했어요. 이 분리가 의도된 거라면 OK인데, 학습 노트에 "왜 나눴는지" 한 줄 적어두면 좋습니다.

- 일반적으로는 "정적 데이터(members.js의 초기 상수)는 Member로, 런타임에서 생성된 카드(id/createdAt이 붙은)는 MemberItem으로 구분"하는 의도일 텐데, 이게 명확히 적혀 있지 않아서 다음에 본인이 봐도 헷갈릴 수 있어요.

### 2-3. 4번 항목 — `import { members, Member } from "./members"`

타입과 값을 한 줄에 import하는 건 OK인데, **type-only import** 개념도 학습 노트에 넣으면 좋습니다.

```tsx
import type { Member } from "./members";
import { members } from "./members";
```

또는 한 줄로:

```tsx
import { members, type Member } from "./members";
```

이게 무엇이고 왜 쓰는지(번들 사이즈, 의도 명확화) 한 줄 적어두면 학습 깊이가 늘어납니다.

### 2-4. 5번 항목 — `const roles: string[]`

```tsx
const roles: string[] = ["Frontend", "Backend", "Design"];
```

이건 사실 권장되지 않는 패턴이에요. `string[]`이라고 명시하는 순간 `roles`의 원소가 그냥 `string`이 되어, `getRandomItem(roles)` 결과도 `string`이 됩니다. 그러면 6번에서 만든 `interface FormData { role: string }`처럼 다른 타입과 모두 그냥 `string`이라 어느 값이든 받아들이게 돼서 안전망이 사라져요.

권장은 `as const`로 동결해서 리터럴 유니온으로 좁히는 것:

```tsx
const roles = ["Frontend", "Backend", "Design"] as const;
// roles의 타입: readonly ["Frontend", "Backend", "Design"]
// roles[number]의 타입: "Frontend" | "Backend" | "Design"

type Role = (typeof roles)[number]; // "Frontend" | "Backend" | "Design"
```

그러면 `MemberItem.role: Role`로 좁힐 수 있어서, 다른 분들이 했던 "유니온 타입으로 오타 방지" 패턴이 가능해집니다. AI한테 다시 물어볼 때 "as const로 리터럴 유니온 만들기"로 검색해보세요.

### 2-5. 11번 항목 — useParams 타입

```tsx
const { memberId } = useParams<{ memberId: string }>();
```

이건 정확하지만, 미묘하게 함정이 있어요. `useParams`의 반환 타입은 사실 `Partial<{ memberId: string }>`라서 `memberId`가 `string | undefined`예요. 위 코드대로 destructure하면 `memberId`가 `string`처럼 보이지만 실제로는 undefined일 수 있습니다. 이게 위 1번 문제와 연결되는데, **App.jsx 안에 `<Route path="lions/:memberId">`가 활성화되어야만** memberId가 실제로 들어옵니다.

### 2-6. 13번 항목 — fetch 응답 타입

```tsx
.then((data: { results: RandomUser[] }) => { ... })
```

이건 동작은 하지만, fetch의 `res.json()`의 반환은 원래 `Promise<any>`라서 inline annotation으로 강제하는 건 사실 위장입니다. 더 정확한 패턴은:

```tsx
const data = (await res.json()) as { results: RandomUser[] };
// 또는
const data: { results: RandomUser[] } = await res.json();
```

위 inline annotation은 `data`가 그 타입이라고 단언하는 거지, 실제로 검증하지는 않아요. AI한테 "zod 같은 런타임 스키마 검증"으로 더 안전하게 만드는 방법도 물어보면 학습이 됩니다.

### 2-7. 14번 항목 — catch 타입

```tsx
.catch((error: Error) => { ... })
```

이건 사실 **잘못된 패턴**이에요. TS 4.4+에서는 catch 변수가 `unknown`이고 임의로 `Error`라고 단언할 수 없어요. fetch가 던지는 게 `Error`라는 보장이 없거든요 (`DOMException`, 일반 객체, 문자열 등 무엇이든 던질 수 있음).

올바른 패턴:

```tsx
.catch((error: unknown) => {
  if (error instanceof Error) {
    if (error.name === "AbortError") { ... }
  }
})
```

`unknown`으로 받고, `instanceof Error`로 좁히는 게 안전합니다.

---

## 3. 정리

카톡에서 본인이 적어준 "이게 최선이라 죄송합니다"는 사과할 일은 아니에요. 7주차 피드백을 반영해서 페이지 분리 시도하고, 카드 클릭 시 query string 유지하면서 detail로 이동하는 패턴(`getMemberLink`)까지 디자인한 부분은 8주차 본문 요구사항(TS 변환)과 별개로 의미 있는 발전입니다.

이번 주의 큰 한 가지(1번 라우터 연결)만 잡으면 페이지 분리가 실제로 동작하게 되고, TS 변환은 다음에 시간 있을 때 위 2-4(as const), 2-7(unknown + instanceof) 두 가지만 익혀가면 시작점으로 충분합니다.

---

## 참고: 정정본 폴더 (`src/juwan/week8-fix/`)

리뷰의 모든 항목을 반영한 정정본을 `src/juwan/week8-fix/` 폴더에 만들어 두었어요.

부모 라우터(`src/juwan/Page.jsx`)에도 마운트해뒀으니 브라우저에서 바로 비교 가능:

- 원본 (현재 상태): `http://localhost:5173/juwan/week8` - 카드 클릭 시 상세 안 뜸 (1번 문제)
- 정정본: `http://localhost:5173/juwan/week8-fix` - 카드 클릭 시 상세 정상 진입

### 활용 추천

먼저 본인이 정리한 부분(특히 5번 `as const`, 14번 `catch unknown`)을 직접 수정해보고, 막히는 부분만 정정본 파일과 비교해봐요.

특히 살펴보면 좋을 부분:

- `types.ts`의 `as const` + `(typeof ROLES)[number]` 패턴 (리뷰 2-4 답)
- `App.tsx`의 `catch (error: unknown) { if (!(error instanceof Error)) ... }` 패턴 (리뷰 2-7 답)
- `App.tsx`/`ListPage.tsx`의 상태 끌어올림 + props 전달 패턴 (리뷰 1번 답)
- `DetailPage.tsx`의 `useParams<{ memberId: string }>()` 후 `string | undefined` 의식한 처리 (리뷰 2-5 답)
