# 6주차 소민 UI 디자인 리뷰

## 디자인 컨셉

스포티파이(Spotify) 다크 모드 스타일

## 1. `.weekPage` 양 옆의 흰 띠 — body가 처리 안 됨

`.weekPage`는 `max-width: 1200px; margin: 0 auto;`로 가운데 정렬되고 `background: #121212`로 다크입니다. 하지만 화면이 1200px보다 넓으면 weekPage 좌우는 body 기본 배경(흰색)이 보입니다.

데스크탑에서 페이지 양옆에 흰 띠가 나타나서 "검은 컨테이너 + 양쪽 흰 영역"이 됩니다. Spotify 컨셉의 어두운 분위기가 깨집니다.

해결 — 전역 body 처리

`src/styles/globals.css` (또는 main.jsx에서 import되는 전역 css):

```
body {
  background-color: #121212;
  color: white;
  margin: 0;
}
```

다른 페이지에 영향을 줄 수 있다는 점이 신경 쓰인다면, weekPage를 화면 전체 폭으로 만들고 내부에 1200px 컨테이너를 두는 방식도 가능합니다.

```
.weekPage {
  background: #121212;
  min-height: 100vh;
  padding: 24px 0;
}

.weekPageInner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
```

JSX는 `<div className={styles.weekPage}><div className={styles.weekPageInner}>...</div></div>` 구조.

## 2. heroTitle이 모바일에서 너무 큼

```
.heroTitle {
  font-size: 72px;
  font-weight: 900;
  color: white;
  margin: 0;
}
```

데스크탑에선 임팩트 있지만 모바일(`@media (max-width: 600px)`)에서도 72px 그대로 유지됩니다. 폭이 좁아서 "멋쟁이 아기사자" 글자가 두 줄로 흐르거나 잘릴 수 있습니다.

해결 — 미디어 쿼리에 추가:

```
@media (max-width: 600px) {
  .heroTitle {
    font-size: 40px;
  }
  .heroBanner {
    height: 220px;
  }
  .heroOverlay {
    padding: 24px;
  }
}
```

## 3. 정렬 "최신추가순"이 사실은 오래된 게 위에 옵니다 (이전 review #15 미해결)

```
if (sortOrder === "latest") {
  visibleMembers.sort((a, b) => a.id - b.id);
}
```

`a.id - b.id`는 오름차순이라 가장 작은 id(가장 오래 추가된 멤버)가 위로 옵니다. 라벨인 "최신추가순"과 동작이 반대입니다.

해결:

```
if (sortOrder === "latest") {
  visibleMembers.sort((a, b) => b.id - a.id);
}
```

## 4. `.controlBar`가 양옆을 음수 마진으로 깨고 펼치고 있지만 weekPage 안쪽까지만

```
.controlBar {
  background: #181818;
  margin: 0 -24px;
  padding: 0 24px;
  ...
}
```

`.weekPage`의 24px padding을 음수 마진으로 상쇄해서 weekPage 끝까지 펼쳤습니다. 다만 weekPage 자체가 1200px max-width로 제한되어 있어서, 데스크탑에서 `.controlBar`도 1200px 안에서만 펼쳐집니다.

의도가 "화면 끝까지"였다면 weekPage 구조를 1번 항목처럼 바꿔야 합니다. "weekPage 안에서만 끝까지"였다면 현재 OK.

## 5. hover 효과 일관성

다음 세 가지 transform이 동시에 작동합니다.

- `.btn:hover { transform: scale(1.04); }` — 버튼 hover
- `.card:hover { transform: translateY(-8px); }` — 카드 hover
- `.myCard { transform: translateY(-2px); }` — 본인 카드 기본 상태

세 가지 transform 방식이 다 다릅니다. 디자인 시스템 측면에서 "hover는 항상 어떻게 동작한다"는 약속이 잡혀 있는 게 일관성에 좋습니다.

해결 — hover에는 항상 같은 종류의 변화를 (예: translateY):

```
.btn:hover {
  background: #1ed760;
  transform: translateY(-2px);   /* scale 대신 translateY로 통일 */
}
```

또는 카드 hover에서 그린 액센트를 추가:

```
.card:hover {
  background: #282828;
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(29, 185, 84, 0.2);   /* 그린 톤 그림자 */
}
```

## 6. dead CSS — `.badge` 정의가 있지만 사용 안 됨

```
.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  ...
}
```

`SummaryCard`에 `.badge` 클래스를 사용한 JSX가 없습니다. 이전에는 있었던 것 같은데 (`{member.badge}`를 카드 위에 떠 있는 뱃지로) 현재는 `.cardEnd`에서 `{member.role} · {member.badge}` 형태로 텍스트만 표시합니다.

해결: 사용 안 하면 삭제. 또는 hover 시 우상단에 뱃지를 띄우는 디자인이라면 JSX에 추가.

## 7. 기능적 이슈 — 4주차 review 항목들

이전 4주차 review의 개선사항은 거의 모두 잘 반영되어 있습니다. AbortController + latestRequestId + 타임아웃 + `fillControllerRef` 분리 + cleanup + useRef id 카운터 + `detailRefs[id]` 인덱싱 + null 시 delete + controlled form + 화면 내 `formError` + onError fallback + `handleRefreshAll`의 fetchCount<=0 처리 등.

남은 항목들:

### 7-1. 정렬 newest 방향 (3번 항목과 동일)

### 7-2. 정렬 로직이 if 두 번 — 약간의 가독성 손해

```
if (sortOrder === "latest") {
  visibleMembers.sort((a, b) => a.id - b.id);
}
if (sortOrder === "name") {
  visibleMembers.sort((a, b) => a.name.localeCompare(b.name, "ko"));
}
```

else if로 묶으면 가독성이 좋아집니다. 동작은 같습니다.

```
if (sortOrder === "latest") {
  visibleMembers.sort((a, b) => b.id - a.id);
} else if (sortOrder === "name") {
  visibleMembers.sort((a, b) => a.name.localeCompare(b.name, "ko"));
}
```

### 7-3. `visibleMembers`를 `useMemo`로 안정화하면 더 좋음 (선택사항)

지금은 매 렌더마다 새 배열을 만듭니다. 멤버 수가 적을 땐 부담 없지만, `useMemo`로 묶으면 의존성이 명확해지고 재렌더 비용이 줄어듭니다.

```
const visibleMembers = useMemo(() => {
  let list = [...membersList];
  if (partFilter !== "ALL") {
    list = list.filter((m) => m.role === partFilter);
  }
  ...
  return list;
}, [membersList, partFilter, searchQuery, sortOrder]);
```

## 정리

1. **`body` 다크 처리** — 데스크탑에서 weekPage 양옆 흰 띠 제거 (1번)
2. **heroTitle 모바일 반응형** — 72px이 모바일에서 잘리지 않게 (2번)
3. **정렬 newest 방향 수정** — `b.id - a.id`로 (3번, 이전 review 미해결)

이 셋만 정리하면 Spotify 컨셉이 모든 화면에서 일관되게 살아납니다.
