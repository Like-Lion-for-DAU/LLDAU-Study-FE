import styles from "./Page.module.css";
import profile from "./profileimg.png"

export default function Week1Page() {
  return (
    <div className={styles["week-page"]}>
      <div className={styles["intro"]}>
        <img src = {profile} alt = "프로필 사진" className={styles["profileimg"]}></img>
        <h2 className={styles["intro-name"]}>정소민</h2>
        <p className={styles["end"]}>Frontend</p>
        <p>컴퓨터공학과 25학번 정소민입니다.</p>
      </div>

      <div className={styles["detail"]}>
        <div className={styles["main"]}>
          <h1>정소민</h1>
          <p className={styles["end"]}>Frontend</p>
          <p className={styles["club"]}>디스이즈</p>
        </div>

        <div className={styles["introduce"]}>
          <h3>자기소개</h3>
          <p>컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다.</p>
        </div>

        <div className={styles["contact"]}>
          <h3>연락처</h3>
          <ul>
            <li>email : sominjung1116@gmail.com</li>
            <li>instagram :  
              <a href = "https://www.instagram.com/__z1siim" >
              https://www.instagram.com/__z1siim</a></li>
            <li>번호 : 010-5615-8474</li>
          </ul>
        </div>

        <div className={styles["interest"]}>
          <h3>관심기술</h3>
          <ul>
            <li>React</li>
            <li>ReactNative</li>
            <li>JavaScript</li>
          </ul>
        </div>
        
        <div className={styles["gako"]}>
          <h3>각오 한 마디</h3>
          <p>열심히 하겠습니다.</p>
        </div>
      </div>
    </div>
  );
}
