# 8주차 서윤 과제 리뷰

8주차 과제는 두 가지: TypeScript 정리 md + 7주차 코드 .tsx 마이그레이션. 두 결과물을 따로 보고 정리합니다.

---

## A. 8주차.md 정리 노트

### 1. 첫 예시 - `const x = 3; x = "삼"`은 JS에서도 에러

```
const x = 3
x = "삼"
```

JS의 자유로움을 강조하려는 의도는 알겠는데, `const` 변수는 재할당 자체가 TypeError로 막힙니다. JS도 그 정도는 막아요. JS의 "변수 자유로움"을 보여주려면 `let`이어야 합니다.

```
let x = 3
x = "삼"   // JS는 통과, TS는 에러
```

### 2. 자잘한 오타

- "타이블 붙인 언어" → "타입 붙인 언어"
- "비퍼터" / "파라비터" → "파라미터"
- "유틸리티타임" → "유틸리티 타입"
- "tsconfing,json" → "tsconfig.json"
- "재 사용하고" → "재사용하고"
- "쓴이유" / "까먹는경우있어서" → 띄어쓰기

학습 노트는 본인이 나중에 다시 볼 거라 정정해 두면 좋아요.

### 3. ReturnType 설명에서 단어 혼동

```
그래서 직접 member이라고 박아놓으면 환경따라 바뀌어서
ts가 알아서 맞는 타입 가져오게 해놓았다.
```

`Member` 타입(도메인 모델)과 헷갈리신 듯해요. 의도는 "직접 `number`라고 박아놓으면 환경 따라 바뀐다"로 보입니다.

```
직접 number라고 박아놓으면 노드에서 객체로 반환되는 환경에서 깨진다.
그래서 ReturnType<typeof setTimeout>으로 환경이 결정해주는 그 타입을 그대로 받아 쓴다.
```

### 4. `as Part` 단언 - 본인이 짚은 위험 그대로 적용된 케이스

md에서 "as는 남발하면 곤란하다"고 짚었는데, 실제 코드(Page.tsx의 `handleAdd`)에서 살짝 그 경계에 있어요.

```tsx
// MemberForm
interface MemberForm {
  part: Part | "";  // 폼 미선택 상태 허용
  ...
}

// handleAdd
const part = form.part.trim();   // ← .trim() 결과는 string
if (!name || !part) {
  setFormError("이름과 파트는 필수입니다.");
  return;
}
...
part: part as Part,   // ← 그냥 우김
```

문제: `form.part.trim()`의 반환 타입은 `string`이라 TS 입장에서는 narrowing이 안 됩니다. `part !== ""` 체크만으로는 "Part 중 하나"라는 보장이 없어요. `<select>`의 option을 PARTS만 두긴 했지만, 사용자가 dev tool로 옵션을 조작하면 `"hacker"` 같은 값도 들어올 수 있고 그게 그대로 `Member.part`에 박힙니다.

런타임 검증으로 좁히는 게 정석:

```tsx
const part = form.part.trim();
if (!name || !part || !PARTS.includes(part as Part)) {
  setFormError("이름과 파트는 필수입니다.");
  return;
}
// 여기 시점에 part는 안전하게 Part
```

또는 타입 가드 함수:

```tsx
function isPart(v: string): v is Part {
  return (PARTS as readonly string[]).includes(v);
}
...
if (!name || !isPart(form.part)) { ... return; }
// 이 아래에서는 form.part가 Part로 좁혀짐, as 불필요
```

md의 마지막 문단에서 "select옵션을 직접 통제하고 빈 part를 먼저 걸러낸 뒤에만 단언한다"고 안전 장치를 언급했는데, "빈 값" 체크만으로는 부족하다는 점도 메모에 추가해 두면 학습이 더 단단해져요.

### 5. unknown vs any 설명 - 좀 보충하면 좋음

```
ts에서 catch(err)의 err는 any가 아니라 unknown이다.
```

여기에 "왜 any가 아니라 unknown이 되었는지"의 배경(`useUnknownInCatchVariables` 설정과 TS 4.4부터의 기본값)을 한 줄 더 보태면 좋습니다. 그리고 안전한 대안으로 `Error` 인스턴스 체크:

