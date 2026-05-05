import styles from "./Page.module.css";
import { members } from "./members";

export default function Week2Page() {
  return (
    <div className={styles["page"]}>
      <h2>2주차 — 1주차 작업물 모아보기</h2>
      <p className={styles["subtitle"]}>카드를 클릭하면 해당 페이지로 이동합니다</p>

      <div className={styles["works-grid"]}>
        {members.map(({ name, role, bio, image, tech, path }) => (
          <a key={name} href={path} className={styles["member-card"]}>
            <div className={styles["card-image-wrap"]}>
              {image ? (
                <img src={image} alt={name} className={styles["card-image"]} />
              ) : (
                <div className={styles["card-image-placeholder"]}>
                  {name.charAt(0)}
                </div>
              )}
              <span className={styles["tech-badge"]}>{tech}</span>
            </div>
            <div className={styles["card-info"]}>
              <h3 className={styles["member-name"]}>{name}</h3>
              <strong className={styles["member-role"]}>{role}</strong>
              <p className={styles["member-bio"]}>{bio}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
