import { useParams, Link } from "react-router-dom";
import styles from "./Page.module.css";
import NotFoundPage from "./NotFoundPage";

export default function DetailPage({membersList,}) {
  const { id } = useParams();

  const member = membersList.find((m) => String(m.id) === id);

  if (!member) {
    return <NotFoundPage type="lion" />;
  }

  return (
    <div className={styles.weekPage}>
      <div className={styles.weekPageInner}>
        <Link
          to="/somin/week7"
          className={styles.btn}
        >
          ← 목록으로
        </Link>
        <div className={styles.detail} style={{ marginTop: "24px" }}>
          <div className={styles.main}>
            <p className={styles.detailName}>
              {member.name}
            </p>
            <p className={styles.detailEnd}>
              {member.role}
            </p>
            <p className={styles.club}>
              {member.club}
            </p>
          </div>

          <div className={styles.introduce}>
            <p>자기소개</p>
            <p>{member.bio}</p>
          </div>

          <div className={styles.contact}>
            <p>연락처</p>
            <ul>
              <li>Email : {member.email}</li>
              <li>Phone : {member.phone}</li>

              {member.website && (
                <li>
                  Website :
                  <a
                    href={member.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {member.website}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div className={styles.interest}>
            <p>관심 기술</p>
            <ul>
              {member.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>

          <div className={styles.gako}>
            <p>각오 한 마디</p>
            <p>{member.motto}</p>
          </div>
        </div>
      </div>
    </div>
  );
}