# 6주차 도영 UI 디자인 리뷰

## 디자인

토스로 보입니다.

---

## 1. 함수명과 h2 텍스트가 week4 그대로입니다

```jsx
export default function Week4Page() {
  return (
    <div className={styles["week-page"]}>
      <h2>4주차</h2>
```

week6 폴더인데 함수명도 `Week4Page`, 화면에 표시되는 제목도 "4주차"입니다. week4 코드를 그대로 복사해 와서 그런 것 같아요. 함수명은 `Week6Page`로, h2는 "6주차"로 바꿔주세요. 또는 토스 컨셉 페이지의 정체성을 살려서 "아기사자 명단"처럼 의미 있는 타이틀로 바꿔도 좋습니다.

---

## 2. `onError`에서 `scr` 오타 — 이미지 폴백이 안 됩니다

```jsx
onError={(e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.scr = `https://picsum.photos/seed/${member.id || member.name}/300/300`;
}}
```

`scr`은 `src` 오타입니다. 이미지가 깨졌을 때 picsum 대체 이미지로 바꾸려는 의도인데, `scr` 속성은 DOM에 존재하지 않아서 아무 일도 안 일어납니다. 깨진 이미지가 그대로 남게 됩니다.

```jsx
e.currentTarget.src = `https://picsum.photos/seed/${member.id || member.name}/300/300`;
```

---

## 3. 상세 카드가 두 번 렌더링됩니다

Page.jsx 854~873줄을 보면 상세 카드를 두 번 렌더링하고 있어요.

```jsx
{selectedMember && (
  <section className={styles.detailcardpack}>
    <DetailCard member={selectedMember} />
  </section>
)}
...
<section className={styles["detailcardpack"]}>
  {visibleMembers.map((member) => (
    <DetailCard key={member.id} member={member} />
  ))}
</section>
```

- 첫 번째 블록: `selectedMember` 한 명만 상세 카드로 표시 (의도된 동작)
- 두 번째 블록: `visibleMembers` 전체를 또 상세 카드로 표시 (week4 잔재로 보임)

결과적으로 선택한 사람 + 모든 사람 전체가 상세 카드로 나열됩니다. `selectedMember`를 만든 의미가 사라져요. 두 번째 블록은 삭제하는 게 맞습니다. 선택된 한 명만 우측에 상세로 보여주는 게 토스 스타일(좌측 리스트 + 우측 상세 패널)에도 더 맞습니다.

---

## 4. `fillRandomData`의 fetch가 두 번 호출됩니다

`fillRandomData` 함수 안에 fetch가 두 번 있습니다.

```jsx
const fillRandomData = async () => {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, 5000);

  const response = await fetch(                       // ← 첫 번째 fetch (try 밖)
    `https://randomuser.me/api/?nat=us,gb,ca,au,nz`,
    { signal: controller.signal }
  );
  try{
    setFetchStatus("loading");
    setRetryAction(() => fillRandomData);
    await new Promise((resolve) => setTimeout(resolve, 5000));   // ← 인위적 5초 대기
    const response = await fetch(`https://randomuser.me/api/?nat=us,gb,ca,au,nz`);  // ← 두 번째 fetch (signal 없음)
    ...
  }
```

문제가 세 가지입니다.

- **첫 번째 fetch가 try 밖에 있어요.** 에러가 나면 catch로 못 잡고 그대로 throw됩니다.
- **5초 인위 대기가 있어요.** `setTimeout` 타임아웃이 정확히 5초인데 대기도 5초입니다. 거의 항상 시간 초과로 빠집니다.
- **두 번째 fetch는 `signal`이 없어요.** abort가 걸려도 두 번째 요청은 안 멈춥니다.

`fetchRandomUsers`와 동일하게 try 안에서 한 번만 fetch하고, `signal`을 넘기고, 인위 대기는 빼주세요. 첫 fetch 결과를 쓸 거면 try 안으로 옮기고 두 번째 fetch는 삭제합니다.

---

## 5. `background-color`에 `linear-gradient`는 안 먹습니다

```css
.week-page {
  background-color: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}
