# 5주차 도은 UI 디자인 리뷰

## 디자인

- 파란색 때문에 뭔가 토스 같긴합니다.

## 1. Pretendard 폰트가 실제로 로드되지 않습니다

```
.week-page {
  font-family: "Pretendard", sans-serif;
}
```

- `font-family`에 `Pretendard`를 적어두긴 했지만, 프로젝트 어디에서도 폰트를 실제로 import하지 않습니다.
- 사용자 OS에 Pretendard가 깔려있지 않으면 `sans-serif` 폴백으로 표시되어 토스 특유의 깔끔한 글자 톤이 안 나옵니다.

### 해결 - CDN으로 import

`src/styles/globals.css` (또는 비슷한 전역 css) 최상단에 다음을 추가해주세요.

```
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");
```

또는 npm 패키지로 설치해도 됩니다.

```
npm install pretendard
```

그리고 `main.jsx`에 이렇게 import 해주세요.

```
import "pretendard/dist/web/static/pretendard.css";
```

폰트가 적용되면 토스 느낌이 확 살아납니다.

## 2. `.week4CardGrid`가 두 번 정의되어 있습니다

```
.week4CardGrid { /* line 118 - 첫 번째 */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
}

...

.week4CardGrid { /* line 400 - 두 번째 */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}
```

- 같은 클래스가 두 번 선언되면 나중에 정의한 게 이깁니다. 결과적으로 데스크탑에서는 `auto-fill` 대신 항상 3열로 고정됩니다.
- 의도가 무엇인지 모호합니다. `auto-fill` 반응형을 살릴지, 3열 고정을 선택할지 정해야 합니다.

### 해결 - 둘 중 하나만 남기기

토스의 카드는 보통 모바일/태블릿/데스크탑 모두 비율 좋게 펼쳐지는 `auto-fill` 또는 `auto-fit` 방식이 자연스럽습니다.

```
.week4CardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
}
/* 아래쪽 중복 .week4CardGrid는 삭제해주세요 */
```

## 5. 상태 메시지가 텍스트뿐입니다 - 토스는 아이콘/그래픽을 씁니다

```
{loading && <p className={styles.loadingText}>불러오는 중...</p>}
{!loading && !error && !success && <p className={styles.readyText}>준비완료</p>}
{success && !loading && <p className={styles.successText}>완료!</p>}
```

- 토스 앱의 로딩/완료/에러는 보통 그래픽으로 표현합니다 (체크 아이콘, spinner, 작은 일러스트).
- 텍스트만 있으니 단조롭고 "디자인이 매우 이쁘다"는 인상이 덜 합니다.

### 해결 - spinner와 체크 아이콘 추가

CSS로 간단한 spinner를 만들어보세요.

