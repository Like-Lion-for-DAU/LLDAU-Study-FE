import "./Home.css";
import schedule from "./schedule.json";

export default function Home() {
  return (
    <div className="home">
      <div className="home-header">
        <h1 className="home-title">Front-End Study</h1>
        <div className="home-links">
          <a
            href="https://likelion.net/my/courses"
            target="_blank"
            rel="noopener noreferrer"
            className="home-link"
          >
            멋사 강의실
          </a>
          <a
            href="https://likelion-pbl-five.vercel.app/react"
            target="_blank"
            rel="noopener noreferrer"
            className="home-link"
          >
            PBL React
          </a>
        </div>
      </div>
      <table className="home-table">
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
              className={row.link ? "home-table-row-link" : ""}
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