```tsx
} catch (err) {
  if (err instanceof Error) {
    if (err.name === "AbortError" && timedOut) { ... }
  }
}
```

`as { name?: string; message?: string }` 단언보다 `instanceof Error` 좁히기가 더 안전한 선택입니다 (DOMException 같은 케이스도 보통 Error를 상속).

### 6. 보충할 만한 주제

학습 노트에 같이 정리해 두면 좋은 항목들:

- **`never` 타입**: 절대 도달하지 않는 분기 (exhaustive check). switch에서 모든 케이스를 처리했는지 확인하는 패턴.
- **타입 가드 (`is` 키워드)**: 위 4번에서 본 `function isPart(v: string): v is Part`.
- **`as const`**: 배열/객체를 readonly + 리터럴 타입으로 동결.

  ```tsx
  const TABS = [
    { key: "overview", label: "Overview" },
    ...
  ] as const;
  // TABS[0].key의 타입이 "overview" 리터럴이 됨
  ```

- **`satisfies` 연산자** (TS 4.9+): "이 모양을 만족하지만 더 좁은 타입은 유지" - `Record<Part, string>`을 만들면서도 각 키의 값 리터럴 타입을 잃지 않게 함.

---

## B. .tsx 마이그레이션 (Page.tsx, types.ts, lions.ts)

전반적으로 타입 분리, 인터페이스 도입, 제네릭 활용까지 빠짐없이 적용됐어요. 손볼 부분 중심으로.

### 7. `mapApiUser(first, 0)` - id 하드코딩

```tsx
// handleFillRandom
const m = mapApiUser(first, 0);   // ← id를 0으로 강제
setFillData({
  name: m.name, part: m.part, badge: m.badge, ...
});
```

`mapApiUser`가 `Member`를 반환하기 때문에 id가 필수라서 임시로 0을 넘기는 모양인데, 이건 신호가 좋지 않은 패턴이에요. `fillData`는 멤버가 아니라 폼이고, id는 폼 객체와 무관한데도 형식상 만들어야 해서 의미 없는 값(0)이 들어갑니다.

리팩터링: `RandomUser → MemberForm` 변환 함수를 따로 분리.

```tsx
function userToForm(u: RandomUser): MemberForm {
  const part = pickRandom(PARTS);
  const skills = pickSkills(part);
  return {
    name: `${u.name.first} ${u.name.last}`,
    part,
    badge: skills[0] ?? part,
    intro: `${part} 파트에서 함께 성장 중인 아기사자입니다.`,
    image: u.picture?.large ?? "",
    club: "LION TRACK",
    about: pickRandom(ABOUT_PRESETS),
    skills: skills.join(", "),
    email: u.email,
    phone: u.phone,
    website: u.login?.username ? `https://github.com/${u.login.username}` : "",
    quote: pickRandom(QUOTE_PRESETS),
  };
}

// handleFillRandom
const m = userToForm(first);
setFillData(m);
```

`mapApiUser`와 `userToForm`이 공통 부분(name, part, skills, intro, ...)이 많은데, 그건 한번 더 묶을 수도 있습니다 (week7 주완 리뷰의 8번과 같은 패턴).

### 8. `handleFillRandom` race 보호 없음

`runFetchAction`은 `latestRequestIdRef`로 stale 응답을 차단하는데, `handleFillRandom`은 같은 보호가 없어요.

```tsx
const handleFillRandom = async (): Promise<void> => {
  if (isFilling) return;   // 진입 차단은 있지만
  ...
  try {
    const users = await fetchRandomUsers(1, controller.signal);
    ...
    setFillData({ ... });   // 응답 와서 set
  }
};
```

`isFilling`이 true면 진입 자체를 막아서 보통은 안전한데, abort 직후 fillControllerRef를 갱신하면서 `isFilling`이 false → 새 요청 → 이전 응답이 늦게 와서 새 응답을 덮어쓸 수 있어요. `runFetchAction`처럼 requestId 패턴으로 통일하면 안전합니다.

### 9. AddForm의 `fillData` 동기화 패턴

```tsx
// AddForm
const [form, setForm] = useState<MemberForm>(EMPTY_FORM);
...
useEffect(() => {
  if (fillData) setForm(fillData);
}, [fillData]);
```

부모가 fillData를 set하면 자식 effect가 form을 덮어쓰는 단방향 flow인데:

- 사용자가 폼을 입력하던 중에 "랜덤 채우기" 응답이 오면 입력 내용이 통째로 날아감 (그게 의도이긴 함)
- 닫고 다시 열면 fillData가 부모에 남아 있으면 그 값이 다시 들어옴 (`handleAdd` 안에서 `setFillData(null)`로 해소하지만, "취소"로 닫을 때는 reset 안 됨)

`handleClose`에도 `setFillData(null)` 호출을 추가하면 더 안전:

```tsx
<AddForm
  onClose={() => { setShowForm(false); setFillData(null); }}
  ...
