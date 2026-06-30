import { Link } from "react-router-dom";
import styles from "./Page.module.css";

export default function NotFoundPage({ type = "route" }) {
  const isMissingLion = type === "lion";
  return (
    <div className={styles.weekPage}>
      <h2>
        {isMissingLion
          ? "존재하지 않는 아기사자입니다"
          : "페이지를 찾을 수 없습니다"}
      </h2>
      <Link to="/somin/week7">← 목록으로 돌아가기</Link>
    </div>
  );
}