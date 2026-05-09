import styles from "./Page.module.css";
import { members } from "./members";
import "./script.js"

//태엽님의 코드 참고
function SummaryCard({ member }) {
  return (
    <div
      className={`${styles["card"]} ${member.isMe ? styles["my-card"] : ""}`}
    >
      <img src={member.image} alt={`${member.name} 프로필`} className={styles["photo"]}/>
      <h3>{member.name}</h3>
      <span className={styles["frontend"]}>{member.role}</span>
      <p>{member.intro}</p>
    </div>
  );
}

function ContactList({contact}) {
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
        <ContactList contact={member.contact}/>
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

export default function Week3Page() {
  return (
    <div className={styles["week-page"]}>
      <h2>3주차</h2>
      <section>
        <div className={styles["controlInner"]}>
          <button id="btnAdd" className={styles["btn"]}>
            <p className={styles["btnIcon"]}>아기 사자 추가</p>
          </button>
          <button id="btnDel" className={styles["btn"]}>
            <p className={styles["btnIcon"]}>마지막 아기 사자 삭제</p>
          </button>
          <span className={styles["count"]}>총 <span id="total"></span>명</span>
        </div>
      </section>

      <section className={styles["formSection"]} id="formSection">
        <div className={styles["formInner"]}>
          <div>
            <p className={styles["text"]}>이름</p>
            <input type="text" className={styles["form"]} id="name" placeholder="예: 홍아기사자"></input>
          </div>
          <div>
            <p className={styles["text"]}>파트</p>
            <select className={styles["part"]} id="part">
              <option value="">파트를 선택하세요</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Design">Design</option>
            </select>
            
          </div>
          <div className={styles["Width"]}>
            <p className={styles["text"]}>관심 기술 (쉼표로 구성)</p>
            <input type="text" className={styles["form"]} id="skills" placeholder="예: JavaScript, React, HTML/CSS"></input>
          </div>
          <div className={styles["Width"]}>
            <p className={styles["text"]}>한 줄 소개(요약 카드)</p>
            <input type="text" className={styles["form"]} id="intro" placeholder="예: 3주차 DOM 조작 연습 중!"></input>
          </div>
          <div className={styles["Width"]}>
            <p className={styles["text"]}>자기소개 (상세카드)</p>
            <textarea rows="5" cols="30" className={styles["form"]} id="detail" placeholder="예: HTML/CSS로 구조를 만들고, JS로 데이터를 바꾸면 화면이 바뀌는 경험을 하고 있습니다."></textarea>
          </div>
          <div>
            <p className={styles["text"]}>Email</p>
            <input type="text" className={styles["form"]} id="email" placeholder="예: lion@example.com"></input>
          </div>
          <div>
            <p className={styles["text"]}>Phone</p>
            <input type="text" className={styles["form"]} id="phone" placeholder="예: 010-1234-5678"></input>
          </div>
          <div className={styles["Width"]}>
            <p className={styles["textWidth"]}>Website</p>
            <input type="text" className={styles["form"]} id="web" placeholder="예: https://example.com"></input>
          </div>
          <div className={styles["Width"]}>
            <p className={styles["text"]}>한 마디</p>
            <input type="text" className={styles["form"]} id="tell" placeholder="예: 데이터 바꾸면 화면도 바뀐다!"></input>
          </div>
          <div className={styles["controlOut"]}>
            <button className={styles["btn"]} id="add">
              <p className={styles["btnIcon"]} id="add">추가하기</p>
            </button>
            <button className={styles["btn"]} id="btnCancle">
              <p className={styles["btnIcon"]} id="cancle">취소</p>
            </button>
          </div>
          
        </div>
      </section>

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