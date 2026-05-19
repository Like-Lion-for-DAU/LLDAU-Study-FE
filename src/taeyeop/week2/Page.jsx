import { useState, useEffect } from "react";
import styles from "./Page.module.css";
import { members } from "./members";

export default function Week2Page() {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!selected) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleEsc);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = original;
    };
  }, [selected]);

  return (
    <div className={styles["page"]}>
      <h2>2주차 — 1주차 작업물 모아보기</h2>
      <p className={styles["subtitle"]}>
        카드를 클릭하면 상세 정보가 표시됩니다
      </p>

      <div className={styles["works-grid"]}>
        {members.map((member) => (
          <button
            key={member.name}
            type="button"
            className={styles["member-card"]}
            onClick={() => setSelected(member)}
          >
            <div className={styles["card-image-wrap"]}>
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className={styles["card-image"]}
                />
              ) : (
                <div className={styles["card-image-placeholder"]}>
                  {member.name.charAt(0)}
                </div>
              )}
              <span className={styles["tech-badge"]}>{member.tech}</span>
            </div>
            <div className={styles["card-info"]}>
              <h3 className={styles["member-name"]}>{member.name}</h3>
              <strong className={styles["member-role"]}>{member.role}</strong>
              <p className={styles["member-bio"]}>{member.bio}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => setSelected(null)}
        >
          <div
            className={styles["modal"]}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className={styles["modal-close"]}
              onClick={() => setSelected(null)}
              aria-label="닫기"
            >
              ×
            </button>

            <div className={styles["modal-header"]}>
              <div className={styles["modal-image-wrap"]}>
                {selected.image ? (
                  <img
                    src={selected.image}
                    alt={selected.name}
                    className={styles["modal-image"]}
                  />
                ) : (
                  <div className={styles["modal-image-placeholder"]}>
                    {selected.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className={styles["modal-name-area"]}>
                <h3 className={styles["modal-name"]}>{selected.name}</h3>
                <strong className={styles["modal-role"]}>
                  {selected.role}
                </strong>
                {selected.track && (
                  <p className={styles["modal-track"]}>{selected.track}</p>
                )}
              </div>
            </div>

            <div className={styles["modal-body"]}>
              {selected.intro && (
                <section className={styles["modal-section"]}>
                  <h4>자기소개</h4>
                  <p>{selected.intro}</p>
                </section>
              )}

              {selected.skills && selected.skills.length > 0 && (
                <section className={styles["modal-section"]}>
                  <h4>관심 기술</h4>
                  <div className={styles["skill-badges"]}>
                    {selected.skills.map((skill) => (
                      <span key={skill} className={styles["skill-badge"]}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {selected.contact && (
                <section className={styles["modal-section"]}>
                  <h4>연락처</h4>
                  <ul className={styles["contact-list"]}>
                    {selected.contact.email && (
                      <li>
                        <span className={styles["contact-label"]}>Email</span>
                        <a href={`mailto:${selected.contact.email}`}>
                          {selected.contact.email}
                        </a>
                      </li>
                    )}
                    {selected.contact.phone && (
                      <li>
                        <span className={styles["contact-label"]}>Phone</span>
                        <a
                          href={`tel:${selected.contact.phone.replace(/-/g, "")}`}
                        >
                          {selected.contact.phone}
                        </a>
                      </li>
                    )}
                    {selected.contact.website && (
                      <li>
                        <span className={styles["contact-label"]}>Website</span>
                        <a
                          href={selected.contact.website}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {selected.contact.website}
                        </a>
                      </li>
                    )}
                    {selected.contact.instagram && (
                      <li>
                        <span className={styles["contact-label"]}>
                          Instagram
                        </span>
                        <span>{selected.contact.instagram}</span>
                      </li>
                    )}
                  </ul>
                </section>
              )}

              {selected.motto && (
                <section className={styles["modal-section"]}>
                  <h4>각오 한 마디</h4>
                  <p className={styles["modal-motto"]}>"{selected.motto}"</p>
                </section>
              )}

              {!selected.intro && !selected.contact && (
                <p className={styles["modal-empty"]}>
                  아직 1주차 작업이 진행 중입니다.
                </p>
              )}

              <div className={styles["modal-footer"]}>
                <a href={selected.path} className={styles["modal-link"]}>
                  원본 페이지 보기 →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