```

`background-color`는 **단색만** 받습니다. 그라데이션은 무시되고 배경이 적용되지 않아요. 그라데이션을 쓰려면 `background:` 또는 `background-image:`로 바꿔야 합니다.

```css
.week-page {
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}
```

지금은 배경이 흰색으로 보이는 상태일 거예요.

---

## 6. 토스 컨셉인데 Pretendard 폰트가 빠졌습니다

토스는 Pretendard(또는 토스 자체 폰트)를 거의 시그니처처럼 씁니다. 지금 코드에는 `font-family` 지정이 전혀 없어서 브라우저 기본 폰트(돋움/굴림)로 보입니다. 색과 라운드만 토스인데 글자가 토스가 아니라서 컨셉이 살짝 깨져요.

`src/index.css` 또는 `src/main.jsx`에서 다음을 추가하면 됩니다.

```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");

body {
  font-family:
    "Pretendard",
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;
}
```

`week-page`에만 적용해도 되지만, 전역으로 적용하는 게 토스 느낌엔 더 맞습니다.

---

## 7. 본인 카드 색 + 칩 가독성이 떨어집니다

본인 카드(`.my-card`)는 파란 배경 `#5fa1ff` + 흰 텍스트입니다. 그런데 그 안에 있는 역할 칩(`.frontend`)은 **흰 배경 + 파란 글씨**라서 본인 카드 위에선 거의 안 보입니다.

```css
.my-card {
  background-color: #5fa1ff;
}
.frontend {
  background-color: #e8f3ff; /* ← 본인 카드 배경과 거의 같은 톤 */
  color: #3182f6;
}
```

해결 방법은 두 가지입니다.

- 본인 카드 안에서는 칩 색을 반전 (`background: rgba(255,255,255,0.2); color: #fff;`)
- 본인 카드 자체를 흰 배경으로 두고 테두리만 파란색으로 강조 (토스 카드 스타일에 더 가까움)

토스 컨셉에선 후자가 더 자연스러워요. 토스 앱에서 강조 카드는 보통 흰 배경에 파란 보더 + 작은 파란 라벨로 표현합니다.

---

## 8. 역할 칩(`.frontend`)이 항상 같은 색입니다

```jsx
<span className={styles["frontend"]}>{member.role}</span>
```

Backend, Design 멤버도 `.frontend` 클래스가 붙어서 모두 같은 파란 칩으로 표시됩니다. 클래스명도 의미상 맞지 않고(역할이 Backend인데 클래스명이 frontend), 시각적 구분도 안 됩니다.

```jsx
<span className={styles[`role-${member.role.toLowerCase()}`]}>
  {member.role}
</span>
```

```css
.role-frontend {
  background: #e8f3ff;
  color: #3182f6;
}
.role-backend {
  background: #e8fff0;
  color: #16a34a;
}
.role-design {
  background: #fff4e8;
  color: #f97316;
}
```

이렇게 하면 사이드바 통계 카드의 의미와도 시각적으로 연결됩니다.

---

## 9. 에러 메시지에 콜론만 남는 경우가 있습니다

```jsx
{fetchStatus === "error" && (
  <div>
    <p className={styles["statusError"]}>
      불러오기 실패 :
      {statusMessage}
    </p>
```

`statusMessage`가 빈 문자열일 때 "불러오기 실패 :" 콜론만 덩그러니 남아요. fetchRandomUsers의 catch 분기 중 `error.name !== "AbortError"`이면서 timedOut도 false인 경우 statusMessage가 설정되지 않습니다. 기본 문구를 정해두거나 콜론을 statusMessage가 있을 때만 출력하도록 바꿔주세요.

```jsx
<p className={styles["statusError"]}>
  불러오기 실패{statusMessage ? ` : ${statusMessage}` : ""}
</p>
```

---

## 정리

1. **동작 버그 먼저 잡기** — 함수명/타이틀 (1번), `scr` 오타 (2번), 상세 카드 중복 렌더링 (3번), `fillRandomData` 이중 fetch + 5초 대기 (4번), `background-color`에 그라데이션 (5번)
2. **토스 컨셉 강화** — Pretendard 폰트 (6번), 본인 카드 + 칩 가독성 (7번), 역할별 색 분기 (8번, 10번)
3. **UX 다듬기** — 에러 메시지 콜론 처리 (9번)
