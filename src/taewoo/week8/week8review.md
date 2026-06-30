# 8주차 태우 과제 리뷰

8주차 두 가지: TS 정리 노트(typescript.md) + 7주차 코드 .tsx 마이그레이션 + 상세 페이지 추가 시도.

7주차에 짚었던 상태 끌어올림(Router에서 useState 보유 + useOutletContext)과 라우터 캡슐화는 잘 적용됐어요. 다만 DetailPage가 정의만 있고 Router에 마운트되지 않아서 7주차 1번 핵심 요구사항(목록 → 상세 페이지 이동)이 여전히 안 됩니다. 그 부분 중심으로 정리.

---

## A. 동작/구조 문제

### 1. DetailPage가 Router에 마운트되지 않은 상태 (가장 큰 문제)

`Router.tsx`를 보면:

```tsx
<Routes>
  <Route element={<Layout context={context} />}>
    <Route index element={<ScrollPage />} />
    <Route path="list" element={<GridPage />} />
  </Route>
</Routes>
```

DetailPage import도 없고 route 정의도 없어요. 즉 DetailPage.tsx는 통째로 **dead code** 상태.

그런데 ScrollPage 쪽에서는 detail로 이동을 시도합니다:

```tsx
// ScrollPage.tsx
onClick={() => navigate(`/taewoo/week7/lions/${currentMember.id}`)}
// 그리드 모드의 Link
<Link to={`/taewoo/week7/lions/${member.id}`}>
```

여기서 두 가지가 동시에 문제:

- **DetailPage 라우트 자체가 없음** - Router에 `<Route path="lions/:id" element={<DetailPage />} />`가 빠짐
- **경로가 `/taewoo/week7`로** - week8 폴더의 컴포넌트인데 week7로 보냄

결국 카드 클릭 시 `/taewoo/week7/lions/3`으로 이동하는데 그곳에 detail route가 없어서 빈 화면 또는 ScrollPage가 다시 떠요. 7주차 1번에서 짚었던 "목록 → 상세 페이지 이동" 핵심 요구사항이 여전히 미해결.

수정:

```tsx
// Router.tsx
import DetailPage from "./DetailPage";
...
<Routes>
  <Route element={<Layout context={context} />}>
    <Route index element={<ScrollPage />} />
    <Route path="list" element={<GridPage />} />
    <Route path="lions/:id" element={<DetailPage />} />
    <Route path="*" element={<NotFoundPage />} />   // 아래 6번 참고
  </Route>
</Routes>

// ScrollPage.tsx: 경로를 week8로 + 절대경로 대신 상대경로 권장
<Link to={`lions/${member.id}`}>
// 또는 절대경로면 /taewoo/week8/lions/...

// DetailPage.tsx: "목록으로" Link도 week8로
<Link to="/taewoo/week8">← 목록으로</Link>
```

### 2. ScrollPage 함수명이 `Week7Page`

```tsx
// ScrollPage.tsx
export default function Week7Page() {
```

week8 폴더의 파일인데 함수 이름이 `Week7Page`. week7 코드 복사하고 안 바꿔서 그래요. 일반 동작에는 영향 없지만 React DevTools 트리에서 헷갈리고 의도와 어긋납니다.

```tsx
export default function Week8Page() {   // 또는 ScrollPage 등 의미 있는 이름
```

### 3. GridPage가 useOutletContext를 안 쓰고 자체 useState

ScrollPage는 Router에서 끌어올린 상태를 잘 받아옵니다:

```tsx
// ScrollPage.tsx
const { memberList, setMemberList } = useOutletContext<OutletContext>();
```

근데 GridPage는 같은 패턴이 적용 안 됨:

```tsx
// GridPage.tsx
const [memberList, setMemberList] = useState<Member[]>(
  (state as LocationState | null)?.memberList ?? initialMembers,
);
```

자체 useState로 memberList를 새로 만들고, location.state로 일회성 전달받은 값을 초기값으로 사용해요. 두 가지 문제:

- ScrollPage에서 추가/삭제한 멤버가 GridPage에 안 보임 (각자 자체 state)
- GridPage에서 추가한 멤버도 ScrollPage 돌아가면 사라짐 (state 동기화 안 됨)
- `/taewoo/week8/list`로 URL 직접 진입 시 location.state가 없어서 initialMembers만 보임

수정: ScrollPage와 동일한 패턴으로:

```tsx
const { memberList, setMemberList } = useOutletContext<OutletContext>();
// 내부 useState(...) 삭제
```

### 4. GridPage가 URL 쿼리 옵션을 안 씀

ScrollPage는 useSearchParams로 잘 적용됐는데, GridPage는 자체 useState 그대로:

```tsx
// GridPage.tsx
const [sortPart, setSortPart] = useState<string>("all");
const [sortType, setSortType] = useState<string>("newest");
const [sortSearch, setSortSearch] = useState<string>("");
```

7주차 평가의 보기 옵션 URL 연동이 GridPage에선 여전히 미충족. ScrollPage의 `updateParam` 함수와 `useSearchParams` 패턴을 그대로 옮겨오면 됩니다.

### 5. GridPage의 navigate가 `/taewoo/week7`

```tsx
// GridPage.tsx
onClick={() => navigate("/taewoo/week7")}
```

뒤로 가기/모드 전환 같은 동작인데 week7로 보냅니다. week8 폴더 안의 페이지이니 `/taewoo/week8` 또는 상대경로 `..`로.

### 6. Router에 catch-all (NotFound) 없음 + Layout 헤더 없음 (보너스 두 항목)

