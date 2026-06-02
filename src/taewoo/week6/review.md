# 6주차 태우 UI 디자인 리뷰

## 디자인 컨셉

올리브영 스타일로 보입니다.

## 디자인 이슈

### 1. `.week-page`의 `max-width: 100vh` - 단위 오타로 보입니다

```
.week-page {
  padding: 32px;
  background-color: white;
  min-height: 100vh;
  max-width: 100vh;       /* vh를 vw 또는 px 단위로 의도한 것 같습니다 */
  margin: auto;
}
```

- `max-width`에 `100vh`를 적으면 "뷰포트 높이만큼"의 가로 폭이 됩니다.
- 세로로 긴 화면(모바일 세로 모드)에서는 페이지가 정사각형보다 좁아질 수 있습니다.
- 의도가 "데스크탑에서도 너무 펼쳐지지 않게"였다면 `max-width: 1200px` 같은 고정 px 값이 맞습니다.

수정안:

```
.week-page {
  max-width: 1200px;   /* 또는 디자인 시스템에 맞는 값 */
}
```

### 2. `.blueRule` 클래스명과 실제 색상이 일치하지 않습니다

```
.blueRule {
  color: #df6461;     /* 핑크빨강 - blue가 아닙니다 */
  padding-inline: 10px;
  font-size: 16px;
}
```

- 클래스 이름은 `blueRule`인데 색상은 핑크빨강(`#df6461`). 이름과 실제가 불일치합니다.
- 올리브영 컨셉이라면 그린 톤 (`#5a9e2f` 등)이 자연스럽습니다.

수정안:

```
.partLabel {           /* 의미 있는 이름으로 */
  color: #5a9e2f;
  ...
}
```

JSX의 className도 함께 바꿔주세요.

### 3. `.bannerBadge`의 핑크 글자 + 흰 outline 강조

```
.bannerBadge {
  background: #83dc28;
  color: #ef3ec4;
  text-shadow: -1px 0px white, 0px 1px white, 1px 0px white, 0px -1px white;
}
```

- 초록 배경 + 핑크 글자 + 흰 윤곽선 조합은 올리브영의 톤과 충돌합니다.
- 올리브영은 보통 그린/베이지 톤 안에서 대비를 만듭니다.

수정안:

```
.bannerBadge {
  background: #83dc28;
  color: #2a4a10;
  font-weight: 800;
}
```

### 4. `.mainProfile`의 hover 시 layout shift

```
.mainProfile {
  /* border 없음 */
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.mainProfile:hover {
  transform: translateY(-4px);
  border: 2px solid #5a9e2f;     /* hover에서만 border 추가 */
}
```

- 기본 상태에는 border가 없는데 hover에 2px border가 추가됩니다. hover할 때 카드가 4px 들썩하고, border 만큼 카드 안쪽 컨텐츠 위치도 살짝 밀려서 어색한 느낌이 납니다.

수정안 - 기본에 투명 border를 두고 hover에서 색만 바꾸기:

```
.mainProfile {
  border: 2px solid transparent;   /* 자리 차지만 */
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.mainProfile:hover {
  transform: translateY(-4px);
  border-color: #5a9e2f;
}
```

### 5. `.mainProfile:hover .badgeSpace` - 컨셉과 맞지 않는 노랑+청록 강조

```
.mainProfile:hover .badgeSpace {
  background-color: #f5e700;    /* 노랑 */
  color: #41ba93;               /* 청록 */
}
```

- 평소에는 그린 베이스(`#7dd225`)인데 hover하면 노랑 + 청록으로 바뀝니다. 올리브 그린 컨셉과 너무 떨어진 색상입니다.

수정안 - 같은 그린 계열 안에서 톤만 진하게:

```
.mainProfile:hover .badgeSpace {
  background-color: #5a9e2f;
  color: #fff;
}
```

### 6. `.removeButton`에 중복 `background-color` 선언

```
.removeButton {
  background-color: transparent;
  background-color: #d5e4c6;      /* 두 번째가 이깁니다 */
  ...
}
```

- 한 줄짜리 dead code입니다. 첫 줄을 삭제해주세요.

### 7. `font: bold` / `font-style: bold` - 존재하지 않는 CSS

