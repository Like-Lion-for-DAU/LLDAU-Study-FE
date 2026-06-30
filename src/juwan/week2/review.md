# 2주차 주완 과제 리뷰

## 1. CSS modules 사용시 주의 사항

### 1-a. CSS modules 표기법

- CSS modules에선 "main-card" 처럼 "-"를 사용할 경우 빼기 연산으로 해석합니다.

- 따라서 camelCase로 명명 하는 것을 추천합니다. "mainCard"

- camelCase == 첫 번째 글자 소문자, 띄어쓰기 기준으로 대문자

```
<div className={styles.mainCard}>
```

- camelCase로 쓴다면 이렇게 css를 불러올 수 있습니다

### 1-b. CSS 2개 적용하고 싶을때

```
<div className={styles["card main-card"]}>
```

- CSS modules에선 "card main-card"처럼 2개의 클래스를 읽을 수 없습니다.

```
<div className={`${styles["card"]} ${styles["main-card"]}`}>
```

이런식으로 쓰거나 하나의 셀렉터에 css를 다 주입해야합니다.

## 2. 디자인 토큰 사용

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

## 3. 잘못된 margin값

```
.role {
  margin: 0 5 12px;
}
```

- 단위가 없는 5는 인식하지 못해요.

```
.role {
  margin: 0 5 12px;
}
```

- 0을 제외한 모든 숫자는 단위가 있어야합니다.

## 4. map 활용

```
<div className={styles["card main-card"]}>
    <img src={catimg} alt="이미지"/>
    <span className={styles["badge"]}>React</span>
    <div className={styles["card-content"]}>
        <h3>김주완</h3>
        <p className={styles["role"]}>Frontend</p>
        <p className={styles["introduce"]}>열심히 배우는 프론트엔드 개발자 입니다.</p>
    </div>
</div>
```

- 코드 반복 됨
- 데이터 파일을 분리하고 map활용하면 코드 압축 가능

### 4-a. member.js 분리

- src/juwan/week2/members.js

```
import catimg from "./cat.gif";
import flower1 from "./flower1.jpg";
import window1 from "./window.jpg";

export const members = [
  {
    name: "김주완",
    role: "Frontend",
    intro: "열심히 배우는 프론트엔드 개발자 입니다.",
    image: catimg,
    badge: "React",
    isMe: true,
  },
  {
    name: "김아기사자",
    role: "Backend",
    intro: "안정적인 서버 구조에 관심이 많습니다.",
    image: flower1,
    badge: "Spring",
  },
  {
    name: "박아기사자",
    role: "Frontend",
    intro: "구조적인 UI를 고민하는 프론트엔드 개발자입니다.",
    image: window1,
    badge: "React",
  },
  {
    name: "이아기사자",
    role: "Frontend",
    intro: "구조적인 UI를 고민하는 프론트엔드 개발자입니다.",
    image: flower1,
    badge: "React",
  },
  {
    name: "최아기사자",
    role: "Frontend",
    intro: "구조적인 UI를 고민하는 프론트엔드 개발자입니다.",
    image: flower1,
    badge: "React",
  },
  {
    name: "오아기사자",
    role: "Frontend",
    intro: "구조적인 UI를 고민하는 프론트엔드 개발자입니다.",
    image: flower1,
    badge: "React",
  },
  {
    name: "남궁아기사자",
    role: "Frontend",
    intro: "구조적인 UI를 고민하는 프론트엔드 개발자입니다.",
    image: flower1,
    badge: "React",
  },
  {
    name: "제갈아기사자",
    role: "Frontend",
    intro: "구조적인 UI를 고민하는 프론트엔드 개발자입니다.",
    image: flower1,
    badge: "React",
  },
];
```

### 4-b. map

- src/juwan/week2/Page.jsx

```
import styles from "./Page.module.css";
import { members } from "./members";

export default function Week2Page() {
  return (
    <div className={styles["week-page"]}>
      <div className={styles["card-container"]}>
        {members.map((m) => (
          <div
            key={m.name}
            className={`${styles["card"]} ${
              m.isMe ? styles["main-card"] : ""
            }`}
          >
            <img src={m.image} alt={`${m.name} 프로필`} />
            <span className={styles["badge"]}>{m.badge}</span>
            <div className={styles["card-content"]}>
              <h3>{m.name}</h3>
              <p className={styles["role"]}>{m.role}</p>
              <p className={styles["introduce"]}>{m.intro}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```
