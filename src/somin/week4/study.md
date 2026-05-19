# 4주차 학습 가이드 - 비동기 안전성과 데이터 무결성

review.md에서 지적한 비동기 안전성, id 관리, ref 인덱싱, controlled form 전환을 더 깊게 설명합니다.

## 1. AbortController + latestRequestId - race condition 차단

### 문제 시나리오

```
사용자: [랜덤 1명 추가] 클릭 (요청 A, 2초 소요)
사용자: [랜덤 5명 추가] 클릭 (요청 B, 0.5초 소요)

0.5초: B 응답 → setMembersList((prev) => [...prev, ...5명])
2.0초: A 응답 → setMembersList((prev) => [...prev, ...1명])  ← 사용자가 원한 결과 위에 1명 더 추가됨
```

`isLoading`으로 disabled 처리해도 React 리렌더 이전이나 다른 fetch 함수(handleRefreshAll, handleAddRandom)끼리는 막히지 않습니다.

### 해결: 이전 요청 abort + 최신 요청 id 검사

```
const latestControllerRef = useRef(null);
const latestRequestIdRef = useRef(0);

async function runFetchAction(actionFn) {
  const requestId = ++latestRequestIdRef.current;

  // 1) 이전 요청 취소
  if (latestControllerRef.current) latestControllerRef.current.abort();
  const controller = new AbortController();
  latestControllerRef.current = controller;

  setAsyncStatus("loading");
  try {
    await actionFn({
      signal: controller.signal,
      isLatest: () => requestId === latestRequestIdRef.current,
    });

    // 2) 응답 도착했을 때 내가 아직 최신인지 검사
    if (requestId !== latestRequestIdRef.current) return;
    setAsyncStatus("success");
  } catch (err) {
    if (requestId !== latestRequestIdRef.current) return;
    if (err.name === "AbortError") return;
    setAsyncStatus("fail");
    setAsyncMsg(`불러오기 실패: ${err.message}`);
  }
}

// 사용 - 각 액션을 actionFn으로 감싸기
const handleAddRandom = (count) =>
  runFetchAction(async (ctx) => {
    const res = await fetch(url, { signal: ctx.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!ctx.isLatest()) return;
    const newMembers = data.results.map((u) => transformUser(u, makeNextId()));
    setMembersList((prev) => [...prev, ...newMembers]);
  });
```

### 왜 두 안전망이 모두 필요한가?

- `AbortController`는 fetch가 await에서 멈춰있을 때만 즉시 효과가 있습니다.
- 응답 헤더가 도착한 뒤 `await res.json()` 단계나, JSON 파싱 이후 setState 직전에 새 요청이 시작되면 abort가 늦을 수 있습니다.
- `latestRequestId` 비교는 "응답이 setState에 도달하기 직전에" 한 번 더 검사하는 두 번째 안전망입니다.

## 2. 타임아웃 - 무한 대기 방지

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
  if (err.name === "AbortError") {
    if (timedOut) {
      setAsyncMsg("불러오기 실패: 시간 초과");
      setAsyncStatus("fail");
    }
    return; // 사용자가 취소한 경우는 메시지 없이 종료
  }
  ...
}
```

`timedOut` 플래그로 "사용자 취소(다음 요청 시작 시)"와 "타임아웃 취소"를 구별합니다.

## 3. setTimeout cleanup

지금 코드의 두 setTimeout:

```
// status reset
setTimeout(() => {
  setAsyncStatus("idle");
  setAsyncMsg("준비 완료");
}, 1500);

// focused 강조 해제
setTimeout(() => setFocusedName(null), 900);
```

컴포넌트가 unmount되어도 setTimeout 콜백은 살아있어 unmounted setState 경고가 발생합니다.

### 패턴

```
const statusResetTimerRef = useRef(null);
const focusResetTimerRef = useRef(null);

const scheduleStatusReset = () => {
  if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
  statusResetTimerRef.current = setTimeout(() => {
    setAsyncStatus("idle");
    setAsyncMsg("준비 완료");
  }, 1500);
};

const handleCardClick = (id) => {
  detailRefs.current[id]?.scrollIntoView(...);
  setFocusedName(id);

  if (focusResetTimerRef.current) clearTimeout(focusResetTimerRef.current);
  focusResetTimerRef.current = setTimeout(() => setFocusedName(null), 900);
};

useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    if (focusResetTimerRef.current) clearTimeout(focusResetTimerRef.current);
    if (latestControllerRef.current) latestControllerRef.current.abort();
  };
}, []);
```

- useEffect의 return 함수는 unmount 시점에 실행됩니다.
- 진행 중인 timer들과 fetch를 한꺼번에 정리하세요.

## 4. id 카운터 패턴 - Date.now()의 함정

### 왜 Date.now()가 위험한가?

```
function transformUser(user, idx) {
  const id = Date.now() + idx;
  ...
}

// fetchRandomUsers 안에서
return data.results.map((u, i) => transformUser(u, i));
```

빠르게 두 번 호출되면:

```
// 1번째 호출 (Date.now() = 1700000000000)
ids = [1700000000000, 1700000000001, 1700000000002, ...]

// 1ms 후 2번째 호출 (Date.now() = 1700000000001)
ids = [1700000000001, 1700000000002, ...]
                  ↑ 충돌!
```

### useRef 카운터

```
const nextIdRef = useRef(
  initialMembers.length === 0
    ? 1
    : Math.max(...initialMembers.map((m) => m.id)) + 1
);

function makeNextId() {
  const id = nextIdRef.current;
  nextIdRef.current += 1;
  return id;
}