```
.joinClub {
  font: bold;            /* font 단축형 문법 오류 */
}

.introduceLast {
  font-style: bold;      /* font-style은 italic/normal 받습니다 */
}
```

- 둘 다 브라우저가 무시합니다.

수정안:

```
.joinClub {
  font-weight: 600;
}

.introduceLast {
  font-weight: 700;
}
```

### 8. 검색 input의 focus 피드백이 약합니다

```
.searchInput {
  background: #f0f1f5;
  border: none;
  ...
}

.searchInput:focus {
  border-color: #5a9e2f;   /* border가 none이라 border-color는 안 보입니다 */
}
```

- 기본 `border: none`이라 focus에서 border-color를 바꿔도 시각적으로 차이가 없습니다.

수정안:

```
.searchInput {
  border: 2px solid transparent;
  ...
}

.searchInput:focus {
  border-color: #5a9e2f;
  background: #fff;
}
```

### 9. `.extraPanel`이 토글 버튼과 시각적으로 분리되어 있습니다

- 의도는 토글 버튼 바로 아래에 붙는 패널 같지만, 실제로는 `margin-top: 6px`로 살짝 떨어져 있고 너비도 다를 수 있습니다.
- `border-radius: 0px 0px 10px 10px`로 위 모서리는 sharp인데 위쪽에 붙어있는 요소가 없으면 어색합니다.

수정안 - 토글 버튼 바로 아래에 자연스럽게 붙도록:

```
.extraToggleBtn {
  background: #f5f7f3;
  padding: 8px 16px;
  border-radius: 10px 10px 0 0;   /* 위 모서리만 둥글게 */
  margin-bottom: 0;
}

.extraPanel {
  margin-top: 0;
  border-radius: 0 10px 10px 10px;   /* 토글 버튼과 자연스럽게 이어지도록 */
}
```

## 기능적 이슈

### 10. `club` 필드 - "추가" 버튼이 영구 disabled 상태입니다 (이전 review 미해결)

```
// script.js
const emptyForm = { name: "", part: "Frontend", club:"", skills: "", ... };

const isFormValid =
  Object.values(formData).every((v) => v.trim() !== "") && ...;
```

- `emptyForm`에 `club: ""`이 있는데 폼 UI에는 club 입력란이 없습니다.
- `isFormValid`가 모든 필드를 검사해서 `club`이 영원히 빈 문자열이라 `isFormValid`는 영원히 `false`입니다.
- 결과적으로 "추가" 버튼이 영구 disabled 상태가 됩니다 → 폼 자체가 동작하지 않습니다.
- `pushRandomMembers`의 반환값에도 club이 없어서 "랜덤 값 채우기"로도 채워지지 않습니다.

수정안 - club을 emptyForm에서 제거:

```
const emptyForm = { name: "", part: "Frontend", skills: "", introduce: "", introduceDetail: "", email: "", phone: "", website: "", last: "" };
```

그리고 `handleAddSubmit`에서 `club`을 hard-coded:

```
const newMember = {
  ...,
  club: "DAU_DSIS",
  ...
};
```

또는 club input을 폼에 추가하고 `pushRandomMembers`에도 `club: "랜덤 유저 클럽"` 등을 반환하게 해주세요.

### 11. `useEffect`의 의존성 배열에 `displayList`/`sortType`이 빠졌습니다

```
useEffect(() => {
  if (displayList.length > 0 && bannerIdx >= displayList.length) {
    setBannerIdx(displayList.length - 1);
  }
}, [memberList, sortPart, sortSearch]);
```

- `displayList`를 읽는데 의존성에 없습니다 (stale closure 위험).
- `sortType`도 displayList에 영향을 주는데 의존성에서 빠져 있습니다.

수정안:

```
useEffect(() => {
  if (displayList.length > 0 && bannerIdx >= displayList.length) {
    setBannerIdx(displayList.length - 1);
  }
}, [displayList, bannerIdx]);
```

`displayList`를 의존성에 넣으면 매번 렌더링마다 새 배열이라 무한 루프가 발생할 수 있으므로, `useMemo`로 안정화하는 게 좋습니다:

```
const displayList = useMemo(() => {
  return memberList
    .filter(...)
    .filter(...)
    .sort(...);
}, [memberList, sortSearch, sortPart, sortType]);
```

### 12. `setTimeout`이 ref에 저장되지 않아 cleanup 안 됩니다

```
const statusResetTimerRef = useRef(null);

useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
  };
}, []);

const handleFetchRandom = async () => {
  ...
  setTimeout(() => setFetching("ready"), 2000);    // ref에 저장 안 됨
};
```

- `statusResetTimerRef`는 정의되어 있지만 실제 `setTimeout`은 ref에 저장하지 않고 직접 호출합니다.
- 컴포넌트 unmount되어도 timer가 살아있어 unmounted setState 경고가 발생할 수 있습니다.

수정안 - ref에 timer id 저장:

```
const scheduleStatusReset = () => {
  if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
  statusResetTimerRef.current = setTimeout(() => setFetching("ready"), 2000);
};

// 사용
setFetching("success");
scheduleStatusReset();
```

세 군데(`handleFetchRandom`, `handleFetchFiveRandom`, `handleRefresh`) 모두 `scheduleStatusReset()`으로 교체해주세요.

### 13. AbortController / 타임아웃 / latestRequestId 패턴이 없습니다 (이전 review 미해결)

```
const handleFetchRandom = async () => {
  setFetching("loading");
  lastAction.current = handleFetchRandom;
  try {
    const user = await randomResult(1);
    ...
  } catch {
    setFetching("error");
  }
};
```

- 랜덤 1명/5명 추가를 빠르게 누르면 두 응답이 모두 처리되어 의도하지 않은 결과가 나옵니다.
- 네트워크가 느리면 사용자는 무한 대기 상태에 빠집니다.
- 컴포넌트 unmount 후 응답이 도착하면 unmounted setState 경고가 발생합니다.

수정안 - `runFetchAction` 헬퍼로 통합:

```
const latestControllerRef = useRef(null);
const latestRequestIdRef = useRef(0);
const TIMEOUT_MS = 5000;

const runFetchAction = async (actionFn) => {
  const requestId = ++latestRequestIdRef.current;
  if (latestControllerRef.current) latestControllerRef.current.abort();
  const controller = new AbortController();
  latestControllerRef.current = controller;

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  setFetching("loading");
  try {
    await actionFn(controller.signal, () => requestId === latestRequestIdRef.current);
    clearTimeout(timeoutId);
    if (requestId !== latestRequestIdRef.current) return;
    setFetching("success");
    scheduleStatusReset();
  } catch (err) {
    clearTimeout(timeoutId);
    if (requestId !== latestRequestIdRef.current) return;
    if (err.name === "AbortError" && timedOut) {
      setFetching("error");
      return;
    }
    if (err.name === "AbortError") return;
    setFetching("error");
  }
};
```

cleanup에도 추가:

```
useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    if (latestControllerRef.current) latestControllerRef.current.abort();
  };
}, []);
```

### 14. `catch` 블록이 여전히 빈 상태입니다 (이전 review 미해결)

```
} catch {
  setFetching("error");
}
```

- 에러 객체를 전혀 사용하지 않습니다. 콘솔에도 안 남고 사용자에게도 자세한 정보가 안 보입니다.

수정안:

```
} catch (err) {
  console.error(err);
  setFetching("error");
}
```

### 15. 정렬 "newest"가 여전히 오름차순입니다 (이전 review 미해결)

```
.sort((a, b) => {
  if (sortType === "newest") return a.id - b.id;
  ...
});
```

- "최신 업데이트순"을 선택해도 가장 오래된 멤버가 위에 옵니다.

수정안:

```
if (sortType === "newest") return b.id - a.id;
```

### 16. CSS 오타 `refrash`가 여전합니다 (이전 review 미해결)

```
.refrashButton, .refrashState
```

- `refresh`가 맞는 영어 철자입니다.

### 17. `goPrev`/`goNext`에서 `displayList.length === 0`일 때 NaN 발생

```
const goPrev = () =>
  setBannerIdx((i) => (i - 1 + displayList.length) % displayList.length);
```

