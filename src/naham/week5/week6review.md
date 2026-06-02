# 6주차 나함 UI 디자인 리뷰

## 인식된 디자인 컨셉

네이버 모바일 앱 스타일로 보입니다.

## 1. `:global(body)` 사용 자체가 문제입니다

`Page.module.css` 최상단에 다음과 같은 코드를 작성했습니다.

```
:global(body) {
    font-family: 'Pretendard', sans-serif;
    background-color: #e9ecef;
    margin: 0;
    display: flex;
    justify-content: center;
}
```

> 참고: 현재 리뷰 시점에는 이 블록을 의도적으로 주석 처리해두었습니다. 주석을 해제하면 "그래도 디자인은 보인다"는 착시 때문에 정말 큰 문제가 가려지기 때문입니다. 코드 자체의 잘못은 **`:global()`을 컴포넌트 css에서 사용한 것**이고, 주석 여부와 무관하게 잘못된 접근입니다.

### 왜 `:global()`이 문제인가

CSS Modules의 핵심 가치는 **클래스 이름이 컴포넌트 단위로 격리되어 다른 페이지에 영향을 주지 않는 것**입니다. `_weekPage_abc123_5` 같은 해시된 클래스 이름을 자동 생성해서 충돌을 막아줍니다.

`:global()`은 그 격리를 명시적으로 깨는 escape hatch입니다. 컴포넌트의 `.module.css` 파일에서 `:global(body)` 같은 전역 셀렉터를 건드리면 다음 일이 벌어집니다.

1. **다른 사람 페이지에까지 영향이 갑니다** — 한 번 적용된 body 스타일은 SPA(react-router) 환경에서 페이지 이동 후에도 그대로 남습니다. 다른 사람의 페이지(예: `src/seoyun/week4`, `src/taeyeop/week4`)로 이동해도 그린 배경, Pretendard 폰트, body flex 정렬이 강제로 그대로 적용됩니다. 그 페이지들의 의도된 디자인이 무너집니다.
2. **CSS Modules를 쓰는 의미가 사라집니다** — 격리를 위해 도구를 도입하고, 그 도구의 격리를 깨버리는 모순.
3. **`.weekPage` 자체가 `:global(body)`에 의존하는 구조가 됩니다** — `.weekPage`에 `margin: 0 auto`도 없고, 폰트도 없고, 배경 그라데이션을 위한 어떤 컨텍스트도 없습니다. 모든 게 body에 깔린 전제 위에서만 동작합니다. 결과적으로 **이 컴포넌트는 `:global(body)`가 없으면 디자인이 무너지는 의존적인 구조**가 되었습니다. 컴포넌트의 자기 완결성(self-containment)이 깨졌습니다.

### 해결 — 두 가지를 같이 적용

**A. `:global()`은 컴포넌트 css에서 절대 사용 금지**

전역 스타일은 전역 stylesheet에서 다룹니다.

```
/* src/styles/globals.css (또는 main.jsx에서 import되는 전역 css) */
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");

body {
  font-family: 'Pretendard', sans-serif;
  background-color: #e9ecef;
  margin: 0;
}
```

다만 여기서 `display: flex; justify-content: center;`는 빼야 합니다 — 다른 사람들의 페이지 레이아웃까지 강제로 가운데 정렬해버리기 때문입니다.

**B. `.weekPage`가 스스로 중앙 정렬 + 배경을 가지도록 자기 완결화**

`:global(body)`의 `display: flex; justify-content: center;` 의존성을 제거하고, `.weekPage` 자체에 `margin: 0 auto`를 줘서 컴포넌트 단독으로 중앙 정렬되게 합니다.

```
.weekPage {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;          /* 부모(body)의 flex에 의존하지 않고 자체 중앙 정렬 */
  min-height: 100vh;
  background: #f4f7f8;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
  font-family: 'Pretendard', sans-serif;
}
```

이렇게 하면 body의 전역 스타일(폰트/배경)에는 여전히 의존하지만, 적어도 **"flex container인 body의 자식이어야만 동작하는" 구조는 깨집니다**. 다른 페이지에서 이 컴포넌트를 떼서 다른 곳에 옮겨도 똑같이 동작합니다.

**핵심 원칙**: 컴포넌트의 css는 그 컴포넌트의 내부만 책임집니다. body든, html이든, 다른 사람의 페이지든 절대 건드리지 마세요. 전역 스타일은 전역 stylesheet에서.

## 2. 반응형이 전혀 구현되어 있지 않습니다 — 모바일에서만 의도대로 보입니다

`Page.module.css` 전체를 봐도 **`@media` 쿼리가 단 한 줄도 없습니다.** 모든 스타일이 모바일 폭(`max-width: 480px`) 기준의 단일 레이아웃입니다.

구체적으로 깨지는 부분:

- `.weekPage { max-width: 480px }` — 화면 너비와 무관하게 항상 480px (480px 이하 화면에서만 자연스럽게 줄어듭니다). 데스크탑에서는 480px짜리 좁은 컬럼만 보입니다.
- `.cardGrid { display: flex; flex-direction: column; }` — 데스크탑이건 태블릿이건 항상 한 줄에 카드 한 개. 데스크탑의 가로 공간을 전혀 활용 못 합니다.
- `.summaryCard` — 좌측 60px 원형 아바타 + 우측 정보의 list-item 레이아웃. 모바일에선 자연스럽지만 큰 화면에선 카드 하나가 480px을 차지하며 단조롭게 늘어집니다.
- `.controls { position: sticky; top: 0; }` — 모바일에선 자연스러운 상단 고정이지만, 큰 화면에서는 480px 좁은 영역에만 sticky가 걸려 어색합니다.
- `.modalContent { width: 85%; max-width: 400px }` — 모바일 사이즈로 고정. 데스크탑에서도 작은 모달이라 정보 밀집도가 떨어집니다.
- `.cardIntro { max-width: 200px }` — 한 줄 소개를 200px로 강제 truncate. 데스크탑에서도 200px로 자르기 때문에 공간 활용이 안 됩니다.

**결론: 실질적으로 모바일 화면(≤480px)에서만 의도대로 보이고, 그 외 모든 화면(태블릿/데스크탑)에서는 디자인이 깨져 보입니다.** "반응형 디자인을 한 것"이 아니라 "모바일 한 사이즈만 고려한 정적 디자인을 한 것"입니다.

### 해결 — 단계별 반응형 적용

**B. 핵심 — 미디어 쿼리로 화면 크기별 레이아웃 변경**

기본 mobile-first 접근을 유지하면서, 태블릿/데스크탑에서 카드 그리드를 2~3열로 펼치고, 컨테이너 폭을 늘려야 합니다.

```
/* mobile (기본): max-width 480, 한 줄 list */
.weekPage {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f4f7f8;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.cardGrid {
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 12px;
}

/* 태블릿: 폭 확장 + 카드 그리드 2열 */
@media (min-width: 768px) {
  .weekPage {
    max-width: 768px;
  }
  .cardGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* 데스크탑: 폭 더 확장 + 3열 */
@media (min-width: 1024px) {
  .weekPage {
    max-width: 1100px;
  }
  .cardGrid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .summaryCard {
    /* 큰 화면에선 가로 list가 아니라 세로 카드 형태가 더 자연스러움 */
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  .summaryCard img {
    width: 96px;
    height: 96px;
    margin-right: 0;
    margin-bottom: 14px;
  }
  .cardIntro {
    max-width: none;        /* 200px 강제 자르기 해제 */
    white-space: normal;     /* 두 줄 이상 허용 */
  }
}
```

**C. `.cardIntro`의 `max-width: 200px` 같은 모바일 전용 magic number는 미디어 쿼리 안에 격리**

```
/* 모바일에서만 한 줄 truncate */
@media (max-width: 767px) {
  .cardIntro {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
```

이렇게 모바일/태블릿/데스크탑 세 단계로 나누어 반응형을 구성해야 "진짜 반응형"이라 부를 수 있습니다.

## 3. 반응형 접근 방식 자체가 잘못 잡혔습니다

위 2번에서 단순히 미디어 쿼리가 빠진 게 아니라, **"모바일 전용 디자인"으로 짠 다음 그것을 어디서나 동일하게 보이게 하려고 한 것**이 근본 원인입니다.

진정한 반응형은 두 가지 방향이 있습니다:

- **A. Mobile-first 점진적 확장**: 모바일 레이아웃을 기본으로 짜고, 미디어 쿼리로 큰 화면에서 점차 펼치며 확장
- **B. 적응형(Adaptive) 분기**: 모바일/태블릿/데스크탑 각각 별도 레이아웃을 디자인하고 분기

현재 코드는 A의 방향성은 잡았지만 "확장하는 미디어 쿼리"가 0개라 사실상 모바일에서 멈춰 있습니다.

추가로 `max-width: 480px`라는 고정 폭을 데스크탑에서도 그대로 두는 것은 "데스크탑 사용자를 무시"하는 결정입니다. 네이버 같은 회사 앱도 모바일/데스크탑 완전 분리된 별도 디자인을 가지지, 하나의 좁은 박스로 양쪽을 다루지 않습니다.

### 해결 방향

- **모바일 디자인은 그대로 유지** — 이미 잘 잡혀 있습니다 (네이버 모바일 메일/연락처 스타일)
- **태블릿(768px~)부터는 카드 그리드를 2열로** — 모바일 list 카드 그대로 2열 배치
- **데스크탑(1024px~)부터는 별도 디자인 고려** — 카드를 세로형으로 바꾸거나, 사이드바를 추가하거나, 데스크탑 전용 페이지 레이아웃으로 분기
- **`max-width`는 단계별로 늘리기** — 480px(mobile) → 768px(tablet) → 1100~1200px(desktop)

## 4. 기타 디자인 디테일 이슈

