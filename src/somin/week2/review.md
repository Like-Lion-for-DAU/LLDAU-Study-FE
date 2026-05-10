# 2주차 소민 과제 리뷰

## 1. CSS modules 사용시 주의 사항

### 1-a. CSS modules 표기법

- CSS modules에선 "card-detail" 처럼 "-"를 사용할 경우 빼기 연산으로 해석합니다.

- 따라서 camelCase로 명명 하는 것을 추천합니다. "cardDetail"

- camelCase == 첫 번째 글자 소문자, 띄어쓰기 기준으로 대문자

```
<div className={styles.cardDetail}>
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

## 2. .card, .card-me 클래스

### 2-a. 문제점

```
.card {
  width: 100%;
  max-width: 360px;
  min-height: 520px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-sizing: border-box;
}

.card-me {
  width: 100%;
  max-width: 360px;
  min-height: 520px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.6);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-sizing: border-box;
}
```

- 두 개의 css요소가

```
composes: card;
box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
```

- 제외 같음

### 2-b. 해결

- css

```
.card {
  width: 100%;
  max-width: 360px;
  min-height: 520px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-sizing: border-box;
}

.card-me {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}
```

- Page.jsx

```
{/* 일반 카드 */}
<div className={styles["card"]}>
    ...
</div>

{/* 소민 카드 */}
<div className={`${styles["card"]} ${styles["card-me"]}`}>
    ...
</div>
```

## 3. 데이터 파일 분리 + map 함수 활용

### 3-1. 문제점

- 똑같은 양식 코드 반복, 코드가 길어짐, 유지보수 어려움

- 카드 양식

```
<div className={styles["card-me"]}>
    <div className={styles["profileimg"]}>
        <img src={jsm} alt="정소민 프로필" />
        <span className={styles["badge"]}>React</span>
    </div>
    <p className={styles["name"]}>정소민</p>
    <p className={styles["end"]}>Frontend</p>
    <p>컴퓨터공학과 25학번 정소민입니다.</p>
</div>
```

- 상세 설명 양식

```
<div className={styles["detail"]}>
    <div className={styles["main"]}>
        <p className={styles["name"]}>정소민</p>
        <p className={styles["end"]}>Frontend</p>
        <p className={styles["club"]}>디스이즈</p>
    </div>

    <div className={styles["introduce"]}>
        <p>자기소개</p>
        <p>컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다.</p>
    </div>

    <div className={styles["contact"]}>
        <p>연락처</p>
        <ul>
            <li>email : sominjung1116@gmail.com</li>
            <li>instagram :
            <a href = "https://www.instagram.com/__z1siim" >@__z1siim</a></li>
            <li>phne : 010-5615-8474</li>
        </ul>
    </div>

    <div className={styles["interest"]}>
        <p>관심기술</p>
        <ul>
            <li>React</li>
            <li>ReactNative</li>
            <li>JavaScript</li>
        </ul>
    </div>

    <div className={styles["gako"]}>
        <p>각오 한 마디</p>
        <p>열심히 하겠습니다.</p>
        </div>
</div>
```

### 3-2. 해결

#### 1. 데이터 파일 분리

- src/somin/week2/members.js

```
import jsm from "./profile/jsm.png";
import kjw from "./profile/kjw.gif";
import idy from "./profile/idy.png";
import knh from "./profile/knh.png";
import btw from "./profile/btw.png";
import ide from "./profile/ide.png";
import jsy from "./profile/jsy.png";

