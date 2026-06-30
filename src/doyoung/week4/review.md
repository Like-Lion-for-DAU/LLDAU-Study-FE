# 4주차 도영 과제 리뷰

동작에 영향을 주는 버그가 여러 개 있어 정리합니다.

## 1. "추가하기" 버튼이 type="button" - 폼 제출 안 됨

```
<button
  type="button"
  className={styles["btnIcon"]}
>
  추가하기
</button>
```

- `type="button"`이면 form의 onSubmit이 호출되지 않습니다.
- 사용자가 폼을 채우고 "추가하기"를 눌러도 아무 일도 일어나지 않습니다.

```
<button type="submit" className={styles["btnIcon"]}>
  추가하기
</button>
```

## 2. handleSubmit의 newMember 필드명이 데이터 모델과 불일치

```
const newMember = {
  name: memberInput.name,
  part: memberInput.part,      // ← 다른 멤버는 "role" 필드
  intro: memberInput.intro,
  club: "DSIS",
  image: "/lion.png",
  bio: [memberInput.detail],
  skills: memberInput.skills.split(",").map((s) => s.trim()),
  motto: memberInput.tell,     // ← DetailCard는 "tell" 필드를 표시
  contact: {...}
};
```

문제점:

- `part`로 저장하지만 SummaryCard/필터는 `role`을 읽음 → 새 카드의 파트가 빈칸으로 표시되고, 파트 필터에서 사라짐.
- `motto`로 저장하지만 DetailCard는 `member.tell`을 표시 → "한 마디"가 안 보임.
- members.js 데이터의 필드: `role`, `motto`. DetailCard는 `tell`을 보고 있음. 데이터·표시·입력 세 곳의 필드 이름이 모두 어긋나 있습니다.

수정:

```
const newMember = {
  name: memberInput.name,
  role: memberInput.part,       // role로 통일
  intro: memberInput.intro,
  club: "DSIS",
  image: "/lion.png",
  bio: [memberInput.detail],
  skills: memberInput.skills.split(",").map((s) => s.trim()),
  tell: memberInput.tell,       // tell로 통일 (또는 모두 motto로)
  contact: {
    email: memberInput.email,
    phone: memberInput.phone,
    link: { label: "웹사이트", url: memberInput.web },
  },
};
```

그리고 members.js의 `motto`도 `tell`로 통일하거나, DetailCard에서 `member.motto`로 바꾸세요.

## 3. handleInputChange에서 글로벌 event 사용 - 파트 select가 동작 안 함

```
<select
  id="part"
  value={memberInput.part}
  onChange={(e) =>
    handleInputChange("part", event)  // ← e가 아니라 event!
  }
  required>
```

- 화살표 함수의 매개변수는 `e`인데 body에서는 글로벌 `event`를 참조하고 있습니다.
- 브라우저에 따라 동작이 다르고, 엄격 모드/번들러에서 `event is not defined` 오류가 날 수 있습니다.

```
onChange={(e) => handleInputChange("part", e)}
```

## 4. 정렬 select의 value가 partFilter

```
<div>
  <span className={styles["text"]}>정렬</span>
  <select
    value={partFilter}                       // ← sortType이어야 함
    className={styles["btnIcon"]}
    onChange={(e) => setSortType(e.target.value)}>
    <option value="recent">최신추가순</option>
    <option value="name">이름순</option>
  </select>
</div>
```

- value에 `partFilter`가 바인딩되어 있어 select가 항상 파트 필터값을 보여줍니다.
- 사용자가 옵션을 선택해도 select 표시는 그대로(파트 값)인데, sortType state는 변경되는 이상한 상태.

```
<select
  value={sortType}
  onChange={(e) => setSortType(e.target.value)}>
```

## 5. 상세 카드 목록이 visibleMembers가 아닌 members

```
<section className={styles["detailcardpack"]}>
  {members.map((member) => (    // ← visibleMembers여야 함
    <DetailCard ... />
  ))}
</section>
```

