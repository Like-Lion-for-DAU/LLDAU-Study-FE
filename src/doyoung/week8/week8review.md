# 8주차 도영 과제 리뷰

8주차 두 가지: TS 정리 노트(study.md) + 7주차 코드 .tsx 마이그레이션. 두 결과물 따로 정리합니다.

먼저 가장 큰 문제부터: 7주차 리뷰에서 짚었던 **부모 라우터 ↔ App 연결 누락** 패턴과 **WeekPage가 props 무시하고 자체 useState 사용** 패턴이 8주차에도 그대로 재현됐어요. 이게 안 풀려서 도영이 만든 App.tsx/DetailPage.tsx/NotFoundPage.tsx의 의도가 화면에 반영되지 않습니다.

---

## A. 동작/구조 문제

### 1. App.tsx가 부모 라우터에 연결되지 않은 상태 (7주차 리뷰 7번 재현)

`src/doyoung/Page.jsx`를 보면:

```jsx
import Week8Page from "./week8/Page";        // ← Week8Page를 직접 import
...
<Route path="week8/*" element={<Week8Page />} />   // ← App.tsx 거치지 않음
```

`week8/App.tsx`는 import도 안 됐고 마운트도 안 됐어요. App.tsx 안의 `useState<Member[]>(initialMembers)`와 `<Route path=":id">`, `<Route path="*">` (NotFound) 모두 dead code 상태입니다.

수정:

```jsx
// src/doyoung/Page.jsx
import Week8App from "./week8/App";   // ← App을 import
...
<Route path="week8/*" element={<Week8App />} />
```

이건 7주차 도영 리뷰에서 정확히 같은 패턴으로 짚었던 항목입니다. React Router 중첩 라우팅의 핵심 패턴이라 한 번 익혀두면 다음 주차에도 안 헷갈려요. **App.tsx를 만들면 부모도 그걸 마운트해야 함**.

### 2. WeekPage가 props 무시 + 자체 useState로 또 생성 (7주차 리뷰 6번 재현)

```tsx
interface WeekPageProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

export default function WeekPage({}: WeekPageProps) {  // ← props 정의는 했지만 destructure 안 받음
  const [members, setMembers] = useState<Member[]>(initialMembers);   // ← 자기가 또 만듦
```

`{}: WeekPageProps`로 빈 destructure를 적었기 때문에 부모(App)에서 넘어온 `members`/`setMembers` props가 무시됩니다. 그리고 안에서 또 `useState(initialMembers)`로 자체 상태를 만들어요.

위 1번이 풀려도 이 부분이 안 잡히면 여전히 DetailPage와 상태가 분리됩니다 (목록에서 추가한 멤버가 상세에 안 보임).

수정:

```tsx
export default function WeekPage({ members, setMembers }: WeekPageProps) {
  // 내부 const [members, setMembers] = useState(...) 줄 삭제
```

### 3. nextIdRef 초기값이 NaN이 되는 버그 (큰 동작 버그)

```tsx
const nextIdRef = useRef<number>(
  initialMembers.length === 0
    ? 1
    : Math.max(...initialMembers.map((m) => Number(m.id))) + 1,
);
```

`members.ts`를 보면 id가 `"juwan"`, `"doyoung"`, `"naham"` 같은 string이에요. `Number("juwan")`은 `NaN`입니다. 그러면:

- `initialMembers.map((m) => Number(m.id))` = `[NaN, NaN, NaN, ...]`
- `Math.max(...[NaN, NaN, ...])` = `NaN`
- `nextIdRef.current` = `NaN + 1` = `NaN`
- `makeNextId()` 호출 시 `nextIdRef.current++` → 첫 호출 NaN, 두 번째 NaN, ... 모든 새 멤버 id가 NaN

결과: **수동 추가/랜덤 추가한 모든 멤버의 id가 `NaN`**. React key 중복으로 경고 + DetailPage에서 `String(m.id) === id`로 못 찾음.

수정 방향:

```tsx
// 방법 A: 모든 id를 string으로 통일하고 초기값에서 string 기준 카운터
const nextIdRef = useRef<number>(initialMembers.length + 1);
function makeNextId(): string {
  return `lion-${nextIdRef.current++}`;
}

// 방법 B: 숫자 id로 통일 (members.ts의 string id를 모두 숫자로)
```

또는 도영이 7주차에 시도했던 `${user.name.first}${user.name.last}${Date.now()}` 패턴도 OK (다만 형 일관성 유지).

### 4. SummaryCard, DetailPage, NotFoundPage의 경로가 모두 `/doyoung/week7`

```tsx
// SummaryCard
onClick={() => navigate(`/doyoung/week7/${member.id}`)}

// DetailPage
<Link to="/doyoung/week7">목록으로 돌아가기</Link>

// NotFoundPage
<Link className={styles.backLink} to="/doyoung/week7">...</Link>

// Page.tsx
<h2>7주차</h2>
```

