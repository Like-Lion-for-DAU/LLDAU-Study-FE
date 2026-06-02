# 6주차 주완 UI 디자인 리뷰

## 디자인 컨셉

레트로 데스크탑 OS 스타일입니다.

## 1. 본인 카드와 일반 카드의 타이틀 바 시각 구분이 약합니다

```css
.card::before {
  content: "MEMBER.EXE";
  background: linear-gradient(to right, #000080, #1084d0);
}

.mainCard::before {
  content: "MY_PROFILE.EXE";
  background: linear-gradient(to right, #000080, #1084d0);
}
```

본인 카드(`.mainCard`)와 일반 카드(`.card`)의 타이틀 바 그라데이션 색이 완전히 같습니다. 차이는 outline 보더 색(`ffffcc/000080` vs `ffffff/808080`)과 .EXE 이름뿐인데, 보더 색 차이는 미세해서 멀리서는 안 보입니다.

Win9x 환경에서 "활성 창(active window)"은 진한 파란 타이틀 바, "비활성 창(inactive window)"은 회색 타이틀 바로 명확히 구별됩니다. 본인 카드 = 활성 창 패턴을 차용하면 시각 구분이 한 번에 살아납니다.

### 해결 — 본인 카드는 활성 창 색, 다른 멤버는 비활성 창 색

```css
.card::before {
  content: "MEMBER.EXE";
  background: linear-gradient(
    to right,
    #808080,
    #b5b5b5
  ); /* 비활성 회색 그라데이션 */
  color: #ffffff;
}

.mainCard::before {
  content: "MY_PROFILE.EXE";
  background: linear-gradient(
    to right,
    #000080,
    #1084d0
  ); /* 활성 네이비 그라데이션 */
}
```

또는 본인 카드만 더 강한 컬러 액센트(예: Win98의 "선택된 항목" 색인 `#0a246a`)로 처리할 수도 있습니다.

## 2. `disabled` 버튼의 시각 처리가 단순합니다

```css
.button:disabled {
  color: #808080;
  cursor: not-allowed;
}
```

Win9x의 disabled 버튼은 글자에 1px 흰색 그림자를 추가해서 "흐릿하게 음각된" 느낌을 줍니다. 텍스트가 베벨에 새겨진 듯한 효과인데, 단순히 회색만 적용하면 그 느낌이 안 납니다.

### 해결 — text-shadow로 음각 효과

```css
.button:disabled {
  color: #808080;
  text-shadow: 1px 1px 0 #ffffff;
  cursor: not-allowed;
}
```

이 한 줄로 Win9x disabled의 시그니처 느낌이 살아납니다.

## 3. fillError 시 errorMsg 위치가 form 내 버튼 옆이라 어색할 수 있습니다

```jsx
<div className={styles.formButtons}>
  <button ... disabled={isFilling} onClick={fillRandomForm}>...</button>
  {fillError && <span className={styles.errorMsg}>{fillError}</span>}
  <button type="submit">추가하기</button>
  ...
</div>
```

`formButtons`는 `justify-content: flex-end`라 오른쪽 정렬됩니다. fillError가 길면 버튼들과 같은 줄에 끼어서 레이아웃이 좁아 보일 수 있습니다.

### 해결 — fillError를 form 상단 또는 별도 줄에 배치

```jsx
<form className={styles.formBox} onSubmit={handleSubmit}>
  {fillError && (
    <div className={styles.fillErrorRow}>
      <span className={styles.errorMsg}>{fillError}</span>
    </div>
  )}
  <input ... />
  ...
</form>
```

또는 Win98 다이얼로그 박스 스타일로 별도 alert box를 띄우는 것도 컨셉에 맞습니다.

## 4. 카드 클릭 시 상세로 가는 인터랙션이 없습니다

현재는 모든 카드의 요약과 상세가 동시에 페이지에 펼쳐져 있습니다. 멤버가 많아지면 페이지가 매우 길어집니다.

### 해결 - 옵션

- 카드를 클릭하면 해당 상세 카드로 스크롤 + 잠깐 강조 (소민, 도영 처리 패턴)
- 카드를 클릭하면 Win98 다이얼로그 형태로 상세를 모달로 띄우기 (컨셉상 더 자연스러움)

## 정리

1. **본인 카드와 일반 카드 시각 구분 강화** — 타이틀 바 색 분리 (활성 vs 비활성 패턴) (1번)
2. **`disabled` 버튼 음각 효과 추가** — `text-shadow`로 Win9x 시그니처 느낌 살리기 (2번)
3. **fillError 위치 분리** — 버튼 옆이 아닌 form 상단 또는 별도 줄 (3번)
4. **카드 클릭 → 상세 인터랙션 추가** — 스크롤 + 강조 또는 Win98 다이얼로그 모달 (4번)
