import { useParams, useNavigate } from "react-router-dom";
import styles from "./Page.module.css";
import NotFoundPage from "./NotFoundPage";

export default function DetailPage({ members }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const member = members.find((m) => String(m.id) === id);

  if (!member) {
    return <NotFoundPage type="lion" />;
  }

  return (
    <section className={styles["detailcard"]}>
      <button className={styles["btnIcon"]} onClick={() => navigate(-1)}>
        목록으로 돌아가기
      </button>

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
    </section>
  );
}