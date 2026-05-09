# 2주차 태우 과제 리뷰

## 1. CSS modules 사용시 주의 사항

### 1-a. CSS modules 표기법

- CSS modules에선 "line_introduce" 처럼 "-"를 사용할 경우 빼기 연산으로 해석합니다.

- 따라서 camelCase로 명명 하는 것을 추천합니다. "lineIntroduce"

- camelCase == 첫 번째 글자 소문자, 띄어쓰기 기준으로 대문자

```
<div className={styles.lineIntroduce}>
```

- camelCase로 쓴다면 이렇게 css를 불러올 수 있습니다

## 2. 사용하지 않는 CSS class는 제거하기

```
.flex-container-column { ... }
.profile_infomation { ... }
.main_profil_pick { ... }
.sub_title { ... }
.mark_size { ... }
```

- 사용하지 않는 코드는 삭제해야합니다.

## 3. 디자인 토큰 사용

- src\styles\globals.css에 색상 전역 변수를 선언 해놓았습니다.

```
border: 2.5px solid #1152bb;
color: #3060c6;
color: #111827;
color: #6b7280;
```

```
border: 2.5px solid var(--color-primary);
color: var(--color-primary);
color: var(--color-text-primary);
color: var(--color-text-secondary);
```

- 이런 식으로 색상을 var(--color-아기사자-색상); 전역 변수로 사용할 수 있습니다.
