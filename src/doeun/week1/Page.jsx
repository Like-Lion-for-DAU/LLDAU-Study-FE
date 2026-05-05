import styles from "./Page.module.css";
import logo from "./talk_potato.jpg"

export default function Week1Page() {
  return (
    <div className={styles["week-page"]}>
      <div className={styles["profile-card"]}>
        <img
          src={logo}
          className={styles["profile-img"]}
        />
        <h2>이도은 아기사자</h2>
        <strong>Frontend</strong>
        <p>열심히 배우는 프론트엔드 개발자입니다!</p>
      </div>

      <div className={styles["detail-card"]}>
        <header className={styles["detail-H"]}>
          <h1>이도은</h1>
          <strong>Frontend</strong>
          <p>LION TRACK</p>
        </header>

        <main className={styles["detail"]}>
          <section className={styles["info"]}>
            <h3>자기소개</h3>
            <p>
              모르는게 너무 많은 말하는감자입니다. 잘부탁드립니다. 배움에는 끝이없다..!
            </p>
          </section>

          <footer>
            <section className={styles["number"]}>
              <h3>연락처</h3>
              <ul>
                <li> Email: dodo55860@gmail.com</li>
                <li>
                  <a href="" target="_blank">
                    구글로 이동
                  </a>
                </li>
                <li>Phone: 010-2686-5586</li>
              </ul>
            </section>
          </footer>

          <section className={styles["skill"]}>
            <h3>관심 기술</h3>
            <ul>
              <li>HTML / CSS</li>
              <li>JavaScript</li>
              <li>React (학습 중)</li>
            </ul>
          </section>

          <section className={styles["word"]}>
            <h3>한 마디</h3>
            <p>팀원들에게 든든한 개발자가 되고싶습니다.</p>
          </section>
        </main>
      </div>
    </div>
  );
}
