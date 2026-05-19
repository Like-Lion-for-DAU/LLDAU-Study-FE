import styles from "./Page.module.css";

export default function Week1Page() {
  return (
    <div>
      <div className={styles["main_profile"]}>

        <img className={styles["profile_image"]} src="https://i.pinimg.com/236x/ab/58/35/ab58355b3cc43e8649ef972985205330.jpg"></img>

        <h2 className={styles["name"]}>백태우</h2>
        <b className={styles["blue_rule"]}>Frontend</b>
        <p className={styles["line_introduce"]}>I'm Empty Stack Junior <b>:(</b></p>
      </div>


      <div className={styles["profile_infomation"]}>
        <h2 className={styles["name"]}>백태우</h2>
        <b className={styles["blue_rule"]}>Frontend</b>
        <p className={styles["join_club"]}>DAU_DSIS</p>

        <br />

        <h3 className={styles["introduce_title"]}>자기소개</h3>
        <p className={styles["introduce"]}>AI학과지만 FullStack을 목표하기때문에 Frontend 짱 먹어보겠습니다</p>
        
        <br />

        <h3 className={styles["introduce_title"]}>연락처</h3>
        <ul>
          <li>Email: btu0414@gmail.com</li>
          <li>Phone: 010-4564-4725</li>
          <li>Website: <a href="https://www.acmicpc.net/">www.acmicpc.net</a></li>
          <li>github: <a href="https://github.com/TW1OO">github.com/TW1OO</a><a href="https://github.com/TW1OO"><img className={styles["mark_size"]} src="https://img.icons8.com/p1em/1200/github.jpg"></img></a></li>
        </ul>

        <br/>

        <h3 className={styles["introduce_title"]}>관심 기술</h3>
        <ul>
          <li>NLP</li>
          <li>LLM</li>
          <li>python</li>
        </ul>

        <br/>

        <h3 >읽고 있는 책</h3>
        <img className={styles["book_picture"]} src="https://contents.kyobobook.co.kr/sih/fit-in/400x0/pdt/9788966260959.jpg"></img>
        <img className={styles["book_picture"]} src="https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791169211475.jpg"></img>

        <h3 className={styles["introduce_title"]}>한 마디</h3>
        <p className={styles["introduce"]}>모두가 원하는 개발자가 되겠습니다.</p>

      </div>

    </div>
  );
}
