# 4주차 나함 과제 리뷰

3주차에는 HTML/JS로 작성하셨던 부분을 4주차에서는 React 컴포넌트로 잘 변환하셨습니다.
useState, useEffect, 조건부 렌더링, FormData, 이미지 import, fetch + async/await 등
3주차 review.md/study.md에서 안내드렸던 React 패턴을 대부분 잘 적용하셨습니다.

특히 모달 패턴(backdrop 클릭 + e.stopPropagation + ESC 닫기)과 로딩 상태 관리,
버튼 disabled 처리 등은 깔끔하게 구현되어 있습니다.

다만 아직 다음과 같은 부분들이 아쉬워서 개선 포인트로 정리합니다.

## 1. 인라인 style 남용 - CSS Modules로 분리 필요

```
{isLoading && (
  <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold' }}>
    외부 서버에서 데이터를 가져오는 중입니다...
  </div>
)}

<button onClick={() => fetchExternalData(1)} disabled={isLoading} style={{ backgroundColor: '#ff7710', color: 'white', marginLeft: '10px' }}>
  랜덤 1명 불러오기 (서버)
</button>

<select style={{ marginLeft: "auto", padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}>
```

- `Page.module.css`를 만들어둔 의미가 약해집니다.
- 같은 색/여백을 여러 곳에서 반복 작성하면 디자인 일관성 유지가 어렵습니다.
- CSS Modules 파일에 클래스를 만들어 `className={styles.loadingBanner}` 형태로 분리하세요.

```
/* Page.module.css */
.loadingBanner {
  text-align: center;
  padding: 15px;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
}

.fetchBtn {
  background-color: #ff7710;
  color: white;
  margin-left: 10px;
}

.filterSelect {
  margin-left: auto;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
```

## 2. key에 index 사용 - 안티패턴

```
{filteredLions.map((lion, index) => (
  <div
    key={`${lion.name}-${index}`}
    ...
  >
))}
```

- `name + index` 조합은 정렬·필터·삭제 시 key가 변경되어 React가 컴포넌트를 잘못 재사용할 수 있습니다.
- 데이터에 고유 id를 부여하세요. initialLions에 id를 추가하고, 새로 추가될 때마다 `useRef`로 카운터를 관리하면 좋습니다.

```
const nextIdRef = useRef(initialLions.length + 1);

function makeNextId() {
  const id = nextIdRef.current;
  nextIdRef.current += 1;
  return id;
}

// 추가 시
const newLion = { id: makeNextId(), ... };

// 렌더링
{filteredLions.map((lion) => (
  <div key={lion.id} ...>
))}
```

## 3. 타임아웃 없음

- 서버 응답이 30초 걸리면 사용자는 그동안 계속 로딩 표시만 보게 됩니다.
- `setTimeout`으로 일정 시간이 지나면 `controller.abort()`를 호출해 강제 종료하고 "시간 초과" 에러 메시지를 보여주는 패턴이 안전합니다.

```
const TIMEOUT_MS = 5000;

const timeoutId = setTimeout(() => {
  controller.abort();
}, TIMEOUT_MS);

try {
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  ...
} catch (err) {
  if (err.name === "AbortError") {
    setErrorMessage("불러오기 실패: 시간 초과");
  }
}
```

## 4. 에러 처리를 alert로만

```
catch (error) {
  alert("데이터를 불러오는 중 에러가 발생했습니다: " + error.message);
}
```

- `alert`는 브라우저 차단 UI라 사용자 경험이 좋지 않고, 사파리/모바일에서는 막혀 있기도 합니다.
- 에러 메시지를 state로 저장해 화면 안에 띄우고, "재시도" 버튼도 함께 제공해보세요.

```
const [errorMessage, setErrorMessage] = useState("");
const lastFetchActionRef = useRef(null);

// 에러 발생 시
setErrorMessage("불러오기 실패: " + err.message);

// UI에 표시
{errorMessage && (
  <div className={styles.errorBanner}>
    {errorMessage}
    <button onClick={() => lastFetchActionRef.current?.()}>재시도</button>
  </div>
)}
```