```
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e5e8eb;
  border-top-color: #3182f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

```
{loading && (
  <p className={styles.loadingText}>
    <span className={styles.spinner} />
    불러오는 중...
  </p>
)}
```

체크 아이콘은 SVG로 그려주세요 (이모지 대신).

```
{success && (
  <p className={styles.successText}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8L7 12L13 4" stroke="#3182f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    완료!
  </p>
)}
```

## 6. 모바일 모달이 전체 화면입니다 - 토스는 보통 bottom sheet를 씁니다

```
@media (max-width: 767px) {
  .bigModal {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    padding: 20px;
  }
}
```

- 모바일에서 모달을 전체 화면으로 띄우고 있습니다. 안드로이드 dialog 또는 iPhone의 모달과 비슷한 형태입니다. 토스 앱은 대부분 **bottom sheet** 패턴을 씁니다 (하단에서 올라오는 시트 + 상단 둥근 모서리).

### 해결 - bottom sheet 패턴 적용

```
@media (max-width: 767px) {
  .modalOverlay {
    align-items: flex-end;    /* 하단 정렬 */
  }

  .bigModal {
    width: 100%;
    max-height: 85vh;
    border-radius: 24px 24px 0 0;   /* 상단만 둥글게 */
    padding: 24px 20px;
    animation: slideUp 0.3s ease;
  }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

상단에 회색 drag handle도 추가하면 토스 느낌이 더 살아납니다.

```
.bigModal::before {
  content: "";
  display: block;
  width: 40px;
  height: 4px;
  background: #d1d6db;
  border-radius: 2px;
  margin: 0 auto 16px;
}
```

## 7. 상세 모달의 닫기 버튼이 하단에 있습니다

```
<button onClick={() => setSelectedMember(null)} className={styles.closeBtn}>
  닫기
</button>
```

- 토스/iPhone은 보통 닫기 X 버튼을 우측 상단(또는 좌측 상단)에 둡니다. 하단의 "닫기" 텍스트 버튼은 안드로이드 다이얼로그 컨벤션에 가깝습니다.

### 해결 - 우측 상단 X 아이콘

```
<div className={styles.profileModal}>
  <button className={styles.modalClose} onClick={() => setSelectedMember(null)} aria-label="닫기">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M6 6L18 18M6 18L18 6" stroke="#191f28" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </button>
  ...
</div>
```

```
.profileModal {
  position: relative;
}

.modalClose {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #f2f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modalClose:hover {
  background: #e5e8eb;
}
```

## 8. ESC 키로 모달을 닫는 기능이 없습니다

- 모달이 열려도 ESC로 닫을 수 없습니다. 데스크탑 사용자의 키보드 접근성이 빠져 있습니다.

### 해결

```
useEffect(() => {
  if (!showForm && !selectedMember) return;
  const onEsc = (e) => {
    if (e.key === "Escape") {
      setShowForm(false);
      setSelectedMember(null);
    }
  };
  window.addEventListener("keydown", onEsc);
  return () => window.removeEventListener("keydown", onEsc);
}, [showForm, selectedMember]);
```

## 9. 폼 입력 검증 피드백이 없습니다

- HTML `required`로만 막아주고, 실패 시 화면에 메시지를 안 보여줍니다.
- 토스 폼은 입력 직후에 부드러운 빨간 메시지가 뜨고 input border 색상도 같이 바뀝니다.

### 해결 - 입력 직후 검증 메시지 노출

```
const [errors, setErrors] = useState({});

const validateField = (name, value) => {
  if (name === "email" && value && !value.includes("@")) {
    return "올바른 이메일 형식이 아닙니다";
  }
  if (name === "phone" && value && !/^010-\d{3,4}-\d{4}$/.test(value)) {
    return "010-1234-5678 형식으로 입력해주세요";
  }
  return "";
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
  setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
};
```

```
<input
  name="email"
  value={formData.email}
  onChange={handleInputChange}
  className={errors.email ? styles.inputError : ""}
  required
/>
{errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
```

```
.inputError {
  background: #fef2f2 !important;
  box-shadow: 0 0 0 2px #fecaca !important;
}

.errorMsg {
  color: #ef4444;
  font-size: 13px;
  margin-top: 4px;
}
```

## 10. success 상태 자동 reset이 없습니다

```
} finally {
  setLoading(false);
}
// success는 다음 액션 전까지 영구 표시됩니다
```

- "완료!" 메시지가 다음 액션 전까지 떠 있습니다. 토스는 보통 1~2초 후에 자연스럽게 사라집니다.

### 해결 - setTimeout으로 자동 reset (cleanup 포함)

```
const successTimerRef = useRef(null);

useEffect(() => {
  if (success) {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccess(false), 1500);
  }
  return () => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
  };
}, [success]);
```

## 11. 빈 상태 메시지가 단조롭습니다

```
<p className={styles.emptyMessage}>등록된 아기 사자가 없습니다.</p>
```

- 빈 상태는 보통 일러스트와 함께 다음 액션을 유도하는 버튼이 같이 나옵니다.

### 해결 - 안내 메시지 + 액션 버튼

```
<div className={styles.emptyState}>
  <div className={styles.emptyIcon}>
    <svg ...>...</svg>
  </div>
  <p className={styles.emptyTitle}>아직 등록된 아기 사자가 없어요</p>
  <p className={styles.emptyDesc}>첫 번째 멤버를 추가해보세요</p>
  <button className={styles.emptyAction} onClick={() => setShowForm(true)}>
    아기 사자 추가하기
  </button>
</div>
```

```
.emptyState {
  text-align: center;
  padding: 80px 20px;
}

.emptyTitle {
  font-size: 18px;
  font-weight: 700;
  color: #191f28;
  margin-bottom: 8px;
}

.emptyDesc {
  color: #6b7684;
  margin-bottom: 24px;
}

.emptyAction {
  background: #3182f6;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}
```

## 12. 컴포넌트 측 코드 정리

- `import React, { useState }`는 React 17+에서는 `React` import가 불필요합니다. `import { useState }`만으로 충분합니다.
- `Date.now() + idx`로 id를 생성하면 동시 호출 시 충돌이 날 수 있습니다. useRef 카운터로 통일하는 게 좋습니다.
- AbortController/타임아웃/lastFetchActionRef 등 4주차 review 항목들이 추가된 fetch에는 적용되어 있지 않습니다.

이 부분은 4주차 review에서 다룬 내용이라 여기서는 짧게만 언급하고 넘어가겠습니다.

## 정리

1. **폰트 실제 import** (가장 임팩트가 큽니다 - 시각적 인상이 즉시 올라갑니다)
2. **모바일 bottom sheet** (모바일에서 토스 느낌이 확 살아납니다)
3. **모달 닫기 X 우측 상단 + ESC 닫기** (사용성이 좋아집니다)
4. **상태에 아이콘/spinner 추가** (단조로운 인상을 해소합니다)
5. **빈 상태에 안내 + 액션 버튼** (디테일까지 챙기는 인상을 줍니다)