export const members = [
  {
    name: "정소민",
    role: "Frontend",
    intro: "컴퓨터공학과 25학번 정소민입니다.",
    image: jsm,
    badge: "React",
    club: "디스이즈",
    bio: "컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다.",
    contact: {
      email: "sominjung1116@gmail.com",
      instagram: {
        label: "@__z1siim",
        url: "https://www.instagram.com/__z1siim",
      },
      phone: "010-5615-8474",
    },
    skills: ["React", "ReactNative", "JavaScript"],
    motto: "열심히 하겠습니다.",
    isMe: true,
  },
  {
    name: "김주완",
    role: "Frontend",
    intro: "성실히 배우고 싶은 학생입니다.",
    image: kjw,
    badge: "HTML/CSS",
    club: "LikeLion DAU",
    bio: "컴퓨터공학과 1학년입니다. 웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.",
    contact: {
      email: "mmnnbbnn070910@gmail.com",
      website: { label: "Likelion main page", url: "https://likelion.net/" },
      phone: "010-9041-1287",
    },
    skills: ["HTML/CSS", "JavaScript", "React(학습 중)"],
    motto: "성실히 배워서 웹개발 마스터가 되고 싶습니다.",
  },
  {
    name: "임도영",
    role: "Frontend",
    intro: "아기사자 14기 프론트엔드 임도영입니다.",
    image: idy,
    badge: "HTML / CSS",
    club: "디스이즈",
    bio: "동아대 26학번 컴퓨터공학과, 아기사자 14기 임도영입니다. 이번 활동을 통해 많이 공부하며, 공부한 것을 활동 및 대회 참여를 통해 활용해나가며 경험과 기술을 쌓기 위해 노력하겠습니다. 앞으로 잘 부탁드립니다.",
    contact: {
      email: "dlaehdud342@naver.com",
      website: { label: "web", url: "https://www.google.com" },
      phone: "010-3516-6306",
    },
    skills: ["HTML / CSS", "JavaScript", "React", "JAVA", "C / C++"],
    motto: "꾸준히 노력하고 적극적인 참여를 통해 성장하는 개발자가 되겠습니다.",
  },
  {
    name: "김나함",
    role: "Frontend",
    intro: "분야를 넘나들며 성장하는 개발자입니다.",
    image: knh,
    badge: "HTML / CSS",
    club: "멋쟁이사자처럼 아기사자 14기, 자기개발 동아리",
    bio: "동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다.",
    contact: {
      email: "naham9488@gmail.com",
      instagram: { label: "@kim_naham", url: null },
      phone: "010-3626-9488",
    },
    skills: ["HTML / CSS", "JavaScript"],
    motto:
      "부족한 점은 많지만 포기하지 않고 계속 노력하여 성장하는 아기사자가 되겠습니다!",
  },
  {
    name: "백태우",
    role: "Frontend",
    intro: "I'm Empty Stack Junior",
    image: btw,
    badge: "NLU / NLG",
    club: "DAU_DSIS",
    bio: "AI학과이지만 Full Stack Developer를 목표로 하고있기 때문에 Frontend에서 짱 먹어보겠습니다 감사합니다",
    contact: {
      email: "btu0414@gmail.com",
      website: { label: "web", url: "https://www.acmicpc.net/" },
      phone: "010-4564-4725",
    },
    skills: ["NLU / NLG", "NLP", "LLM"],
    motto: "모두가 원하는 개발자가 되어보겠습니다.",
  },
  {
    name: "이도은",
    role: "Frontend",
    intro: "열심히 배우는 프론트엔드 개발자입니다!",
    image: ide,
    badge: "HTML / CSS",
    club: "LION TRACK",
    bio: "모르는게 너무 많은 말하는수국입니다. 스펀지처럼 이해하려고 노력하고 있습니다. 배움에는 끝이없다..!",
    contact: {
      email: "dodo55860@gmail.com",
      website: { label: "web", url: "" },
      phone: "010-2686-5586",
    },
    skills: ["HTML / CSS", "JavaScript", "React (학습 중)"],
    motto: "팀원들에게 든든한 개발자가 되고싶습니다.",
  },
  {
    name: "정서윤",
    role: "Frontend",
    intro: "열심히 배워가고있는 프론트엔드 개발자입니다!",
    image: jsy,
    badge: "TypeScript",
    club: "디스이즈",
    bio: "안녕하세요, 프론트엔드를 맡고 있는 07년생 26학번 컴퓨터공학과 정서윤입니다. 아직 부족한 점이 많지만, 배우는 과정 자체를 즐기며 꾸준히 성장하고 있습니다. MBTI는 ESTP이고, 이번 멋사 리그에는 '쫄?'이라는 게임으로 참여했습니다. 많이 배우고 경험하는 것을 목표로 열심히 해보겠습니다. 감사합니다!",
    contact: {
      email: "t01021124995@gmail.com",
      github: { label: "github.com/dkjksd", url: "https://github.com/dkjksd" },
      phone: "010-3846-5638",
    },
    skills: [
      "TypeScript — 타입 기반 개발",
      "SSR/SSG — 서버 사이드 렌더링",
      "Utility-First CSS — 효율적인 스타일링",
      "Server State Management — 데이터 관리 최적화",
    ],
    motto: "기초를 탄탄히 다지며, 맡은 역할을 끝까지 책임지는 개발자가 되겠습니다.",
  },
];
```

#### 2. map 활용

- src/somin/week2/Page.jsx

```
import styles from "./Page.module.css";
import { members } from "./members";

