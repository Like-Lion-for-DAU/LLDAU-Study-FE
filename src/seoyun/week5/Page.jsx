import { useState } from "react";
import styles from "./Page.module.css";
import pfp from "./pfp.png";

export default function Page() {
  const [tab, setTab] = useState("overview");

  return (
    <div className={styles.root}>

      {/* 사이드바: 프로필 정보 고정 영역 */}
      <aside className={styles.sidebar}>
        <div className={styles.avatar}>
          <div className={styles.avatarImg}>
            <img src={pfp} alt="서윤" />
          </div>
        </div>

        <h1 className={styles.displayName}>정서윤</h1>
        <p className={styles.username}>@wad8228</p>
        <p className={styles.sideBio}>
          열심히 배워가고 있는 프론트엔드 개발자입니다!
          기초를 탄탄히 다지며 맡은 역할을 끝까지 책임지겠습니다. 🔥
        </p>
        <button className={styles.followBtn}>Follow</button>
      </aside>

      <main className={styles.content}>
        <div className={styles.tabs}>
          {[
            { key: "overview",     label: "Overview" },
            { key: "repositories", label: "Projects" },
            { key: "activity",     label: "Activity" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.tab} ${tab === key ? styles.tabActive : ""}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className={styles.tabContent}>
            <p style={{ color: "#8b949e" }}>준비 중...</p>
          </div>
        )}
        {tab === "repositories" && (
          <div className={styles.tabContent}>
            <p style={{ color: "#8b949e" }}>준비 중...</p>
          </div>
        )}
        {tab === "activity" && (
          <div className={styles.tabContent}>
            <p style={{ color: "#8b949e" }}>준비 중...</p>
          </div>
        )}
      </main>

    </div>
  );
}