# 4주차 소민 과제 리뷰

비동기 안전성과 데이터 무결성 쪽에 몇 가지 개선 포인트가 있어 정리합니다.

## 1. AbortController / race condition 처리 없음

```
const handleAddRandom = async (count) => {
  lastActionRef.current = () => handleAddRandom(count);
  setAsyncStatus("loading");
  ...
  try {
    const newMembers = await fetchRandomUsers(count);
    setMembersList((prev) => [...prev, ...newMembers]);
    ...
  }
};
```

- "랜덤 1명 추가" → 곧바로 "랜덤 5명 추가"를 누르면 두 응답이 모두 도착해 둘 다 setState됩니다.
- `isLoading`으로 버튼을 disabled 처리하긴 했지만, React 리렌더 이전 짧은 순간에 두 번 클릭이 들어갈 수 있고, 무엇보다 컴포넌트가 unmount된 뒤 응답이 도착하면 unmounted setState 경고가 발생합니다.
- AbortController + latestRequestId 패턴으로 명시적으로 막는 게 안전합니다.

```
const latestControllerRef = useRef(null);
const latestRequestIdRef = useRef(0);

const handleAddRandom = async (count) => {
  const requestId = ++latestRequestIdRef.current;
  lastActionRef.current = () => handleAddRandom(count);

  if (latestControllerRef.current) latestControllerRef.current.abort();
  const controller = new AbortController();
  latestControllerRef.current = controller;

  setAsyncStatus("loading");
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

`fetchRandomUsers`에 `signal` 매개변수를 받도록 시그니처를 바꾸면 됩니다.

```
async function fetchRandomUsers(count, signal) {
  const res = await fetch(url, { signal });
  ...
}
```

## 2. fetch 타임아웃 없음

- 서버 응답이 30초 걸리면 사용자는 그동안 "불러오는 중..."만 보게 됩니다.
- setTimeout + controller.abort()로 5초 이내 응답 없으면 강제 종료하세요.

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
    setAsyncMsg("불러오기 실패: 시간 초과");
    setAsyncStatus("fail");
  }
}
```

## 3. setTimeout cleanup 없음 - unmount 후 setState 경고

두 군데에서 setTimeout이 사용되고 있는데 cleanup이 없습니다.

```
// success → idle 전환
setTimeout(() => {
  setAsyncStatus("idle");
  setAsyncMsg("준비 완료");
}, 1500);

// focused 강조 해제
setTimeout(() => setFocusedName(null), 900);
```

- 1500ms / 900ms 사이에 컴포넌트가 unmount되면 setState가 unmounted 컴포넌트에서 호출됩니다.
- useRef로 timer id를 저장하고 useEffect cleanup에서 clearTimeout 하세요.

```
const statusResetTimerRef = useRef(null);
const focusResetTimerRef = useRef(null);

useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    if (focusResetTimerRef.current) clearTimeout(focusResetTimerRef.current);
    if (latestControllerRef.current) latestControllerRef.current.abort();
  };
}, []);

// 사용
statusResetTimerRef.current = setTimeout(() => { ... }, 1500);
focusResetTimerRef.current = setTimeout(() => setFocusedName(null), 900);
```

## 4. id 충돌 가능성 - Date.now() + idx

```
function transformUser(user, idx) {
  const id = Date.now() + idx;
  ...
}

// handleSubmit
const nextId = Date.now();
```

- "랜덤 5명 추가"를 빠르게 두 번 누르면 두 호출의 Date.now()가 같을 수 있고, idx 0~4가 겹쳐 같은 id가 생성됩니다.
- key prop이 데이터 id 기반이라 key 충돌 → 잘못된 컴포넌트 재사용.
- useRef 카운터로 안전하게 단조 증가시키세요.

```
const nextIdRef = useRef(initialMembers.length + 1);

function makeNextId() {
  const id = nextIdRef.current;
  nextIdRef.current += 1;
  return id;
}

// fetchRandomUsers는 raw user 배열만 반환하고
// 변환은 컴포넌트에서 id를 부여하며 수행
const users = await fetchRandomUsers(count);
const newMembers = users.map((u) => transformUser(u, makeNextId()));
```

## 5. members.js 데이터에 id 필드 없음

```
export const members = [
  {
    name: "정소민",
    role: "Frontend",
    ...
  },
];
```

- 그래서 렌더링에서 `key={member.id ?? member.name}`로 fallback 처리하셨는데, 만약 동명이인이 추가되면 key 충돌이 납니다.
- members.js의 모든 멤버에 고유 id를 부여하세요.

```
export const members = [
  { id: 1, name: "정소민", ... },
  { id: 2, name: "김주완", ... },
  ...
];
```

## 6. detailRefs를 이름으로 인덱싱 - 동명이인 충돌

```
const detailRefs = useRef({});

detailRef={(el) => { if (el) detailRefs.current[member.name] = el; }}

const handleCardClick = (name) => {
  detailRefs.current[name]?.scrollIntoView(...);
};
```

- 같은 이름이 두 명 들어오면 두 번째가 첫 번째 ref를 덮어씁니다. 첫 번째 카드를 클릭해도 두 번째 카드로 스크롤됩니다.
- id로 키를 사용하세요.

```
detailRef={(el) => { if (el) detailRefs.current[member.id] = el; }}

const handleCardClick = (id) => {
  detailRefs.current[id]?.scrollIntoView(...);
};
```

