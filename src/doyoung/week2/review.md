# 2주차 도영 과제 리뷰

## 1. <br>태그 남용

- 줄 바꿈, 공백은 <br>태그로 조절하는 것이 아닌
- maring, padding, gap으로 조절해야합니다.

## 2. css background 속성

```
.week-page {
  background: #f1f2f6;
}

.card {
  background: white;
}
```

- 배경색을 지정하고 싶으면 background-color를 사용해야 합니다.
- ai쓸때 무조건 background하던데 혹시?

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

## 4. object-fit: cover + overflow: auto

```
.photo {
  width: 300px;
  height: 300px;
  object-fit: cover;
  overflow: auto;
}
```

- <img>태그에 자식이 없어서 overflow속성이 무의미하고
- object-fit: cover로 충분합니다.
- ai 사용하면 항상 두개 같이 쓰던데 혹시?

## 5. CSS modules 사용시 주의 사항

### 5-a. CSS modules 표기법

- CSS modules에선 "main-card" 처럼 "-"를 사용할 경우 빼기 연산으로 해석합니다.

- 따라서 camelCase로 명명 하는 것을 추천합니다. "mainCard"

- camelCase == 첫 번째 글자 소문자, 띄어쓰기 기준으로 대문자

```
<div className={styles.mainCard}>
```

- camelCase로 쓴다면 이렇게 css를 불러올 수 있습니다

### 5-b. CSS 2개 적용하고 싶을때

```
<div className={styles["card main-card"]}>
```

- CSS modules에선 "card main-card"처럼 2개의 클래스를 읽을 수 없습니다.

```
<div className={`${styles["card"]} ${styles["main-card"]}`}>
```

이런식으로 쓰거나 하나의 셀렉터에 css를 다 주입해야합니다.

## 6. 데이터 파일 분리 + map 함수 활용

### 6-a. 코드 중복

- 같은 양식의 코드가 중복되어 코드가 길어졌습니다.
- 이렇게 되면 유지보수 어렵습니다.

- 카드

```
<div className={styles["card"]}>
    <img src={jGif} alt="프로필 사진" className={styles["photo"]} />
    <h2>김주완</h2>
    <span className={styles["frontend"]}>Frontend</span>
    <p>성실히 배우고 싶은 학생입니다.</p>
</div>
```

- 상세정보

```
<div className={styles["detailcard"]}>
    <h2>김주완</h2>
    <span className={styles["frontend"]}>Frontend</span>
    <p className={styles["dsis"]}>동아리명 : 디스이즈</p>
    <p>LION TRACK</p>
    <br></br>
    <h3>자기소개</h3>
    <p>컴퓨터공학과 1학년입니다.
    <br/>웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.</p>
    <br></br>
    <h3>연락처</h3>
    <ul>
    <li>Email : mmnnbbnn070910@gmail.com</li>
    <li>Phone : 010-9041-1287</li>
    <li>link : <a href="https://likelion.net/" target="_blank">
    Likelion main page</a></li>
    </ul>
    <br></br>
    <h3>관심 기술</h3>
    <ul>
    <li>HTML/CSS</li>
    <li>JavaScript</li>
    <li>React(학습 중)</li>
    </ul>
    <br></br>
    <h3>한 마디</h3>
    <p>성실히 배워서 웹개발 마스터가 되고 싶습니다.</p>
</div>
```

### 6-b. 해결책

#### 1. 데이터 파일 분리

- src/doyoung/week2/members.js

