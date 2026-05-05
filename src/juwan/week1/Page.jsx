import styles from "./Page.module.css";

export default function Week1Page() {
  return (
    <div>

      <div className={styles["week-page"]}>
        {/* <h2>1주차</h2> */}
      </div>

      <div className={styles["box1"]}>

        <img 
        src="https://i.namu.wiki/i/eThT8CYFzrGi-QEREijNJdiceYKYXYjArupDY07S2Gxlo0CZDO2cQyWWnDXHfqemvizFtSh0SRScxaIpKR-xZA.gif" 
        alt="이미지 불러오기 실패" 
        />

        <h2 className={styles["name"]}>김주완</h2>
        <p className={styles["role"]}>Frontend</p>
        <p className={styles["goal"]}>성실히 배우고 싶은 학생입니다.</p>
      </div>

      <div className={styles["box2"]}>

        <h2 className={styles["name"]}>김주완</h2>
        <p className={styles["role"]}>Frontend</p>
        <p className={styles["club_name"]}>LikeLion DAU</p>

        <h3 className={styles["subtitle"]}>자기소개</h3>
        <p className={styles["my"]}>컴퓨터공학과 1학년입니다.
        <br/>웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.</p>
        
        <h3 className={styles["subtitle"]}>연락처</h3>
        <ul>
          <li>Email: mmnnbbnn070910@gmail.com</li>
          <li>Phone: 010-9041-1287</li>
          <li>Website: <a href="https://likelion.net/" target="_blank">
          Likelion main page</a></li>
        </ul>

        <h3 className={styles["subtitle"]}>관심 기술</h3>
        <ul>
          <li>HTML/CSS</li>
          <li>JavaScript</li>
          <li>React(학습 중)</li>
        </ul>

        <h3 className={styles["subtitle"]}>한 마디</h3>
        <p className={styles["final"]}>성실히 배워서 웹개발 마스터가 되고 싶습니다.</p>

      </div>

    </div>
  );
}
