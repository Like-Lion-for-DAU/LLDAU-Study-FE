import { Link } from "react-router-dom";
import styles from "./Page.module.css";

type NotFoundType = "route" | "lion";

interface NotFoundPageProps {
  type?: NotFoundType;
}

export default function NotFoundPage({ type = "route" }: NotFoundPageProps) {
  const isMissingLion = type === "lion";

  return (
    <section className={styles.detailCard}>
      <span className={styles.partBadge}>
        {isMissingLion ? "Unknown Lion" : "Not Found"}
      </span>
      <h2>
        {isMissingLion
          ? "존재하지 않는 아기 사자입니다"
          : "페이지를 찾을 수 없습니다"}
      </h2>
      <p className={styles.intro}>
        {isMissingLion
          ? "URL의 id와 일치하는 아기 사자가 명단에 없습니다."
          : "정의되지 않은 주소로 접근했습니다."}
      </p>
      <Link className={styles.backLink} to="/doyoung/week7">
        목록 페이지로 돌아가기
      </Link>
    </section>
  );
}