7주차 리뷰의 보너스 두 항목이 여전히 미적용:

- `<Route path="*" element={<NotFoundPage />} />` 없음 → `/taewoo/week8/asdf` 같은 경로 시 빈 화면 (DetailPage에 not-found UI가 들어 있긴 하지만 그건 DetailPage 라우트가 잡혔을 때만 동작)
- Layout이 헤더 없이 `<Outlet />`만 렌더링 → 앱 이름/총 인원 수/목록 링크 없음

```tsx
// Layout.tsx에 헤더 추가
function Layout({ context }: { context: RouterContext }) {
  const location = useLocation();
  const isList = location.pathname === "/taewoo/week8";
  return (
    <>
      <header>
        <Link to="/taewoo/week8">아기사자 명단</Link>
        <span>총 {context.memberList.length}명</span>
        {!isList && <Link to="/taewoo/week8">← 목록으로</Link>}
      </header>
      <Outlet context={context} />
    </>
  );
}
```

### 7. ScrollPage의 viewMode와 GridPage의 역할 충돌

ScrollPage 안에 `viewMode: "slider" | "grid"` 토글이 있어서 그리드 모드도 ScrollPage 안에서 처리할 수 있어요. 그러면 별도 `/list` 경로의 GridPage가 무엇을 위한 건지 의도가 흐려집니다.

- 의도 A) viewMode 토글이 grid 모드도 처리 → 별도 GridPage는 legacy. 삭제 권장
- 의도 B) `/list` URL로 직접 진입하는 그리드 페이지를 별도 제공 → 그러면 ScrollPage의 viewMode "grid"를 빼고 그리드 모드는 무조건 `/list`로 navigate

지금은 두 가지가 섞여 있어서, ScrollPage의 grid 모드와 별도 `/list` 라우트의 GridPage 둘 다 그리드를 그립니다 (코드 중복). 의도 정리 후 한쪽으로 통일이 필요해요.

### 8. randomNewMember의 인덱스 계산이 부정확

```tsx
const skillspoint =
  parseInt(String(Math.random() * (randomSkills.length - 3))) + 1;
```

`Math.random() * (length - 3)`은 0 ~ length-3 사이 실수. `parseInt(String(...))`로 정수화. 의도는 `Math.floor`와 같지만 굳이 `String` 거쳐서 `parseInt` 하는 게 우회.

```tsx
const skillspoint = Math.floor(Math.random() * (randomSkills.length - 3)) + 1;
```

`Math.floor`가 의도가 명확하고 한 단계 짧아요. `pushRandomMembers`의 `randomPhone`도 같은 패턴이라 모두 정정 권장.

또 한 가지: `skillspoint + 1`로 시작 인덱스를 만들고 `slice(skillspoint, skillspoint + 3)`인데, `skillspoint`는 이미 `+1` 적용된 값. 그런데 length가 10이면 `(length-3)=7`, `Math.floor(Math.random()*7)=0~6`, `+1=1~7`. 그러면 `slice(1, 4)`부터 `slice(7, 10)`까지 가능. 슬라이스 자체는 OK. 다만 `skillspoint`라는 이름이 "포인트(시작점)"인지 "오프셋"인지 모호.

---

## B. TypeScript 정리 노트 (typescript.md)

### 9. 본인 코드에서 쓴 고급 패턴들이 노트에 빠져 있어요

학습 노트가 정의 위주이고, 본인이 script.ts/ScrollPage.tsx/Router.tsx에서 실제로 쓴 패턴은 노트에 짚지 않았어요. 학습 효과를 위해 다음 주제들을 보충 권장:

- **`as const`** - `const randomParts = ["Frontend", ...] as const` (script.ts 56줄). 리터럴 유니온 만들기. 이게 본인이 가장 많이 쓴 패턴 중 하나
- **`Record<K, V>`** - `Record<ValidatorKey, (v: string) => boolean>` (script.ts 79줄)
- **`Partial<T>`** - `Partial<Record<keyof FormFields, boolean>>` (script.ts 91줄)
- **`Omit<T, K>`** - `Omit<Member, "id">` (script.ts 272줄)
- **`Dispatch<SetStateAction<T>>`** - Router.tsx의 `setMemberList: Dispatch<SetStateAction<Member[]>>`
- **타입 가드 (`is` 키워드)** - `function (f: string): f is ValidatorKey` (script.ts 108줄). `keyof`와 `in` 연산자로 좁히기
- **`unknown`** - `selected: unknown` (script.ts 247줄)
- **`ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>`** - React 이벤트 유니온 타입

본인이 직접 쓴 코드의 줄 번호와 같이 노트하면 다음에 다시 봐도 의도가 명확해져요.

### 10. catch에서 unknown 처리 누락

본인 코드의 GridPage/ScrollPage catch 블록:

```tsx
} catch {
  setFetching("error");
}
```

error 인자 자체를 안 받아서 timedOut 분기나 AbortError 무시 같은 케이스 처리가 안 됩니다. error 정보가 필요하면 `catch (err: unknown) { if (err instanceof Error) ... }` 패턴이 표준. 학습 노트에 같이 정리해두면 좋아요.

### 11. parseInt + String 우회 대신 Math.floor

학습 노트의 주제는 아니지만, 본인 코드의 `parseInt(String(Math.random() * ...))` 패턴은 `Math.floor(Math.random() * ...)`이 더 자연스럽다는 메모를 추가해두면 좋아요 (위 8번과 연결).
