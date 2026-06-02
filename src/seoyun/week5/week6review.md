# 6주차 서윤 UI 디자인 리뷰

## 과제 목표와 결과물의 차이를 먼저 짚고 갑니다

이번 주차 과제 목표는 **"이전 주차의 아기사자 소개 카드를 리디자인"**하는 것이었습니다.
즉 4주차까지 만들어온 "여러 아기사자(7~8명)의 명단 + 상세 보기" 페이지를 가져와서 그 UI/UX를 새로운 컨셉으로 다시 그리는 작업입니다.

그런데 현재 결과물(`src/seoyun/week5/Page.jsx`)은 **본인 한 명(정서윤)을 위한 GitHub 프로필 페이지**입니다. 다른 아기사자들의 데이터, 카드 그리드(명단), 검색·필터·추가·삭제·fetch 등 4주차까지 쌓인 기능이 모두 빠져 있고, 1인 프로필 페이지로 전환되었습니다.

GitHub UI 자체의 완성도는 매우 높지만(아래 2번 항목 참고), **"이전 주차 결과물 위에 디자인 작업"이라는 과제 본질에서 벗어났습니다.** 이 부분을 명확히 짚고, 다음 단계로 어떻게 이어가면 좋을지를 같이 정리합니다.

## 디자인 컨셉

GitHub 프로필 페이지

## 1. 가장 큰 문제 — 과제 목표가 빗나갔습니다

과제는 **"여러 명의 아기사자 소개 카드(명단) 리디자인"**이었는데, 결과물은 **"본인 1인용 프로필 페이지"**입니다.

### 다음 단계

**A. GitHub 컨셉을 그대로 살리되, 멤버 명단으로 확장 (권장)**

GitHub의 organization 페이지 또는 People 탭 패턴을 차용해서 "아기사자 멤버 일람"을 표현할 수 있습니다.

예시 구조:

- 페이지 상단: organization 헤더 (멋쟁이사자처럼 디스이즈 로고·이름·설명)
- People 탭: 멤버 그리드 (각 카드가 mini GitHub 프로필 형태 — 아바타·이름·한 줄 소개·언어 stat 줄)
- 카드 클릭: 모달로 해당 멤버의 상세 페이지 (지금 만든 정서윤 프로필 페이지 구조 그대로)
- 검색·필터·추가·삭제·fetch 등 4주차까지의 기능 그대로 유지

이렇게 하면 지금 만든 디자인 자산(컬러 팔레트·SVG 아이콘·README 카드·잔디 그래프·repo 카드·activity 타임라인)을 100% 살리면서 과제 목표도 같이 달성됩니다.

**B. 현재 페이지는 "본인 상세 페이지"로 쓰고, 명단 페이지를 따로 만들기**

지금 페이지는 "카드 클릭 → 상세" 화면으로 활용하고, 새 페이지에서 명단(요약 카드 그리드)을 만들고 라우팅으로 연결.

학습 효과 측면에서는 **A 방향**이 더 유익합니다. 한 페이지 안에서 명단 ↔ 상세 전환을 모달로 처리하면 라우팅 분리 없이 자연스럽게 구성됩니다.

## 2. 현재 구현 자체의 잔손질 포인트

과제 목표와는 별개로, 현재 페이지 안에서도 다듬을 부분 몇 가지를 짚습니다.

### 2-1. 같은 768px 미디어 쿼리가 두 번 선언되어 있습니다

`Page.module.css` 안에 `@media (max-width: 768px)`가 두 번 나옵니다 (75행, 288행). 두 번째 블록이 첫 번째를 덮어써서, 예를 들어 `.avatarImg`의 80px(첫 번째) → 72px(두 번째)로 정해집니다.

해결: 한 블록으로 합쳐서 의도를 명확히.