- 파트 필터/검색을 적용해도 상세 카드는 모든 멤버를 다 보여줍니다.
- 요약 카드와 상세 카드가 따로 노는 상태.

```
{visibleMembers.map((member) => (
  <DetailCard ... />
))}
```

## 6. handleCardClick에서 setFocusedId 호출 누락 - focused 효과 작동 안 함

```
function handleCardClick(name) {
  detailRefs.current[name]?.scrollIntoView({...});

  // setFocusedId(name);  ← 이게 없음
  setTimeout(() => {
    setFocusedId(null);
  }, 1000);
}
```

- focused state를 설정하지 않으니, `isFocused`는 항상 false → CSS의 `isFocused` 클래스가 적용되지 않습니다.
- 1초 후 null로 리셋만 일어나고 강조 효과는 보이지 않음.

```
function handleCardClick(name) {
  detailRefs.current[name]?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
  setFocusedId(name);          // 추가
  setTimeout(() => {
    setFocusedId(null);
  }, 1000);
}
```

## 7. fetchRandomUsers의 newMember 구조가 contact 없음

```
const newMember = data.results.map((user, index) => ({
  name: ...,
  role: ...,
  intro: ...,
  bio: [...],
  skills: [...],
  tell: "잘 부탁드립니다!",
  image: ...,
  email: user.email,        // ← 다른 멤버는 contact.email
  phone: user.phone,        // ← 다른 멤버는 contact.phone
  link: {...},              // ← 다른 멤버는 contact.link
}));
```

- DetailCard의 ContactList는 `member.contact?.email` 접근. 위 구조면 contact가 undefined라 ContactList가 null 반환 → 연락처 섹션이 비어 보입니다.

```
{
  ...,
  contact: {
    email: user.email,
    phone: user.phone,
    link: { label: "Profile", url: user.picture.large },
  },
}
```

## 8. HTML 오타들

```
<lable htmlFor="detail" ...>     // <label>이어야 함
  자기소개 (상세 카드)
</lable>

<input ... replaceholder="..." /> // placeholder

<input ... type="web" ... />       // type="url"
```

- `<lable>`은 React에서 unknown component로 처리됩니다.
- `replaceholder`는 그냥 무시됩니다.
- `type="web"`은 HTML5에 없는 타입이라 브라우저가 `type="text"`로 폴백합니다.

## 9. id 부재 - key={member.name}의 한계

```
{visibleMembers.map((member) => (
  <SummaryCard key={member.name} ... />
))}

detailRefs.current[member.name] = el;
```

- members.js 데이터에 id 필드가 없어서 이름을 key/ref 키로 사용합니다.
- 동명이인이 추가되면 key 충돌 + ref 덮어쓰기 발생.
- 새로 추가되는 fetched 멤버도 이름이 우연히 같을 수 있음.

```
// members.js
export const members = [
  { id: 1, name: "김주완", ... },
  { id: 2, name: "임도영", ... },
  ...
];

// Page.jsx
const nextIdRef = useRef(members.length + 1);

function makeNextId() {
  const id = nextIdRef.current;
  nextIdRef.current += 1;
  return id;
}

// 새 멤버
const newMember = { id: makeNextId(), ... };
const newMembers = data.results.map((u) => ({ id: makeNextId(), ... }));

// key/ref
<SummaryCard key={member.id} ... />
detailRefs.current[member.id] = el;
```

## 10. AbortController / race condition 없음

- "랜덤 1명 추가"와 "랜덤 5명 추가"를 빠르게 누르면 두 응답이 모두 setState됩니다.
- 컴포넌트 unmount 후 응답이 도착하면 unmounted setState 경고.