## 5. 추가된 사자에 id 필드가 없음

```
const newLion = {
  name: fd.get("name"),
  part: fd.get("part"),
  ...
  image: `https://picsum.photos/seed/${Date.now()}/200/200`,
};
```

- id 필드를 안 만들기 때문에 key를 `name + index`로 만드는 문제(2번 항목)와 연결됩니다.
- `picsum.photos/seed/${Date.now()}` 도 한 번 정해진 이미지가 새로고침마다 바뀌면 안 되는 케이스라면 seed에 안정적인 값(id 등)을 넣는 게 좋습니다.

## 6. 입력값 trim 처리 없음

```
const newLion = {
  name: fd.get("name"),
  part: fd.get("part"),
  ...
};
```

- 사용자가 공백만 입력하거나 앞뒤 공백이 섞이면 그대로 저장됩니다.
- `String(fd.get("name") || "").trim()` 패턴으로 안전하게 처리하고, 빈 문자열이면 추가를 막는 검증도 함께 두는 게 좋습니다.

## 7. 컴포넌트 안에 데이터/이미지 import 모두 작성

- `initialLions` 배열이 70줄 가까이 차지해 Page.jsx의 가독성이 떨어집니다.
- `lions.js` 같은 파일로 분리하고 이미지 import도 그쪽에서 처리하면 컴포넌트 본문이 한눈에 들어옵니다.

```
// lions.js
import nhProfile from "./nhprofile.png";
...
export const initialLions = [ ... ];

// Page.jsx
import { initialLions } from "./lions";
```

## 8. 모달 폼에서 폼 검증/취소 후 처리

```
<button type="button" onClick={() => setShowModal(false)}>취소</button>
```

- 취소 후 form.reset()이 호출되지 않아 다음 번에 모달을 열면 이전 입력값이 남아있을 수 있습니다.
- 또한 모달을 열 때 첫 번째 입력 필드로 포커스를 옮기면 키보드 사용성이 좋아집니다.

```
const formRef = useRef(null);
const nameInputRef = useRef(null);

useEffect(() => {
  if (showModal) nameInputRef.current?.focus();
}, [showModal]);

const handleCancel = () => {
  formRef.current?.reset();
  setShowModal(false);
};
```

## 9. 체크리스트

- [v] HTML/JS → React 컴포넌트 변환
- [v] useState로 데이터 관리
- [v] 조건부 렌더링으로 모달 구현
- [v] 이미지 import 사용
- [v] FormData로 폼 값 추출
- [v] fetch + async/await + try/catch
- [v] 로딩 상태 표시, 버튼 disabled
- [ ] 인라인 style을 CSS Modules로 분리
- [ ] map key에 index 대신 고유 id 사용
- [ ] fetch 타임아웃 처리
- [ ] 에러를 alert 대신 화면 내 메시지 + 재시도 버튼
- [ ] 새 사자에도 id 필드 부여 (picsum seed도 고유값 사용)
- [ ] 사용자 입력 trim / 검증
- [ ] 데이터 파일 분리 (lions.js)
- [ ] 모달 cancel 시 form.reset, 열릴 때 포커스 이동

## 10. 핵심 학습 포인트

- React로의 마이그레이션은 잘 끝났으니, 다음 단계는 "외부와의 상호작용을 안전하게 다루는 것"입니다.
- fetch 작업은 항상 "오래 걸리면 어떻게 끊을지(타임아웃)"와 "실패하면 사용자가 어떻게 다시 시도할지(에러 + 재시도)"를 함께 설계하세요.
- 인라인 style은 임시 디버깅 용도로만 쓰고, 디자인이 정해지면 CSS Modules로 옮기는 습관을 들이세요.
- 같은 폴더의 study.md에 비동기 패턴(timeout, error+retry, 데이터 파일 분리, 모달 포커스 관리)을 정리해두었으니 참고하세요.