// 사용
const newMember = { id: makeNextId(), ... };
const newMembers = users.map((u) => transformUser(u, makeNextId()));
```

- 컴포넌트 lifetime 동안 단조 증가 → 절대 충돌 없음.
- useState가 아닌 useRef인 이유: id 카운터는 화면 갱신과 무관하므로 변경 시 리렌더가 필요 없음.

### transformUser 시그니처 변경

```
// Before
function transformUser(user, idx) {
  const id = Date.now() + idx;
  ...
}

// After
function transformUser(user, id) {
  return {
    id,
    name: ...,
    ...
  };
}
```

id 생성 책임을 transformUser 밖(컴포넌트)에 두면 단일 진실 공급원(single source of truth)이 됩니다.

## 5. ref 객체 인덱싱 - 이름 대신 id

### 동명이인 시나리오

```
const detailRefs = useRef({});

// 김주완 카드 렌더링
detailRef={(el) => { if (el) detailRefs.current["김주완"] = el; }}

// 랜덤 fetch로 또 다른 "김주완"이 추가됨 (가능성 낮지만 가능)
detailRef={(el) => { if (el) detailRefs.current["김주완"] = el; }}
                                                            ↑ 두 번째가 첫 번째를 덮어씀
```

### id 기반 인덱싱

```
// 등록
detailRef={(el) => {
  if (el) detailRefs.current[member.id] = el;
}}

// 사용
const handleCardClick = (id) => {
  detailRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  setFocusedName(id);
};

<SummaryCard
  member={member}
  onClick={() => handleCardClick(member.id)}
/>
```

상태 변수명도 `focusedName` 대신 `focusedId` 같은 이름이 더 명확합니다.

### 정리(cleanup)도 고려

ref를 객체에 누적하면 unmount된 요소의 ref가 남을 수 있습니다. 함수형 ref에서 el이 null이면 제거하세요.

```
detailRef={(el) => {
  if (el) {
    detailRefs.current[member.id] = el;
  } else {
    delete detailRefs.current[member.id];
  }
}}
```

## 6. uncontrolled → controlled form 전환

### 지금 코드 (uncontrolled)

```
<form onSubmit={handleSubmit} ref={formRef}>
  <input name="name" type="text" required />
  ...
</form>

const handleSubmit = (e) => {
  const fd = new FormData(e.target);
  const name = fd.get("name").trim();
  ...
};

const handleRandomFill = async () => {
  const f = formRef.current;
  f.querySelector('[name="name"]').value = u.name;
  ...
};
```

특징:

- 입력값은 DOM에 저장 (브라우저가 관리)
- submit 시점에 FormData로 한 번에 추출
- 외부에서 값을 바꿀 때 DOM 직접 조작(`element.value =`)

### controlled form

```
const [formData, setFormData] = useState({
  name: "",
  part: "",
  skills: "",
  ...
});

const handleInput = (field) => (e) => {
  setFormData((prev) => ({ ...prev, [field]: e.target.value }));
};

<input
  name="name"
  type="text"
  value={formData.name}
  onChange={handleInput("name")}
  required
/>

const handleSubmit = (e) => {
  e.preventDefault();
  const name = formData.name.trim();
  ...
};

const handleRandomFill = async () => {
  const [u] = await fetchRandomUsers(1);
  setFormData({
    name: u.name,
    part: u.role,
    skills: u.skills.join(", "),
    ...
  });
};
```

장점:

- React state가 단일 진실 공급원 — 폼 값을 항상 알 수 있음.
- 외부에서 값 설정이 setState 한 번으로 끝남 (DOM querySelector 불필요).
- 실시간 검증, 미리보기, 자동저장 등을 쉽게 추가 가능.

### 폼 초기화

```
const EMPTY_FORM = { name: "", part: "", skills: "", ... };

// 폼 열기
const openForm = () => {
  setFormData(EMPTY_FORM);  // 초기화
  setIsFormOpen(true);
};

// 제출 후
setMembersList((prev) => [...prev, newMember]);
setFormData(EMPTY_FORM);
setIsFormOpen(false);
```

## 7. members.js에 id 부여 + 이미지 import 정리

```
// members.js
import jsm from "./profile/jsm.png";
import kjw from "./profile/kjw.gif";
...

export const members = [
  {
    id: 1,
    name: "정소민",
    role: "Frontend",
    image: jsm,
    isMe: true,
    ...
  },
  {
    id: 2,
    name: "김주완",
    ...
  },
  ...
];
```

- id 필드를 명시적으로 부여 → key 안전.
- 추가 시 `Math.max(...members.map(m => m.id)) + 1`로 다음 id 결정.

## 8. 화면 메시지 vs alert

```
// 좋지 않음
catch (e) {
  alert("랜덤 값 불러오기 실패: " + e.message);
}

// 좋음
catch (e) {
  setAsyncStatus("fail");
  setAsyncMsg(`랜덤 값 불러오기 실패: ${e.message}`);
}
```

다른 fetch는 화면 메시지로 표시하면서 한 곳만 alert를 쓰면 UX가 일관되지 않습니다. 모두 화면 내 메시지로 통일하세요.

## 9. 마무리

1. **AbortController + latestRequestId** - race condition 차단
2. **타임아웃** - 무한 대기 방지
3. **setTimeout cleanup** - unmount 안전
4. **useRef 카운터로 id 관리** - 시간 기반 id의 충돌 방지
5. **controlled form + 화면 메시지** - DOM 직접 조작 / alert 제거

이 다섯 가지가 갖춰지면 fetch가 들어가는 어떤 컴포넌트도 안정적으로 동작합니다.