- `displayList.length === 0`이면 `(i - 1 + 0) % 0 = NaN`이 되어 `bannerIdx`가 NaN으로 변합니다.
- 현재는 빈 결과면 슬라이더 자체가 안 보이는 조건 분기가 있어서 도달하지 않지만, 드래그 핸들러는 그래도 안전하게 짜는 게 좋습니다.

수정안:

```
const goPrev = () => {
  if (displayList.length === 0) return;
  setBannerIdx((i) => (i - 1 + displayList.length) % displayList.length);
};
```

### 18. `vw` 계산이 ref.current 기준이라 첫 렌더 + 리사이즈 시 부정확합니다

```
const vw = viewportRef.current?.offsetWidth || 600;
const baseOffset = -(vw + 2 * GAP);
```

- 첫 렌더에서는 `viewportRef.current`가 `null`이라 기본값 600이 사용됩니다 → 실제 화면 크기와 어긋남.
- 윈도우 리사이즈 시 컴포넌트가 리렌더링되지 않으면 `vw` 값이 갱신되지 않습니다.

수정안 - resize 이벤트 + state로 관리:

```
const [viewportWidth, setViewportWidth] = useState(600);

useEffect(() => {
  const updateWidth = () => {
    if (viewportRef.current) {
      setViewportWidth(viewportRef.current.offsetWidth);
    }
  };
  updateWidth();
  window.addEventListener("resize", updateWidth);
  return () => window.removeEventListener("resize", updateWidth);
}, []);

const baseOffset = -(viewportWidth + 2 * GAP);
```

### 19. 멤버 수가 적을 때 슬라이더에 같은 사람이 중복으로 보입니다

```
const prevPrevMember = displayList.length > 1
  ? displayList[(bannerIdx - 2 + displayList.length) % displayList.length]
  : null;
```

- `displayList.length === 2`이면 `prevPrev`와 `nextNext`가 같은 인덱스를 가리켜서 좌우 양쪽에 같은 사람 이미지가 보입니다.
- 검색 결과로 2~3명만 남는 경우 시각적으로 어색합니다.

수정안 - 길이가 작으면 사이드 카드 숨김:

```
const prevPrevMember = displayList.length > 4
  ? displayList[(bannerIdx - 2 + displayList.length) % displayList.length]
  : null;
const nextNextMember = displayList.length > 4
  ? displayList[(bannerIdx + 2) % displayList.length]
  : null;
```

또는 더 명확하게 인덱스 set으로 중복 제거.

### 20. 컴포넌트 이름이 `Week5Page`인데 h2는 "6주차"입니다

```
export default function Week5Page() {
  ...
  return (
    <div className={styles["week-page"]}>
      <h2>6주차</h2>
      ...
```

- 폴더가 week6이고 h2도 "6주차"인데 함수 이름은 `Week5Page`. 일관성이 깨져 있어서 검색이나 디버깅 시 헷갈립니다.

수정안:

```
export default function Week6Page() { ... }
```

### 21. `.bannerSection`에서 스와이프할 때 콘텐츠가 부드럽게 이동되지 않습니다

현재 코드:

```js
const handleMouseUp = () => {
  const delta = dragDelta.current;
  if (Math.abs(delta) > 60) {
    delta < 0 ? goNext() : goPrev();    // 1) 데이터 즉시 교체
  }
  setDragOffset(0);                      // 2) translate 0으로 리셋
  ...
};
```

```jsx
<div
  className={styles["bannerTrack"]}
  style={{
    transform: `translateX(${baseOffset + dragOffset}px)`,
    transition: dragOffset === 0 ? "transform 0.3s ease" : "none",
  }}
>
```

현재 동작 순서:

- 드래그 중에는 `dragOffset !== 0`이라 transition이 꺼져 있어 카드가 손가락을 즉시 따라옵니다.
- 손을 떼는 순간 `goNext()`가 호출되어 `bannerIdx`가 바로 바뀝니다. 가운데 카드 위치에 새 멤버 데이터가 즉시 나타납니다.
- 그 직후 `setDragOffset(0)`이 호출되어 트랙이 드래그 위치에서 0으로 부드럽게 돌아옵니다.

문제점:

- 사용자 입장에서는 "다음 카드"가 슬라이드되어 들어오는 게 아니라, "새 카드가 손가락 위치에 갑자기 나타났다가 가운데로 미끄러져 오는" 느낌입니다.
- 카드 간 슬라이드 전환이 시각적으로 보이지 않고, 콘텐츠가 펑 하고 바뀌는 jerky한 인상을 줍니다.

원하는 동작은 손을 떼면 옆에 있던 next 카드가 자연스럽게 가운데로 슬라이드되고, 그 다음에 데이터가 교체되는 흐름입니다.

### 해결 - "슬라이드 → 데이터 교체 → 위치 리셋" 3단계

핵심 아이디어:

1. 손을 뗀 직후 트랙을 한 카드 너비만큼 슬라이드합니다 (transition ON).
2. 슬라이드 애니메이션이 끝난 시점에 `bannerIdx`를 변경해 데이터를 교체합니다.
3. 동시에 transition을 끄고 translate를 0으로 instant 리셋합니다 (시각적으로 보이지 않는 점프).

```js
const [snapping, setSnapping] = useState(false);
const ANIM_MS = 300;

const handleMouseUp = () => {
  const delta = dragDelta.current;

  if (Math.abs(delta) > 60) {
    // 1단계: 한 카드 너비만큼 슬라이드 (transition ON)
    const direction = delta < 0 ? -1 : 1;
    const cardWidth = viewportWidth * 0.6;   // bannerCardCenter가 60%
    setSnapping(true);
    setDragOffset(direction * (cardWidth + GAP));

    // 2단계: 슬라이드 끝나면 데이터 교체 + 위치 instant 리셋
    setTimeout(() => {
      delta < 0 ? goNext() : goPrev();   // bannerIdx 변경
      setSnapping(false);                 // transition OFF
      setDragOffset(0);                   // 즉시 0으로 (transition 없어서 안 보임)
    }, ANIM_MS);
  } else {
    // 작은 드래그는 그냥 복귀만
    setSnapping(true);
    setDragOffset(0);
    setTimeout(() => setSnapping(false), ANIM_MS);
  }

  // 기존 정리 로직
  dragStartX.current = null;
  dragDelta.current = 0;
  setTimeout(() => { isDragging.current = false; }, 0);
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
};
```

JSX의 transition 조건도 같이 바꿔주세요:

```jsx
<div
  className={styles["bannerTrack"]}
  style={{
    transform: `translateX(${baseOffset + dragOffset}px)`,
    transition: snapping ? "transform 0.3s ease" : "none",
  }}
>
```

핵심 포인트:

- `snapping === true`일 때만 transition이 켜집니다 (슬라이드 애니메이션 중).
- `snapping === false`일 때는 transition이 꺼져 있어, 데이터 교체 직후의 `setDragOffset(0)`이 시각적으로 점프 없이 적용됩니다.
- 사용자 눈에는 "옆에 있던 next 카드가 가운데로 미끄러져 들어옴 → 데이터 교체는 보이지 않음" 흐름으로 보입니다.

터치 이벤트(`handleTouchEnd`)도 같은 패턴으로 수정해주세요.

추가 디테일:

- `viewportWidth`는 state로 관리해야 합니다 (위 18번 항목 참고). ref만 쓰면 첫 렌더에서 0이 들어와 슬라이드 거리가 0이 됩니다.
- `snapping` 동안 추가 드래그를 막으려면 `handleMouseDown` 시작 부분에 `if (snapping) return;`를 넣는 게 안전합니다.
- 더 매끄러운 곡선을 원하면 `cubic-bezier(0.25, 0.1, 0.25, 1)` 같은 ease-out 곡선을 써보세요.

### 대안 - 검증된 캐러셀 라이브러리

직접 구현이 복잡하다면 검증된 라이브러리도 고려해볼 만합니다:

- `embla-carousel-react` - 가볍고 드래그/터치 기본 지원, 스냅 동작 부드러움
- `swiper` - 기능 많음, 가장 많이 쓰임
- `keen-slider` - 가벼움, 커스터마이징 자유

대부분의 상용 서비스(올리브영 포함)는 이런 라이브러리를 씁니다. 직접 구현은 학습 목적으로 좋지만, 제품 단계로 가면 라이브러리가 안정적입니다.