```
@media (max-width: 768px) {
  .root { flex-direction: column; }
  .sidebar {
    width: 100%; height: auto; position: static;
    border-right: none; border-bottom: 1px solid #21262d;
    padding: 20px;
    flex-direction: row; flex-wrap: wrap;
    align-items: flex-start; gap: 16px;
  }
  .avatar { width: 100%; justify-content: flex-start; }
  .avatarImg { width: 72px; height: 72px; }
  .displayName { font-size: 18px; }
  .username    { font-size: 15px; }
  .repoGrid { grid-template-columns: 1fr; }
  .grassGrid { gap: 1px; }
  .grassCell { width: 8px; height: 8px; }
}
```

### 2-2. `height: calc(100vh - 57px)`의 57px이 무엇인지 알 수 없습니다

```
.root {
  height: calc(100vh - 57px);
}
```

상단 nav 높이로 추정되지만 코드 안에서는 알 수 없습니다. 주석으로 의도를 적거나, CSS 변수로 분리하는 게 좋습니다.

```
:root {
  --top-nav-height: 57px;
}

.root {
  height: calc(100vh - var(--top-nav-height));
}
```

### 2-3. Follow 버튼이 동작하지 않습니다

```jsx
<button className={styles.followBtn}>Follow</button>
```

onClick이 없어서 단순 데코입니다. GitHub UI 재현 정신에 맞춰 토글 동작(Following ↔ Unfollow)을 구현하거나, 데코임을 명시(`aria-disabled` 등)하면 좋습니다.

```jsx
const [following, setFollowing] = useState(false);

<button
  className={`${styles.followBtn} ${following ? styles.followBtnActive : ""}`}
  onClick={() => setFollowing((v) => !v)}
>
  {following ? "Following" : "Follow"}
</button>;
```

### 2-4. `ACTIVITY` 데이터가 2개뿐이라 타임라인 디자인이 잘 안 드러납니다

```js
const ACTIVITY = [
  {
    date: "2026-03-02",
    msg: "chore: 멋쟁이사자처럼 디스이즈 활동 시작",
    type: "chore",
  },
  { date: "2026-03-02", msg: "init: 동아대학교 26학번 입학", type: "feat" },
];
```

타임라인 UI 자체는 좋은데 데이터가 2개라 디자인의 가치가 묻힙니다. 멋사 학습 마일스톤, 첫 PR, 첫 프로젝트 등을 추가하면 디자인이 살아납니다.

### 2-5. `generatePixelGrass()`가 module level에서 한 번만 실행됩니다

```js
const GRASS = generatePixelGrass();
```

매번 같은 잔디 패턴이 보입니다. 의도된 것이라면 OK이지만, "매번 다른 패턴"이 의도였다면 컴포넌트 안에서 `useMemo`로 만들거나, 사용자 인터랙션(클릭)으로 재생성하는 방향도 가능합니다.

### 2-6. 데이터가 module-level const로 hardcoded

`REPOS`, `ACTIVITY`, `SKILLS_STAT` 모두 module-level const입니다. 이전 주차의 `useState` 기반 동적 데이터 관리 패턴이 빠져 있습니다.

이건 1번 항목(과제 목표 미달성)과 직결됩니다. 멤버 명단으로 확장하면 자연스럽게 `useState`로 관리하게 됩니다.

## 정리

1. **지금 디자인을 살려서 멤버 명단으로 확장** — GitHub의 People/Organization 페이지 패턴을 차용. 카드 클릭으로 지금의 정서윤 프로필 페이지를 모달로 띄우는 방식이 가장 자연스럽습니다.
2. **이전 주차 데이터/기능 다시 통합** — lions/members 데이터, 검색·필터·정렬, 추가·삭제, fetch with AbortController, 자기소개 모달 등을 지금의 GitHub 디자인 톤으로 재구성.
3. **현재 페이지의 잔손질** — 중복 768px 미디어 쿼리 정리, 57px magic number 명시, Follow 버튼 동작, ACTIVITY 데이터 늘리기 등.

GitHub 컨셉 자체는 정말 잘 잡으셨으니, 이 톤을 그대로 살리면서 "여러 명의 아기사자를 다루는 페이지"로 확장하시면 가장 좋은 결과가 나올 것 같습니다.