```
import kjwGif from "../../assets/doyoung/week2/j.gif";
import idyJpg from "../../assets/doyoung/week2/idy.jpg";
import btwJpg from "../../assets/doyoung/week2/b.jpg";
import jsmPng from "../../assets/doyoung/week2/jsm.png";
import ideJpeg from "../../assets/doyoung/week2/i.jpeg";
import jsyPng from "../../assets/doyoung/week2/jsy.png";
import knhPng from "../../assets/doyoung/week2/h.png";

export const members = [
  {
    name: "김주완",
    role: "Frontend",
    intro: "성실히 배우고 싶은 학생입니다.",
    image: kjwGif,
    club: "LikeLion DAU",
    bio: [
      "컴퓨터공학과 1학년입니다.",
      "웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.",
    ],
    contact: {
      email: "mmnnbbnn070910@gmail.com",
      phone: "010-9041-1287",
      link: { label: "Likelion main page", url: "https://likelion.net/" },
    },
    skills: ["HTML/CSS", "JavaScript", "React (학습 중)"],
    motto: "성실히 배워서 웹개발 마스터가 되고 싶습니다.",
  },
  {
    name: "임도영",
    role: "Frontend",
    intro: "아기사자 14기 프론트엔드 임도영 입니다.",
    image: idyJpg,
    club: "디스이즈",
    bio: [
      "동아대 26학번 컴퓨터공학과, 아기사자 14기 임도영입니다. 이번 활동을 통해 많이 공부하며, 공부한 것을 활동 및 대회 참여를 통해 활용해나가며 경험과 기술을 쌓기 위해 노력하겠습니다. 앞으로 잘 부탁드립니다.",
    ],
    contact: {
      email: "dlaehdud342@naver.com",
      phone: "010-3516-6306",
      link: { label: "구글로 가기", url: "https://www.google.com" },
    },
    skills: ["HTML / CSS", "JavaScript", "React", "JAVA", "C / C++"],
    motto: "꾸준히 노력하고 적극적인 참여를 통해 성장하는 개발자가 되겠습니다.",
    isMe: true,
  },
  {
    name: "김나함",
    role: "Frontend",
    intro: "분야를 넘나들며 성장하는 개발자입니다.",
    image: knhPng,
    club: "멋쟁이사자처럼 아기사자 14기, 자기개발 동아리",
    bio: [
      "동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다.",
    ],
    contact: {
      email: "naham9488@gmail.com",
      phone: "010-3626-9488",
      instagram: "@kim_naham",
    },
    skills: ["HTML / CSS", "JavaScript"],
    motto:
      "부족한 점은 많지만 포기하지 않고 계속 노력하여 성장하는 아기사자가 되겠습니다!",
  },
  {
    name: "백태우",
    role: "Frontend",
    intro: "I'm Empty Stack Junior",
    image: btwJpg,
    club: "DAU_DSIS",
    bio: [
      "AI학과이지만 Full Stack Developer를 목표로 하고있기 때문에 Frontend에서 짱 먹어보겠습니다 감사합니다.",
    ],
    contact: {
      email: "btu0414@gmail.com",
      phone: "010-4564-4725",
      link: { label: "https://www.acmicpc.net/", url: "https://www.acmicpc.net/" },
    },
    skills: ["NLU / NLG", "NLP", "LLM"],
    motto: "모두가 원하는 개발자가 되어보겠습니다.",
  },
  {
    name: "정소민",
    role: "Frontend",
    intro: "컴퓨터공학과 25학번 정소민입니다.",
    image: jsmPng,
    club: "디스이즈",
    bio: ["컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다."],
    contact: {
      email: "sominjung1116@gmail.com",
      phone: "010-5615-8474",
      link: { label: "링크", url: "https://www.instagram.com/__z1siim" },
    },
    skills: ["React", "ReactNative", "JavaScript"],
    motto: "열심히 하겠습니다.",
  },
  {
    name: "이도은",
    role: "Frontend",
    intro: "열심히 배우는 프론트엔드 개발자입니다!",
    image: ideJpeg,
    club: "LION TRACK",
    bio: ["안녕하세요! 말하는 감자입니다. 배움에는 끝이없다..!"],
    contact: {
      email: "dodo55860@gmail.com",
      phone: "010-2686-5586",
      link: { label: "구글로 이동", url: "https://www.google.com" },
    },
    skills: ["HTML / CSS", "JavaScript", "React (학습 중)"],
    motto: "팀원들에게 든든한 개발자가 되고싶습니다.",
  },
  {
    name: "정서윤",
    role: "Frontend",
    intro: "열심히 배워가고있는 프론트엔드 개발자입니다!",
    image: jsyPng,
    club: "디스이즈",
    bio: [
      "안녕하세요, 프론트엔드를 맡고 있는 07년생 26학번 컴퓨터공학과 정서윤입니다. 아직 부족한 점이 많지만, 배우는 과정 자체를 즐기며 꾸준히 성장하고 있습니다. MBTI는 ESTP이고, 이번 멋사 리그에는 '쫄?'이라는 게임으로 참여했습니다. 많이 배우고 경험하는 것을 목표로 열심히 해보겠습니다. 감사합니다!",
    ],
    contact: {
      email: "t01021124995@gmail.com",
      phone: "010-3846-5638",
      link: { label: "깃헙", url: "https://github.com/dkjksd" },
    },
    skills: [
      "TypeScript",
      "SSR/SSG",
      "Utility-First CSS",
      "Server State Management",
    ],
    motto: "기초를 탄탄히 다지며, 맡은 역할을 끝까지 책임지는 개발자가 되겠습니다.",
  },
];
```