week8 폴더 안의 컴포넌트들인데 모두 `/doyoung/week7`로 보냅니다. h2도 "7주차"예요. week7 코드를 복사해서 만든 흔적인데, 의도가 두 가지일 수 있어요:

- 의도 A) week8은 TS 학습이고 라우팅은 week7 그대로 사용 → 그러면 App.tsx/DetailPage.tsx/NotFoundPage.tsx를 week8에 또 만든 이유가 없음
- 의도 B) week8을 실제 라우팅되게 만들려 했음 → 그러면 모든 경로를 `/doyoung/week8`로 바꾸고 h2도 "8주차"로

지금은 어느 쪽도 명확하지 않은 어중간한 상태예요. 1번 수정과 함께 모든 경로를 `/doyoung/week8`로 통일하는 게 일관됩니다.

### 5. `data.results.map((user: any) => ...)` - any 사용

```tsx
const newMember: Member[] = data.results.map((user: any) => ({ ... }));
```

8주차의 핵심이 "타입 안전성"인데 외부 API 응답에 `any`를 그대로 박았어요. study.md에서 본인이 정리한 "any는 모든 타입 허용 -> 의미 없어짐"이 그대로 발생.

권장: `RandomUser` interface 정의 후 단언.

```tsx
interface RandomUser {
  name: { first: string; last: string };
  email: string;
  phone: string;
  picture: { large: string };
  location: { country: string; city: string };
}
interface RandomUserResponse { results: RandomUser[]; }

const data = await response.json() as RandomUserResponse;
const newMember: Member[] = data.results.map((user) => ({ ... }));
// user 타입이 RandomUser로 좁혀져서 user.location.country가 자동완성됨
```

### 6. fillRandomData에 race 보호 없음 (7주차 리뷰 9번 그대로)

```tsx
const fillRandomData = async () => {
  const controller = new AbortController();
  ...
  // latestRequestIdRef 같은 stale 응답 차단 없음
```

`fetchRandomUsers`는 `latestRequestIdRef` + `latestControllRef`로 race condition을 막는데, `fillRandomData`는 동일 보호가 없습니다. 빠르게 두 번 누르면 첫 응답이 늦게 와서 두 번째 결과를 덮어쓸 가능성. 7주차에서 짚었던 그대로.

수정: 별도 `fillControllerRef`/`fillRequestIdRef` 도입.

### 7. `(error as Error).name`은 학습 노트와 어긋남

```tsx
if ((error as Error).name === "AbortError" && timedOut) {
```

`error`는 TS 4.4+에서 `unknown`인데 그냥 `as Error`로 단언했어요. 진짜로 Error 인스턴스인지 검증 없이 강제 변환.

정석은 `instanceof Error`로 좁히기:

```tsx
} catch (error) {
  if (!(error instanceof Error)) {
    setFetchStatus("error");
    setStatusMessage("알 수 없는 오류");
    return;
  }
  if (error.name === "AbortError" && timedOut) { ... }
}
```

`fillRandomData`의 catch에도 같은 패턴 적용 필요. **이 부분은 study.md에 빠져 있는 주제**라서 추가 학습이 필요해요 (아래 11번 참고).

### 8. `as SortType`, `as PartFilter` - URL 임의 값에 검증 없음

```tsx
const sortType = (searchParams.get("sort") ?? "recent") as SortType;
const partFilter = (searchParams.get("part") ?? "ALL") as PartFilter;
```

URL에 `?sort=hacker&part=Bakcend` 같은 임의 값이 들어와도 그대로 SortType/PartFilter로 강제 변환됩니다. 런타임 검증 없음.

권장: include 체크로 런타임 좁히기.

```tsx
const SORT_OPTIONS = ["recent", "name"] as const;
type SortType = (typeof SORT_OPTIONS)[number];

const rawSort = searchParams.get("sort") ?? "recent";
const sortType: SortType = (SORT_OPTIONS as readonly string[]).includes(rawSort)
  ? (rawSort as SortType)
  : "recent";
```

이게 학습 노트의 `as const` 패턴 활용 예시이기도 합니다.

### 9. ContactList가 Page.tsx에서 export되어 DetailPage가 import

```tsx
// Page.tsx
export function ContactList({ contact }: ContactListProps) { ... }

// DetailPage.tsx
import { ContactList } from "./Page";
```

7주차 리뷰의 3번에서 같은 지적했어요. 페이지 컴포넌트에서 작은 컴포넌트를 다시 export하는 모양은 모듈 책임이 모호해집니다. `ContactList.tsx`로 별도 분리 권장.

---

## B. study.md 학습 노트

전반적으로 TS 기본 개념을 정리한 점은 좋지만, 몇 가지 정정과 보충이 필요해요.

### 10. type vs interface 차이 - 본문 정확성과 깊이 보충

```
type : 원시타입으로 직접적으로 정의함
interface : 원시 타입을 직접적으로 정의하는 용도로 사용 불가
```

맞는 말이지만 가장 실용적인 차이는 다음 두 가지예요:

- **declaration merging**: 같은 이름의 interface를 두 번 선언하면 합쳐짐. type은 불가.
  ```tsx
  interface User {
    name: string;
  }
  interface User {
    age: number;
  } // User = { name: string; age: number }
  ```
- **union/intersection 표현 자유도**: type만 union 가능
  ```tsx
  type Status = "idle" | "loading" | "error"; // interface로는 불가
  type Both = A & B; // intersection도 type이 편함
  ```

본인 코드의 `type FetchStatus = "idle" | "loading" | "success" | "error"`가 정확히 이 케이스.

### 11. `instanceof Error`로 unknown 좁히기 - 누락된 주제

study.md에 catch의 unknown 처리가 빠져 있어요. 본인 코드(`(error as Error).name`)는 잘못된 패턴이므로 학습 노트에 다음 두 가지를 꼭 추가:

```tsx
} catch (error) {
  // catch 변수는 unknown
  if (error instanceof Error) {
    // 이 안에서 error는 Error로 좁혀짐
    if (error.name === "AbortError") { ... }
  }
}
```

- `as Error` 단언은 위장이지 검증 아님
- `error instanceof Error`가 표준 패턴
- 환경에 따라 `DOMException` 같은 다른 Error 서브클래스도 있음 (instanceof Error로 잡힘)

### 12. `as const` + 리터럴 유니온 - 누락된 핵심 주제

본인 코드의 `PartFilter`, `SortType`, `FetchType` 같은 유니온 타입은 손으로 적었어요. 8주차 핵심 패턴 중 하나가 `as const`로 배열을 동결하고 거기서 유니온을 뽑는 것:

```tsx
const SORT_OPTIONS = ["recent", "name"] as const;
type SortType = (typeof SORT_OPTIONS)[number]; // "recent" | "name"
```

배열 한 번 정의로 (1) 런타임 옵션 목록 (2) 컴파일 타임 유니온 두 가지를 동시에 얻습니다. 한 곳만 고치면 둘 다 바뀜.

### 13. target vs currentTarget - 약간 부정확

```
TypeScript에서는 target 대신 currentTarget 사용
```

TS 문제가 아니라 React 이벤트 객체의 기본 속성입니다.

- `target`: 실제 이벤트가 발생한 element (자식일 수 있음)
- `currentTarget`: 이벤트 핸들러가 부착된 element (TS에서 더 정확한 타입 제공)

본인 코드의 `e.currentTarget.src = ...`가 currentTarget이 더 정확한 이유는 "img 핸들러에 부착되어 있으니 currentTarget은 항상 HTMLImageElement"라는 보장이 있기 때문입니다.

### 14. 본인 코드와의 연결 부족

study.md는 정의 위주이고 본인 .tsx에서 어디 어떻게 썼는지 매핑이 별로 없어요. 학습 노트는 본인 코드와 연결할수록 효과가 큽니다.

예시:

- "유니온 타입 - `|` 연산자" 옆에 "본인 코드의 `type FetchStatus = "idle" | ...` 참고"
- "ReturnType" 옆에 "본인 코드의 `useRef<ReturnType<typeof setTimeout> | null>` 참고"
- "keyof" 옆에 "본인 코드의 `handleInputChange(field: keyof MemberInput, ...)` 참고"

### 15. `global.d.ts` 보다 `vite-env.d.ts` 권장

```ts
// 본인이 만든 global.d.ts
declare module "*.css" {
  const content: { [className: string]: string };
  export = content;
}
declare module "*.jpg";
declare module "*.png";
...
```

직접 d.ts를 만든 시도는 좋지만, Vite 프로젝트라면 한 줄로 같은 효과:

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />
```

`vite/client`가 `*.module.css`, `*.svg`, `*.jpg` 등 모든 import를 자동 처리해줍니다. 다만 본인이 d.ts 개념을 직접 익힌 건 학습 가치가 있어요.

추가로 `declare module "*.css" { ... export = content; }`는 CommonJS 스타일이라 `import styles from "./Page.module.css"`로 쓰려면 tsconfig에 `esModuleInterop: true`가 필요. 현재 도영 브랜치엔 tsconfig.json 자체가 없는 상태라 (아래 16번) 어떻게 동작하는지 검증이 불완전합니다.

### 16. tsconfig.json이 없습니다

도영 브랜치에 `tsconfig.json`이 없어서 IDE/CLI 양쪽에서 TS strict 검사가 안 됩니다. .tsx 작성은 했지만 진짜 type 안전성을 보장받지 못하는 상태. 다음 두 파일 추가 권장:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

그리고 `@types/react`, `@types/react-dom`도 devDependency에 필요 (없으면 React 타입을 못 찾음).

---

## 정리

7주차에 짚었던 문제들이 8주차에도 그대로 남아 있어요. 라우터 연결과 props 받기 두 가지는 다음 주차에 또 반복될 가능성이 크니 이번에 확실히 익혀두는 게 좋습니다.
