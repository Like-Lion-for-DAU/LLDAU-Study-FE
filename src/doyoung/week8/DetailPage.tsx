import { useParams, Link } from "react-router-dom";
import styles from "./Page.module.css";
import NotFoundPage from "./NotFoundPage";
import { ContactList } from "./Page";
import { Member } from "./members";

interface DetailPageProps {
  members: Member[];
}

export default function DetailPage({ members }: DetailPageProps) {
  const { id } = useParams<{ id: string }>();

  const member = members.find((m) => String(m.id) === id);

  if (!member) {
    return <NotFoundPage type="lion" />;
  }

  return (
    <section className={styles["detailcard"]}>
      <Link to="/doyoung/week7">목록으로 돌아가기</Link>

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
    </section>
  );
}