## 7. handleRandomFill에서 DOM 직접 조작

```
const f = formRef.current;
f.querySelector('[name="name"]').value = u.name;
f.querySelector('[name="part"]').value = u.role;
...
```

- React 안에서 input.value를 직접 쓰는 것은 권장되지 않습니다. uncontrolled form이라서 동작은 하지만, controlled component로 바꾸면 더 깔끔해집니다.

```
const [formData, setFormData] = useState({ name: "", part: "", ... });

const handleInput = (field) => (e) => {
  setFormData((prev) => ({ ...prev, [field]: e.target.value }));
};

<input value={formData.name} onChange={handleInput("name")} />

// 랜덤 채우기
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

장점: 폼 값을 항상 state로 가지고 있어 검증·자동저장·미리보기 등을 추가하기 쉽습니다.

## 8. handleRandomFill의 에러를 alert로

```
catch (e) {
  alert("랜덤 값 불러오기 실패: " + e.message);
}
```

- 다른 fetch는 화면에 `asyncMsg`로 표시하면서, 랜덤 채우기만 alert로 처리합니다. 일관성을 맞춰 화면 내 메시지로 보여주세요.

## 9. 이미지 onError fallback 없음

```
{member.image && <img src={member.image} alt={member.name} />}
```

- 외부 URL이 404이거나 차단되면 깨진 이미지가 보입니다.

```
<img
  src={member.image}
  alt={member.name}
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = `https://picsum.photos/seed/${member.id}/400/400`;
  }}
/>
```

## 10. input type 일부 누락

```
<input name="phone" type="text" placeholder="010-0000-0000" />
<input name="website" type="text" placeholder="https://github.com/..." />
```

- 전화번호는 `type="tel"`, 웹사이트는 `type="url"`로 두면 모바일 키패드 / 자동완성이 잘 동작합니다.

## 11. 사용하지 않는 import / dead CSS

```
import React, { useState, useEffect, useRef } from "react";
```

- React 17+ JSX Transform에서는 `React` import 자체가 불필요합니다. `import { useState, useEffect, useRef } from "react";`로 줄이세요.

```
.searchIcon {
  position: absolute;
  ...
}
```

- JSX에는 `.searchIcon` 요소가 없습니다. dead CSS — 제거하거나, 의도가 있었다면 추가하세요.

## 12. CSS - border-radius: 10%는 권장 X

```
.btn {
  border-radius: 10%;
}
```

- 버튼은 가로/세로 비율이 다르므로 `%`를 쓰면 모서리가 타원형이 되어 일관성이 깨집니다.
- 보통 px 또는 rem을 씁니다 (예: `border-radius: 8px;`).

## 13. handleRefreshAll의 fetchCount 하한이 1

```
const fetchCount = Math.max(currentCount - myCards.length, 1);
```

- 본인 카드만 있을 때(currentCount === myCards.length)도 1명을 강제로 가져옵니다. 의도가 "최소 1명은 받아오기"가 맞다면 OK이지만, "내 카드만 남은 상태에서는 새로고침해도 변화 없음"이 더 자연스럽다면 0으로 두고 일찍 return 하는 게 좋습니다.

```
const fetchCount = currentCount - myCards.length;
if (fetchCount <= 0) return;
```

## 15. 체크리스트

- [v] 컴포넌트 분리 (SummaryCard, DetailCard)
- [v] 데이터 파일 분리 (members.js)
- [v] 이미지 import 패턴
- [v] 헬퍼 함수 분리 (pick, transformUser, fetchRandomUsers)
- [v] isMe 플래그 패턴
- [v] fetch 상태 4단계 관리
- [v] 재시도 기능 (lastActionRef)
- [v] 카드 클릭 → 상세 스크롤 + focused 효과
- [v] ESC 닫기
- [v] 함수형 setState
- [v] 빈 결과 UI
- [v] 반응형 그리드
- [ ] AbortController + latestRequestId로 race condition 차단
- [ ] fetch 타임아웃 5초
- [ ] setTimeout cleanup (status reset + focus reset)
- [ ] id를 useRef 카운터로 단조 증가 (Date.now() 충돌 방지)
- [ ] members.js에 id 필드 부여
- [ ] detailRefs를 member.id로 키 (동명이인 대응)
- [ ] handleRandomFill을 controlled component 패턴으로
- [ ] alert 대신 화면 내 메시지
- [ ] 이미지 onError fallback
- [ ] input type="tel" / "url" 적용
- [ ] 사용하지 않는 React import 제거
- [ ] dead CSS (.searchIcon) 정리
- [ ] CSS `border-radius: 10%` → px/rem

## 16. 핵심 학습 포인트

- 다음 단계는 "비동기 안전성"입니다.
- 비동기 작업에는 항상 "AbortController(취소)", "latestRequestId(stale 무시)", "타임아웃", "setTimeout cleanup" 네 가지가 함께 가야 합니다.
- id 관리는 `Date.now()`처럼 시간 기반보다 `useRef` 카운터 같은 단조 증가 방식이 안전합니다.
- ref를 객체 인덱싱할 때는 이름이 아니라 고유 id로 키하세요 — 동명이인 같은 엣지 케이스에서 깨지지 않습니다.
- 같은 폴더의 study.md에 위 네 가지 비동기 패턴과 controlled form 전환, ref 인덱싱 패턴을 정리해두었으니 참고하세요.
