# 5주차 서윤 코드 개선 과제 리뷰

1~4주차 리뷰/study에서 지적한 개선사항을 4주차 컴포넌트에 적용한 결과물 기준으로,
런타임 영향이 있거나 미완 상태인 부분만 정리합니다.

남은 부분은 일관성과 코드 정리 위주입니다.

## 1. handleFillRandom의 catch에서 alert 사용

```
} catch (err) {
  clearTimeout(timeoutId);

  if (err?.name === "AbortError" && timedOut) {
    alert("랜덤 값 채우기 실패: 시간 초과");
  } else if (err?.name !== "AbortError") {
    alert(`랜덤 값 채우기 실패: ${err?.message}`);
  }
} finally {
  setIsFilling(false);
}
```

- 다른 fetch는 `setErrorMessage` + 화면 내 표시인데 `handleFillRandom`만 `alert`를 사용합니다.
- alert는 모바일/사파리에서 차단될 수 있고 UX가 좋지 않음. 일관성을 맞춰 화면 내 메시지로 통일.

### 해결

- 폼 안 fetch 전용 에러 state 추가

```
const [fillError, setFillError] = useState("");

const handleFillRandom = async () => {
  if (isFilling) return;
  setIsFilling(true);
  setFillError("");

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const users = await fetchRandomUsers(1, controller.signal);
    clearTimeout(timeoutId);
    ...
    setFormData({ ... });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError" && timedOut) {
      setFillError("랜덤 값 채우기 실패: 시간 초과");
    } else if (err?.name !== "AbortError") {
      setFillError(`랜덤 값 채우기 실패: ${err?.message || "알 수 없는 오류"}`);
    }
  } finally {
    setIsFilling(false);
  }
};

// 폼 안에 표시
<button onClick={handleFillRandom} disabled={isFilling}>
  {isFilling ? "불러오는 중..." : "랜덤 값 채우기"}
</button>
{fillError && <span className={styles["fill-error"]}>{fillError}</span>}
```

## 2. handleFillRandom의 controller가 cleanup에 등록 안 됨

```
const handleFillRandom = async () => {
  ...
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  ...
};

// useEffect cleanup
useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    if (latestControllerRef.current) latestControllerRef.current.abort();
    // handleFillRandom의 controller는 정리 안 됨
  };
}, []);
```

- 사용자가 "랜덤 값 채우기" 진행 중에 페이지를 떠나면 fetch가 남아있고, 응답 도착 시 unmounted setState 경고 발생.

### 해결 - fillControllerRef로 분리

```
const fillControllerRef = useRef(null);

const handleFillRandom = async () => {
  if (isFilling) return;

  // 이전 fill 요청 취소
  if (fillControllerRef.current) fillControllerRef.current.abort();
  const controller = new AbortController();
  fillControllerRef.current = controller;

  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  setIsFilling(true);
  setFillError("");

  try {
    const users = await fetchRandomUsers(1, controller.signal);
    ...
  } catch (err) { ... }
  finally {
    clearTimeout(timeoutId);
    setIsFilling(false);
  }
};

// cleanup에 추가
useEffect(() => {
  return () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    if (latestControllerRef.current) latestControllerRef.current.abort();
    if (fillControllerRef.current) fillControllerRef.current.abort();   // 추가
  };
}, []);
```

## 5. 주석 밀도가 너무 높음 - 코드보다 주석이 더 많음

```
//react 훅 임포트
//useEffect 사이드 이펙트 처리
//useRef 리렌더링엉ㅂ시 값/DOM 보관하는 ref객체 생성
//useState 컴포넌트 상태 선언 관리
import { useEffect, useRef, useState } from "react";
import styles from "./Page.module.css"; //css 모듈 임포트
import {
  initialMembers,
  PARTS,
  SKILLS_BY_PART,
  ABOUT_PRESETS,
  QUOTE_PRESETS,
  DEFAULT_IMAGES,
} from "./lions"; //필요한 상수랑 데이터

const TIMEOUT_MS = 5000; //fetch 요청에 적용할 타임아웃 시간,이 시간안에 응답없으면 abortController로 요청 취소

//배열에서 무작위 요소 하나를 반환하는 함수
//0이상 1미만 난수 생성후 배열 길이 범위로 스케일업해서 소수점 버리고 유요한 정수 확보함
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
```

- 본인 학습용 메모로는 좋은 패턴이지만, 코드 리뷰나 협업 관점에서는 잡음이 많음.
- 좋은 주석 가이드:
  - "WHAT"(이 코드가 무엇을 하는지)은 변수명/함수명으로 자명하게 만들고 주석을 줄임
  - "WHY"(왜 이렇게 했는지) 또는 비자명한 동작만 주석으로 남김

## 6. 커밋 메시지를 컨벤션에 맞추기

```
bb08745 t                              // 의미 없는 한 글자
bb33fdd 이미지 onErrorFallBack         // prefix 없음
7784bbb fetch,abortcontrol,타임아웃재시도   // prefix 없음, 너무 함축적
01fd072 필터 정렬 추가 및 개선         // prefix 없음
0aad84d Update Page.jsx               // GitHub 기본 메시지, 정보 없음
df20dce 추가 삭제 버튼                 // prefix 없음
930c591 기본 렌더링완료                // prefix 없음
```

- 협업 환경에서는 커밋 메시지를 컨벤션에 맞추는 게 중요합니다. 어떤 종류의 변경인지, 무엇을 했는지 한눈에 알 수 있도록.

- `feat:` 새 기능 추가
- `fix:` 버그 수정
- `docs:` 문서/주석 변경
- `style:` 코드 포맷팅, 세미콜론 누락 등 (동작 변경 없음)
- `refactor:` 리팩토링 (동작은 같지만 구조 개선)
- `test:` 테스트 추가/수정
- `chore:` 빌드 도구, 패키지 매니저 설정 등

기존 커밋을 컨벤션으로 다시 쓴 예시:

```
bb08745 t                              -> chore: 임시 커밋 (이런 커밋은 anymore squash)
bb33fdd 이미지 onErrorFallBack         -> feat: 이미지 로드 실패 시 onError fallback 추가
7784bbb fetch,abortcontrol,타임아웃재시도   -> feat: AbortController + 타임아웃 + 재시도 로직 추가
01fd072 필터 정렬 추가 및 개선         -> feat: 파트 필터/정렬/검색 기능 추가
0aad84d Update Page.jsx               -> refactor: Page.jsx 구조 정리 (실제로 무엇을 했는지 적기)
df20dce 추가 삭제 버튼                 -> feat: 멤버 추가/삭제 버튼 구현
930c591 기본 렌더링완료                -> feat: 4주차 초기 렌더링 구현
```

### 좋은 커밋 메시지의 기준

- 한 커밋은 한 가지 논리적 변경만 담기 (여러 기능을 한 커밋에 섞지 않기)
- 제목은 50자 이내, 명령형으로 ("추가하다" 형태)
- 무엇을(WHAT), 왜(WHY)가 메시지에 드러나야 함
- "t", "임시", "수정" 같은 모호한 메시지는 피하기
- WIP/임시 커밋은 작업 끝나면 `git rebase -i`로 squash하거나 메시지를 다듬어서 마무리
