import { useParams, Link, useOutletContext } from "react-router-dom";
import styles from "./Page.module.css";

export default function DetailPage() {
  const { id } = useParams();
  const { memberList } = useOutletContext();
  const member = memberList.find((m) => String(m.id) === id);

  if (!member) {
    return (
      <div className={styles["notFoundPage"]}>
        <h2>존재하지 않는 아기 사자입니다</h2>
        <Link to="/taewoo/week7">← 목록으로</Link>
      </div>
    );
  }

  return (
    <div className={styles["week-page"]}>
      <div className={styles["detailCard"]}>
        <img
          className={styles["detailImage"]}
          src={member.image}
          alt={`${member.name} 프로필 사진`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://picsum.photos/seed/fallback/400/300";
          }}
        />
        <p className={styles["name"]}>{member.name}</p>
        <b className={styles["redText"]}>{member.part}</b>
        <p className={styles["joinClub"]}>{member.club}</p>
        <hr className={styles["modalDivider"]} />

        {!member.contact && !member.skills && !member.last ? (
          <p className={styles["introduceMyself"]}>아직 준비 중입니다.</p>
        ) : (
          <>
            <h3 className={styles["introduceTitle"]}>자기소개</h3>
            {member.introduce?.map((text, i) => (
              <p
                key={`${member.id}-intro-${i}`}
                className={styles["introduceMyself"]}
              >
                {text}
              </p>
            ))}

            {(member.contact?.email ||
              member.contact?.phone ||
              member.contact?.website) && (
              <>
                <h3 className={styles["introduceTitle"]}>연락처</h3>
                <ul>
                  {member.contact.email && (
                    <li className={styles["listStyle"]}>
                      Email: {member.contact.email}
                    </li>
                  )}
                  {member.contact.phone && (
                    <li className={styles["listStyle"]}>
                      Phone: {member.contact.phone}
                    </li>
                  )}
                  {member.contact.website && (
                    <li className={styles["listStyle"]}>
                      Website:{" "}
                      <a href={member.contact.website.url}>
                        {member.contact.website.label}
                      </a>
                    </li>
                  )}
                </ul>
              </>
            )}

            {member.skills && (
              <>
                <h3 className={styles["introduceTitle"]}>관심 기술</h3>
                <ul>
                  {member.skills.map((skill, i) => (
                    <li key={i} className={styles["listStyle"]}>
                      {skill}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {member.last && (
              <>
                <h3 className={styles["introduceTitle"]}>한 마디</h3>
                <p className={styles["introduceLast"]}>{member.last}</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