### 22. `.bannerViewAll` 전체 보기 버튼 위치가 어색합니다

JSX:

```jsx
<div className={`${styles["bannerCard"]} ${styles["bannerCardCenter"]}`}>
  ...
  <span className={styles["bannerBadge"]}>{currentMember.badge}</span>
  <div className={styles["bannerInfo"]}>...</div>
  <button className={styles["bannerViewAll"]}>
    {showGrid ? "－ 접기" : "+ 전체보기"}
  </button>
</div>
```

CSS:

```css
.bannerViewAll {
  position: absolute;
  bottom: 14px;
  right: 12px;
  z-index: 3;
  background: none;
  border: none;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
}
```

어색한 점:

- "전체 보기"는 **페이지 전체** 그리드를 토글하는 액션인데, **개별 카드 안 우측 하단**에 들어가 있습니다. 시맨틱이 어긋납니다.
- 카드 안의 `.bannerInfo`(이름/파트/소개)와 같은 영역에 위치해 있어서, 카드의 일부 정보처럼 보일 수 있습니다.
- 슬라이드해서 다른 카드로 이동하면 버튼이 "다른 카드 위로 옮겨가는" 인상을 줍니다 (실제로는 항상 가운데 카드에 붙어있지만, 사용자에게는 카드별 액션처럼 느껴집니다).
- `background: none` + 흰 글자라서 카드 이미지가 밝은 부분이면 잘 안 보이고, hover 피드백도 없습니다(`background: none` 그대로).
- 우측 하단은 보통 카드 자체의 "더보기/링크" 같은 카드 액션이 자리하는 위치라서 헷갈리기 쉽습니다.

### 해결 - 슬라이더 바깥, 페이지 액션 영역으로 분리

페이지 레벨 액션은 페이지 레벨 위치에 두는 게 자연스럽습니다.

A. 슬라이더 위 (헤더 우측)

```jsx
<div className={styles["bannerHeader"]}>
  <h3>아기 사자들</h3>
  <button className={styles["viewAllBtn"]} onClick={() => setShowGrid((v) => !v)}>
    {showGrid ? "접기" : "전체보기"}
  </button>
</div>

<div className={styles["bannerSection"]}>...</div>
```

```css
.bannerHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
```

B. 슬라이더 아래, 도트와 같은 행

```jsx
<div className={styles["bannerControls"]}>
  <div className={styles["bannerDots"]}>...</div>
  <button className={styles["viewAllBtn"]}>
    {showGrid ? "접기" : "전체보기"}
  </button>
</div>
```

A 패턴이 가장 무난하고 시맨틱적으로 명확합니다. "이 섹션 전체를 그리드로 보겠다"는 의도가 한눈에 드러납니다.

버튼 스타일도 카드 위가 아닌 페이지 톤에 맞춰주세요:

```css
.viewAllBtn {
  background: #f5f7f3;
  color: #5a9e2f;
  border: 1px solid #d5e6b0;
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.viewAllBtn:hover {
  background: #e4eecc;
}
```

이렇게 분리하면 "전체보기/접기"가 카드 내부 정보와 섞이지 않고, 카드 슬라이드와 무관한 페이지 레벨 토글이라는 것이 명확해집니다.

## 정리

올리브영 컨셉이 잘 잡혔고 배너 슬라이더(드래그 + 터치 + 도트)는 시도 자체가 인상적입니다.
다음 단계로 정리하실 우선순위 5가지를 뽑으면 다음과 같습니다.

1. **club 필드 버그 해결** - 폼이 실제로 동작하도록 (가장 critical)
2. **CSS 단위 오타 수정** - `max-width: 100vh` → `1200px`
3. **AbortController + 타임아웃 + setTimeout cleanup** - 4주차 review 항목 마무리
4. **색상 일관성 정리** - `.blueRule` 이름/색상, 배지 핑크 글자, hover 시 노랑/청록 등 컨셉에 맞게
5. **useEffect 의존성 배열 + useMemo로 displayList 안정화**

이 다섯 가지만 적용해도 디자인은 더 일관되고 동작은 더 안정적이 됩니다.
