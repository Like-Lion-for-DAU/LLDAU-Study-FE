import { Outlet, Link, useLocation } from "react-router-dom";
import styles from "./Page.module.css";

export default function Layout({ membersList }) {
  const location = useLocation();
  const isList = location.pathname === "/somin/week7";

  return (
    <div className={styles.weekPage}>
      <div className={styles.weekPageInner}>
        <div className={styles.heroBanner}>
          <div className={styles.heroOverlay}>
            <p className={styles.heroLabel}>LLDAU STUDY</p>
            <h1 className={styles.heroTitle}>
              멋쟁이 아기사자
            </h1>
            <p className={styles.heroSub}>
              {membersList.length}명의 멤버 · Spotify
            </p>
          </div>
        </div>
        <Outlet />

      </div>
    </div>
  );
}