#### 2. map함수 활용

```
import styles from "./Page.module.css";
import { members } from "./members";

function SummaryCard({ member }) {
  return (
    <div
      className={`${styles["card"]} ${member.isMe ? styles["my-card"] : ""}`}
    >
      <img
        src={member.image}
        alt={`${member.name} 프로필`}
        className={styles["photo"]}
      />
      <h3>{member.name}</h3>
      <span className={styles["frontend"]}>{member.role}</span>
      <p>{member.intro}</p>
    </div>
  );
}

function ContactList({ contact }) {
  if (!contact) return null;
  return (
    <ul>
      {contact.email && (
        <li>
          Email : <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </li>
      )}
      {contact.phone && (
        <li>
          Phone :{" "}
          <a href={`tel:${contact.phone.replace(/-/g, "")}`}>{contact.phone}</a>
        </li>
      )}
      {contact.link && (
        <li>
          link :{" "}
          <a
            href={contact.link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contact.link.label}
          </a>
        </li>
      )}
      {contact.instagram && <li>인스타: {contact.instagram}</li>}
    </ul>
  );
}

function DetailCard({ member }) {
  return (
    <div className={styles["detailcard"]}>
      <h3>{member.name}</h3>
      <span className={styles["frontend"]}>{member.role}</span>
      <p className={styles["dsis"]}>동아리명 : {member.club}</p>

      <section className={styles["section"]}>
        <h4>자기소개</h4>
        {member.bio.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </section>

      <section className={styles["section"]}>
        <h4>연락처</h4>
        <ContactList contact={member.contact} />
      </section>

      <section className={styles["section"]}>
        <h4>관심 기술</h4>
        <ul>
          {member.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </section>

      <section className={styles["section"]}>
        <h4>한 마디</h4>
        <p>{member.motto}</p>
      </section>
    </div>
  );
}

export default function Week2Page() {
  return (
    <div className={styles["week-page"]}>
      <h2>2주차 - 아기사자 명단 대시보드</h2>

      <section className={styles["cardpack"]}>
        {members.map((member) => (
          <SummaryCard key={member.name} member={member} />
        ))}
      </section>

      <section className={styles["detailcardpack"]}>
        {members.map((member) => (
          <DetailCard key={member.name} member={member} />
        ))}
      </section>
    </div>
  );
}
```

#### 3. css

```
.week-page {
  padding: 32px;
  background-color: #f1f2f6;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.week-page h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

/* 요약 카드 그리드 */
.cardpack {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .cardpack {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .cardpack {
    grid-template-columns: 1fr;
  }
}

/* 요약 카드 */
.card {
  width: 100%;
  padding: 40px;
  background-color: white;
  border-radius: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

/* 본인 카드 강조 */
.my-card {
  border: 3px solid var(--color-primary);
  box-shadow: 0 4px 16px rgba(0, 51, 100, 0.15);
}

.frontend {
  color: var(--color-primary);
  font-weight: bold;
}

.photo {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
}

/* 상세 카드 컨테이너 */
.detailcardpack {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 상세 카드 */
.detailcard {
  width: 100%;
  padding: 40px;
  background-color: white;
  border-radius: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detailcard h3 {
  font-size: 1.5rem;
  font-weight: 700;
}

.detailcard h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.dsis {
  font-weight: bold;
  color: var(--color-primary);
}

/* 상세 섹션 (자기소개/연락처/관심기술/한 마디) */
.section {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section ul {
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section a {
  color: var(--color-primary);
  text-decoration: none;
}

.section a:hover {
  text-decoration: underline;
}
```
