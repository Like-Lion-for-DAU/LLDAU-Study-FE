# 2주차 도은 과제 리뷰

## 1. CSS modules 사용시 주의 사항

### 1-a. CSS 2개 적용하고 싶을때

```
<div className={styles["week2-summary-card my-card"]}>
```

- CSS modules에선 week2-summary-card my-card처럼 2개의 클래스를 읽을 수 없습니다.

```
<div className={`${styles["week2-summary-card"]} ${styles["my-card"]}`}>
```

이런식으로 쓰거나 하나의 셀렉터에 css를 다 주입해야합니다.

### 1-b. CSS modules 표기법

- CSS modules에선 "week2-summary-card" 처럼 "-"를 사용할 경우 빼기 연산으로 해석합니다.

- 따라서 camelCase로 명명 하는 것을 추천합니다. "week2SummaryCard"

- camelCase == 첫 번째 글자 소문자, 띄어쓰기 기준으로 대문자

## 2. 빈 이미지 url은 깨진 이미지 표시 됨

```
<img src="" alt="김나함" />
<img src="" alt="정소민" />
```

- 빈 url을 img태그에 넣을 경우 액스박스가 떠서 보기 안 예쁩니다.

```
<img
  src={member.image || "/default-profile.png"}
  alt={member.name}
  className={styles.cardImage}
/>
```

- 이런식으로 기본 이미지를 쓰시는 것이 좋아요.

## 3. 하드코딩 데이터

- 똑같은 코드가 반복되어 나타납니다.
- js파일에 member들의 정보를 모아놓고 Page.jsx에서 import 하는 방식으로 사용할 수 있습니다.
- Page.jsx에서 map함수를 활용하여 코드를 간결하게 유지할 수 있습니다.

### 3-a. 중복되는 부분

```
<div className={styles["week2-summary-card my-card"]}>
    <div className={styles["week2-card-image-wrap"]}>
        <img src="https://i.pinimg.com/originals/4f/6a/e8/4f6ae87f63609f8d7f1f38b3617cbe1c.jpg" alt="이도은" className={styles["week2-card-image"]} />
        <span className={styles["week2-card-badge"]}>HTML / CSS</span>
        <span className={styles["week2-my-badge"]}>나</span>
    </div>
    <div className={styles["week2-card-body"]}>
        <h3 className={styles["week2-card-name"]}>이도은</h3>
        <p className={styles["week2-card-part"]}>Frontend</p>
        <p className={styles["week2-card-intro"]}>열심히 배우는 프론트엔드 개발자입니다!</p>
    </div>
</div>
```

### 3-b. 수정 방법

#### 1. member.js 생성

```
export const members = [
 {
   name: "이도은",
   part: "Frontend",
   intro: "열심히 배우는 프론트엔드 개발자입니다!",
   image: "https://i.pinimg.com/originals/4f/6a/e8/4f6ae87f63609f8d7f1f38b3617cbe1c.jpg",
   tech: "HTML / CSS",
   isMe: true,
 },
 {
   name: "김주완",
   part: "Frontend",
   intro: "성실히 배우고 싶은 학생입니다.",
   image: "https://i.namu.wiki/i/eThT8CYFzrGi-QEREijNJdiceYKYXYjArupDY07S2Gxlo0CZDO2cQyWWnDXHfqemvizFtSh0SRScxaIpKR-xZA.gif",
   tech: "HTML / CSS",
 },
 // 다른 사람 추가하기
];
```

#### 2. Page.jsx

```
import { useState } from "react";
import styles from "./Page.module.css";
import { members } from "./members";

function MemberCard({ member }) {
  const [imgError, setImgError] = useState(false);
  const showImage = member.image && !imgError;

  return (
    <div
      className={`${styles.week2SummaryCard} ${
        member.isMe ? styles.myCard : ""
      }`}
    >
      <div className={styles.week2CardImageWrap}>
        {showImage ? (
          <img
            src={member.image}
            alt={member.name}
            className={styles.week2CardImage}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.week2CardImagePlaceholder}>
            {member.name.charAt(0)}
          </div>
        )}
        <span className={styles.week2CardBadge}>{member.tech}</span>
        {member.isMe && <span className={styles.week2MyBadge}>나</span>}
      </div>
      <div className={styles.week2CardBody}>
        <h3 className={styles.week2CardName}>{member.name}</h3>
        <p className={styles.week2CardPart}>{member.part}</p>
        <p className={styles.week2CardIntro}>{member.intro}</p>
      </div>
    </div>
  );
}

export default function Week2Page() {
  return (
    <div className={styles.weekPage}>
      <div className={styles.week2CardGrid}>
        {members.map((member) => (
          <MemberCard key={member.name} member={member} />
        ))}
      </div>
    </div>
  );
}
```

#### 3. Page.module.css

```
.weekPage {
  padding: 32px;
}

.weekPage h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

/* 데스크톱: 3열 */
.week2CardGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* 태블릿: 2열 */
@media (max-width: 900px) {
  .week2CardGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 모바일: 1열 */
@media (max-width: 560px) {
  .week2CardGrid {
    grid-template-columns: 1fr;
  }
}

/* ===== 요약 카드 ===== */
.week2SummaryCard {
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1.5px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.myCard {
  border: 2.5px solid #1152bb;
}

/* 카드 이미지 */
.week2CardImageWrap {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.week2CardImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 이미지 없을 때 placeholder */
.week2CardImagePlaceholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 700;
  color: #ffffff;
  background-image: #374151;
}

/* 기술 배지 - 이미지 우측 상단 오버레이 */
.week2CardBadge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.92);
  color: #374151;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

/* "나" 배지 - 좌측 상단 */
.week2MyBadge {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #1152bb;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

/* 카드 텍스트 */
.week2CardBody {
  padding: 14px 16px 16px;
}

.week2CardName {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #111827;
}

.week2CardPart {
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 6px;
  color: #3060c6;
}

.week2CardIntro {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}
```

## 4. 디자인 토큰 사용

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