function SummaryCard({ member }) {
  return (
    <div
      className={`${styles["card"]} ${
        member.isMe ? styles["card-me"] : ""
      }`}
    >
      <div className={styles["profileimg"]}>
        <img src={member.image} alt={`${member.name} 프로필`} />
        <span className={styles["badge"]}>{member.badge}</span>
      </div>
      <p className={styles["name"]}>{member.name}</p>
      <p className={styles["end"]}>{member.role}</p>
      <p>{member.intro}</p>
    </div>
  );
}

function ContactList({ contact }) {
  if (!contact) return null;
  return (
    <ul>
      {contact.email && <li>email : {contact.email}</li>}
      {contact.phone && <li>phone : {contact.phone}</li>}
      {contact.website && (
        <li>
          Website :{" "}
          <a href={contact.website.url} target="_blank" rel="noreferrer">
            {contact.website.label}
          </a>
        </li>
      )}
      {contact.instagram && (
        <li>
          instagram :{" "}
          {contact.instagram.url ? (
            <a
              href={contact.instagram.url}
              target="_blank"
              rel="noreferrer"
            >
              {contact.instagram.label}
            </a>
          ) : (
            contact.instagram.label
          )}
        </li>
      )}
      {contact.github && (
        <li>
          github :{" "}
          <a href={contact.github.url} target="_blank" rel="noreferrer">
            {contact.github.label}
          </a>
        </li>
      )}
    </ul>
  );
}

function DetailCard({ member }) {
  return (
    <div className={styles["detail"]}>
      <div className={styles["main"]}>
        <p className={styles["name"]}>{member.name}</p>
        <p className={styles["end"]}>{member.role}</p>
        <p className={styles["club"]}>{member.club}</p>
      </div>

      <div className={styles["introduce"]}>
        <p>자기소개</p>
        <p>{member.bio}</p>
      </div>

      <div className={styles["contact"]}>
        <p>연락처</p>
        <ContactList contact={member.contact} />
      </div>

      <div className={styles["interest"]}>
        <p>관심기술</p>
        <ul>
          {member.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>

      <div className={styles["gako"]}>
        <p>각오 한 마디</p>
        <p>{member.motto}</p>
      </div>
    </div>
  );
}

export default function Week2Page() {
  return (
    <div className={styles["week-page"]}>
      <section className={styles["card-intro"]}>
        {members.map((member) => (
          <SummaryCard key={member.name} member={member} />
        ))}
      </section>

      <section className={styles["card-detail"]}>
        {members.map((member) => (
          <DetailCard key={member.name} member={member} />
        ))}
      </section>
    </div>
  );
}
```
