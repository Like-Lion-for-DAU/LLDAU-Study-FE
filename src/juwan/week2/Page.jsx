import styles from "./Page.module.css";
import doeun from "../../assets/juwan/doeun.jpeg";
import doyoung from "../../assets/juwan/doyoung.jpg";
import somin from "../../assets/juwan/somin.png";
import juwan from "../../assets/juwan/juwan.gif";
import naham from "../../assets/juwan/naham.png";
import seoyun from "../../assets/juwan/seoyun.png";
import taewoo from "../../assets/juwan/taewoo.jpg";

export default function Week2Page() {
  return (
    <div className={styles["week-page"]}>
      <div className={styles["cardContainer"]}>
        <div className={`${styles["card"]} ${styles["main-card"]}`}>
          <img src={juwan} alt="이미지"/>
          <span className={styles["badge"]}>React</span>
          <div className={styles["cardContent"]}>
            <h3>김주완</h3>
            <p className={styles["role"]}>Frontend</p>
            <p className={styles["introduce"]}>성실히 배우고 싶은 학생입니다.</p>
          </div>
        </div>

                <div className={styles["card"]}>
          <img src={doyoung} alt="이미지"/>
          <span className={styles["badge"]}>React</span>
          <div className={styles["cardContent"]}>
            <h3>임도영</h3>
            <p className={styles["role"]}>Backend</p>
            <p className={styles["introduce"]}>아기사자 14기 프론트엔드 임도영입니다.</p>
          </div>
        </div>

                <div className={styles["card"]}>
          <img src={naham} alt="이미지"/>
          <span className={styles["badge"]}>JavaScript</span>
          <div className={styles["cardContent"]}>
            <h3>김나함</h3>
            <p className={styles["role"]}>JavaScript</p>
            <p className={styles["introduce"]}>분야를 넘나들며 성장하는 개발자입니다.</p>
          </div>
        </div>

                <div className={styles["card"]}>
          <img src={taewoo} alt="이미지"/>
          <span className={styles["badge"]}>AI/NLP</span>
          <div className={styles["cardContent"]}>
            <h3>백태우</h3>
            <p className={styles["role"]}>AI/NLP</p>
            <p className={styles["introduce"]}>I'm Empty Stack Junior :( </p>
          </div>
        </div>

                <div className={styles["card"]}>
          <img src={somin} alt="이미지"/>
          <span className={styles["badge"]}>React Native</span>
          <div className={styles["cardContent"]}>
            <h3>정소민</h3>
            <p className={styles["role"]}>Frontend</p>
            <p className={styles["introduce"]}>컴퓨터공학과 25학번 정소민입니다.</p>
          </div>
        </div>

                <div className={styles["card"]}>
          <img src={doeun} alt="이미지"/>
          <span className={styles["badge"]}>React</span>
          <div className={styles["cardContent"]}>
            <h3>이도은</h3>
            <p className={styles["role"]}>Frontend</p>
            <p className={styles["introduce"]}>열심히 배우는 프론트엔드 개발자입니다!</p>
          </div>
        </div>

                <div className={styles["card"]}>
          <img src={seoyun} alt="이미지"/>
          <span className={styles["badge"]}>HTML/CSS</span>
          <div className={styles["cardContent"]}>
            <h3>정서윤</h3>
            <p className={styles["role"]}>Frontend</p>
            <p className={styles["introduce"]}>준비중...</p>
          </div>
        </div>

                <div className={styles["card"]}>
          <img src={naham} alt="이미지"/>
          <span className={styles["badge"]}>TypeScript</span>
          <div className={styles["cardContent"]}>
            <h3>이태엽</h3>
            <p className={styles["role"]}>Frontend</p>
            <p className={styles["introduce"]}>준비중...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