### 4-1. Pretendard 폰트 import 자체가 빠져 있습니다

`font-family: 'Pretendard'`로 지정해도 프로젝트 어디에서도 폰트를 import하지 않으면 사용자 OS에 깔려 있어야만 적용됩니다. 1번 항목의 globals.css 수정 시 CDN import도 같이 추가하세요.

### 4-2. `.controls`의 sticky가 회색 영역이 없을 때 어색합니다

`.controls`는 `position: sticky; top: 0;`로 상단 고정이고, `background: #fff`로 흰 배경. 1번 문제가 해결되어 회색 body 배경 위에 흰 weekPage가 떠 있는 모습이 되면 자연스럽지만, 현재 상태에선 그냥 흰 위 흰이라 sticky 효과가 잘 안 보입니다.

### 4-3. `.searchInput`의 `order: -1`로 controls 첫 줄로 띄움 — 좋은 패턴이지만 의도가 명확하지 않을 수 있음

```
.searchInput {
  order: -1;
  width: 100%;
  ...
}
```

flex order 활용은 좋지만, 이게 왜 -1인지 코드만 보고는 알기 어렵습니다. 차라리 JSX 순서를 검색창이 맨 위로 오도록 바꾸는 게 가독성에 좋습니다.

## 5. 기능적 이슈

이전 4주차 review의 개선사항은 거의 모두 잘 반영되어 있습니다 (AbortController + latestRequestId + 타임아웃 + onError fallback + controlled form + 화면 내 에러 메시지 + lastFetchActionRef 재시도). 다음 항목들만 마무리하면 됩니다.

### 5-1. 컴포넌트 함수명이 `Week4Page`입니다

```
export default function Week4Page() { ... }
```

폴더는 `week5`이고 6주차 과제 결과물인데 함수명은 `Week4Page`로 남아 있습니다. React DevTools나 코드 검색 시 헷갈립니다.

```
export default function Week5Page() { ... }
```

### 5-2. 인라인 style 자리에 있던 카운트 라벨 — 이번엔 잘 해결됨

`.totalCount` 클래스로 잘 분리되어 있습니다. 4주차 review에서 지적했던 인라인 style 잔존 문제는 해결되었습니다.

### 5-3. `formError`를 화면에 표시 — 4주차 review 개선사항 잘 반영

alert 대신 `setFormError` + JSX 안에 표시한 패턴 좋습니다.

### 5-4. fetched 멤버에 `contact` 객체 누락 (4주차 review #7 미해결)

```
const newLions = externalUsers.slice(0, count).map((user) => {
  return {
    ...
    email: user.email,        // 평탄화 - contact 객체 없음
    phone: user.phone,
    ...
  };
});
```

그런데 사실 학생 코드는 lions.js의 멤버 구조도 평탄화 형태(`email`, `phone`이 객체 안이 아니라 직접 필드)로 사용하고 있어서 일관됩니다. 만약 다른 사람 데이터(예: contact 객체 구조)와 합치게 되면 충돌 가능. 일관되게 유지된다면 OK.

## 정리

네이버 모바일 앱 스타일을 컨셉으로 잡은 것은 명확하고, 컬러/구성/카드 패턴도 잘 잡혀 있습니다.
다만 두 가지가 치명적입니다.

1. **`:global(body)`를 컴포넌트 css에서 사용한 것 자체가 잘못입니다.** CSS Modules의 격리 원칙을 깨고, 다른 사람들의 페이지에까지 body 스타일이 강제로 적용되며, `.weekPage`가 그 전역 스타일에 의존하는 self-contained 하지 않은 구조가 되었습니다. 컴포넌트 css에서는 `:global()`을 절대 쓰지 말고, 전역 스타일은 전역 stylesheet(globals.css 등)에서만 다뤄야 합니다.

2. **반응형이 단 하나도 구현되어 있지 않아서 오직 모바일(≤480px) 화면에서만 그나마 의도대로 보입니다.** 미디어 쿼리가 0개이고, `max-width: 480px`로 고정된 폭만 사용하므로 태블릿/데스크탑 사용자는 좁은 박스가 좌측에 떠 있는 깨진 화면을 보게 됩니다. 이건 "반응형을 잘못 한 것"이 아니라 **"반응형이 아예 없는 것"**입니다.

다음 우선순위 3가지:

1. **컴포넌트 css에서 `:global()` 제거 + `.weekPage`가 자체적으로 중앙 정렬되도록 `margin: 0 auto` 추가** — 격리 원칙 복구 및 컴포넌트 self-contained 화
2. **미디어 쿼리로 태블릿(768px+)/데스크탑(1024px+) 분기 추가** — 진정한 반응형 구현
3. **`max-width: 480px`를 단계별로 확장** — 480 → 768 → 1100px

이 셋만 적용해도 네이버 컨셉이 다른 사람 페이지를 망가뜨리지 않으면서, 모든 화면 크기에서 의도대로 살아납니다.
