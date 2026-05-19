import { useState } from "react";
import styles from "./Page.module.css";
import { initialMembers } from "./lions";

export default function Week4Page() {
  const [members, setMembers] = useState(initialMembers);
  const [showForm, setShowForm] = useState(false);

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
  };

  const handleDeleteLast = () => {
    setMembers((prev) => prev.slice(0, -1));
  };

  return (
    <main className={styles["container"]}>
      <div className={styles["controls"]}>
        <button
          type="button"
          className={styles["btn"]}
          onClick={handleToggleForm}
        >
          아기 사자 추가
        </button>
        <button
          type="button"
          className={styles["btn"]}
          onClick={handleDeleteLast}
        >
          마지막 아기 사자 삭제
        </button>
        <span className={styles["total-count"]}>총 {members.length}명</span>
      </div>

      <section className={styles["summary-section"]}>
        <ul className={styles["card-grid"]}>
          {members.map((m) => {
            const partClass = m.part?.toLowerCase() || "";
            return (
              <li
                key={m.id}
                className={`${styles["summary-card"]} ${
                  m.isMine ? styles["summary-card--mine"] : ""
                }`}
              >
                <div className={styles["card-image-wrap"]}>
                  <img
                    src={m.image}
                    alt={`${m.name} 프로필 이미지`}
                    className={styles["card-image"]}
                  />
                  <span className={styles["badge"]}>{m.badge}</span>
                </div>
                <div className={styles["card-body"]}>
                  <h2 className={styles["card-name"]}>{m.name}</h2>
                  <p
                    className={`${styles["card-part"]} ${
                      styles[`card-part--${partClass}`] || ""
                    }`}
                  >
                    {m.part}
                  </p>
                  <p className={styles["card-intro"]}>{m.intro}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles["detail-section"]}>
        <h2 className={styles["section-title"]}>상세 자기소개</h2>
        <ol className={styles["detail-list"]}>
          {members.map((m) => {
            const partClass = m.part?.toLowerCase() || "";
            return (
              <li key={m.id} className={styles["detail-card"]}>
                <header className={styles["detail-header"]}>
                  <h3 className={styles["detail-name"]}>{m.name}</h3>
                  <p
                    className={`${styles["detail-part"]} ${
                      styles[`detail-part--${partClass}`] || ""
                    }`}
                  >
                    {m.part}
                  </p>
                  <p className={styles["detail-club"]}>{m.club}</p>
                </header>

                <section className={styles["detail-section-inner"]}>
                  <h4>자기소개</h4>
                  <p>{m.about}</p>
                </section>

                <section className={styles["detail-section-inner"]}>
                  <h4>관심 기술</h4>
                  <ul className={styles["skill-list"]}>
                    {(m.skills || []).map((s, i) => (
                      <li key={`${m.id}-skill-${i}`}>{s}</li>
                    ))}
                  </ul>
                </section>

                <section className={styles["detail-section-inner"]}>
                  <h4>연락처</h4>
                  <address>
                    <ul className={styles["contact-list"]}>
                      {m.email && (
                        <li>
                          이메일:{" "}
                          <a href={`mailto:${m.email}`}>{m.email}</a>
                        </li>
                      )}
                      {m.phone && <li>전화번호: {m.phone}</li>}
                      {m.website && (
                        <li>
                          웹사이트:{" "}
                          <a
                            href={m.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {m.website}
                          </a>
                        </li>
                      )}
                    </ul>
                  </address>
                </section>

                <section className={styles["detail-section-inner"]}>
                  <h4>한 마디</h4>
                  <blockquote>{m.quote}</blockquote>
                </section>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