```
const latestControllerRef = useRef(null);
const latestRequestIdRef = useRef(0);

const fetchRandomUsers = async (count, type) => {
  const requestId = ++latestRequestIdRef.current;

  if (latestControllerRef.current) latestControllerRef.current.abort();
  const controller = new AbortController();
  latestControllerRef.current = controller;

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (requestId !== latestRequestIdRef.current) return;
    ...
  } catch (err) {
    if (requestId !== latestRequestIdRef.current) return;
    if (err.name === "AbortError") return;
    ...
  }
};
```

## 11. fetch 타임아웃 없음

- 5초 이내 응답 없으면 강제 종료하는 패턴을 적용하세요.

```
const TIMEOUT_MS = 5000;
let timedOut = false;
const timeoutId = setTimeout(() => {
  timedOut = true;
  controller.abort();
}, TIMEOUT_MS);

try {
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  ...
} catch (err) {
  clearTimeout(timeoutId);
  if (err.name === "AbortError" && timedOut) {
    setStatusMessage("시간 초과");
    setFetchStatus("error");
  }
}
```

## 12. setTimeout cleanup 없음

```
// fetchRandomUsers
setTimeout(() => { setFetchStatus("idle"); }, 2000);

// handleCardClick
setTimeout(() => { setFocusedId(null); }, 1000);
```

- 두 setTimeout 모두 unmount 시 정리되지 않습니다.
- useRef로 timer id를 저장하고 useEffect cleanup에서 clearTimeout 하세요.

```
const statusTimerRef = useRef(null);
const focusTimerRef = useRef(null);

useEffect(() => {
  return () => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    if (latestControllerRef.current) latestControllerRef.current.abort();
  };
}, []);
```

## 13. 체크리스트

- [v] 컴포넌트 분리 (SummaryCard, DetailCard, ContactList)
- [v] 데이터 파일 분리 (members.js)
- [v] 이미지 import
- [v] ContactList의 옵셔널 체이닝 + null 분기
- [v] mailto:/tel:/target="\_blank" 디테일
- [v] isMe 플래그 패턴
- [v] fetchStatus 4단계 관리
- [v] 재시도 기능 (lastRequest)
- [v] 전체 새로고침에서 isMe 보존
- [v] ESC 키 닫기 + cleanup
- [v] 빈 결과 UI
- [v] 반응형 그리드
- [v] CSS 변수 활용
- [ ] "추가하기" 버튼을 type="submit"으로
- [ ] handleSubmit의 newMember 필드 통일 (part→role, motto/tell 통일)
- [ ] handleInputChange 호출 시 `event` → `e`
- [ ] 정렬 select의 value={partFilter} → {sortType}
- [ ] 상세 카드 목록을 visibleMembers로
- [ ] handleCardClick에서 setFocusedId(name) 호출 추가
- [ ] fetchRandomUsers의 newMember를 contact 구조로 감싸기
- [ ] `<lable>` → `<label>`
- [ ] `replaceholder` → `placeholder`
- [ ] `type="web"` → `type="url"`
- [ ] members.js + 새 멤버에 id 부여 (useRef 카운터)
- [ ] AbortController + latestRequestId
- [ ] fetch 타임아웃 5초
- [ ] setTimeout cleanup (status + focus)

## 15. 핵심 학습 포인트

- 코드 구조와 추상화는 잘 잡혀있지만, "데이터 모델 일관성"이 무너져 폼이 사실상 동작하지 않습니다.
- 데이터·표시·입력 세 곳에서 같은 정보를 가리킬 때는 필드명을 통일하세요 (예: 모두 `role`, 모두 `tell`).
- `type="button"`과 `type="submit"`의 차이는 폼 제출에서 가장 큰 함정입니다. submit 버튼은 명시적으로 `type="submit"`을 적으세요.
- 비동기 작업에는 항상 "AbortController(취소)", "latestRequestId(stale 무시)", "타임아웃", "setTimeout cleanup" 네 가지를 함께 챙기세요.
- 같은 폴더의 study.md에 위 버그들의 원인과 비동기 패턴, 데이터 모델 통일 전략을 정리해두었으니 참고하세요.
