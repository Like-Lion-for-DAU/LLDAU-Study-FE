import styles from "./Home.module.css";
import schedule from "./schedule.json";

export default function Home() {
  return (
    <div className={styles["home"]}>
      <div className={styles["home-header"]}>
        <h1 className={styles["home-title"]}>Front-End Study</h1>
        <div className={styles["home-links"]}>
          <a
            href="https://likelion.net/my/courses"
            target="_blank"
            rel="noopener noreferrer"
            className={styles["home-link"]}
          >
            멋사 강의실
          </a>
          <a
            href="https://likelion-pbl-five.vercel.app/react"
            target="_blank"
            rel="noopener noreferrer"
            className={styles["home-link"]}
          >
            PBL React
          </a>
        </div>
      </div>
      <table className={styles["home-table"]}>
        <thead>
          <tr>
            <th>주차</th>
            <th>강의 시간</th>
            <th>기간</th>
            <th>주제</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => (
            <tr
              key={row.week}
              className={row.link ? styles["home-table-row-link"] : ""}
              onClick={() => row.link && window.open(row.link, "_blank")}
            >
              <td>{row.week}</td>
              <td>{row.duration}</td>
              <td>{row.period}</td>
              <td>{row.topic}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