/>
```

### 10. `Record<FetchStatus, string>` 활용 - 좋은 패턴, 다만 idle/error

```tsx
const statusMap: Record<FetchStatus, string> = {
  loading: "불러오는 중…",
  success: "완료되었습니다.",
  error: errorMessage,
  idle: "",
};
const statusText = statusMap[fetchStatus];
```

`FetchStatus` 키를 빠뜨리면 컴파일 에러로 잡아주는 좋은 패턴. 다만:

- `error: errorMessage` - errorMessage가 빈 문자열일 수 있는데, 그러면 "" 출력되고 아래 `{statusText && ...}` 분기에 의해 안 보임. OK.
- `idle: ""` - 위와 동일.

조금 더 명확하게 하려면 `FetchStatus`에서 idle을 빼고 `fetchStatus: FetchStatus | null`로 다루는 방법도 있어요. 본인 코드 의도에 맞으면 지금도 충분합니다.

### 11. `useState<Set<number>>(() => new Set())` - 함수형 초기화 잘 사용

매 렌더마다 새 Set이 만들어지지 않도록 lazy initializer 사용한 점 잘 함. md의 제네릭 섹션에서 이걸 언급하면 학습 노트가 더 풍부해집니다.

### 12. `keyof MemberForm` + `ChangeEvent<...>` 조합

```tsx
const input =
  (field: keyof MemberForm) =>
  (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
```

깔끔한데, 한 가지 미묘한 점: `MemberForm`의 모든 필드가 `string` 또는 `Part | ""`라서 `e.target.value`(string)를 그대로 spread해도 타입이 맞지만, 만약 미래에 `MemberForm`에 `number` 필드(예: `age: number`)가 추가되면 이 input 헬퍼가 type-safe하지 않게 됩니다. 현재는 OK.

### 13. types.ts의 위치 - 좋은 분리

`Member`, `Part`, `RandomUser`를 types.ts로 분리한 점이 md에서 강조한 것과 맞물려 잘 됐어요. 다만 `MemberForm`, `FetchStatus`, `SortKey`, `PartFilter`, `DetailTab`, `FetchContext`, `FetchAction` 같은 "UI 전용 타입"은 Page.tsx에 있는데, 양이 늘어나면 `ui-types.ts` 같은 파일로 한번 더 분리해도 좋습니다. 지금은 분량상 OK.

---

## 정리

### md 노트

1. `const x = 3; x = "삼"` → `let`으로 (1번)
2. 오타 정정: 유틸리티 타입, tsconfig.json, 파라미터 등 (2번)
3. ReturnType 설명의 "member" → "number"로 정정 (3번)
4. `as Part` 위험과 타입 가드 대안 추가 (4번)
5. `instanceof Error` 좁히기 대안 보충 (5번)
6. `never`, `as const`, `satisfies` 등 보충 (6번)

### 코드 마이그레이션

7. `mapApiUser(first, 0)` 대신 `userToForm` 분리 (7번)
8. `handleFillRandom`에 requestId race 보호 추가 (8번)
9. AddForm 닫을 때 `setFillData(null)` 같이 호출 (9번)
10. `Record<FetchStatus, string>`은 그대로 좋음 (10번)

우선순위: md는 1, 3번이 사실 오류라 정정 권장. 4번은 학습 차원에서 정정이 본인에게 가장 유익합니다. 코드는 7, 8, 9번을 묶어서 한 번에 정리하는 흐름을 추천합니다.
