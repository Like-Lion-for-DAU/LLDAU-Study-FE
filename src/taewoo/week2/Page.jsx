import styles from "./Page.module.css";
import idyJPG from "../../assets/doyoung/week2/idy.jpg";
import jsmPNG from "../../assets/doyoung/week2/jsm.png";

export default function Week2Page() {
  return (
    <div className={styles["week-page"]}>
      <h2>2주차</h2>

      <div className={styles["grid-container"]}>
 
        <div className={styles["main_profil"]}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>HTML/CSS</span>
          </p>
          <img className={styles["profile_image"]} src="https://i.namu.wiki/i/eThT8CYFzrGi-QEREijNJdiceYKYXYjArupDY07S2Gxlo0CZDO2cQyWWnDXHfqemvizFtSh0SRScxaIpKR-xZA.gif" />
          <h2 className={styles["name"]}>김주완</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>성실히 배우고 싶은 학생입니다.</p>
        </div>
 
        <div className={styles["main_profil"]}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>HTML / CSS</span>
          </p>
          <img className={styles["profile_image"]} src={idyJPG} />
          <h2 className={styles["name"]}>임도영</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>아기사자 14기 프론트엔드 임도영 입니다.</p>
        </div>
 
        <div className={styles["main_profil"]}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>HTML / CSS</span>
          </p>
          <img className={styles["profile_image"]} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s" />
          <h2 className={styles["name"]}>김나함</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>분야를 넘나들며 성장하는 개발자입니다.</p>
        </div>
 
        <div className={styles["main_profil_pick"]}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>NLP</span>
          </p>
          <img className={styles["profile_image"]} src="https://i.pinimg.com/236x/ab/58/35/ab58355b3cc43e8649ef972985205330.jpg" />
          <h2 className={styles["name"]}>백태우</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>I'm Empty Stack Junior <b>:(</b></p>
        </div>
 
        <div className={styles["main_profil"]}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>NLP</span>
          </p>
          <img className={styles["profile_image"]} src={jsmPNG} />
          <h2 className={styles["name"]}>정소민</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>컴퓨터공학과 25학번 정소민입니다.</p>
        </div>
 
        <div className={styles["main_profil"]}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>HTML / CSS</span>
          </p>
          <img className={styles["profile_image"]} src="https://i.pinimg.com/736x/4f/6a/e8/4f6ae87f63609f8d7f1f38b3617cbe1c.jpg" />
          <h2 className={styles["name"]}>이도은</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>열심히 배우는 프론트엔드 개발자입니다!</p>
        </div>
 
        <div className={styles["main_profil"]}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>Null</span>
          </p>
          <img className={styles["profile_image"]} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s" />
          <h2 className={styles["name"]}>정소윤</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>멋사대학 14기 아기사자</p>
        </div>
 
        <div className={styles["main_profil"]}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>React</span>
          </p>
          <img className={styles["profile_image"]} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s" />
          <h2 className={styles["name"]}>김아기사자</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>구조적인 UI를 고민하는 프론트엔드 개발자입니다.</p>
        </div>
 
        <div className={styles["main_profil"]}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>TypeScript</span>
          </p>
          <img className={styles["profile_image"]} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s" />
          <h2 className={styles["name"]}>최아기사자</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>컴포넌트 단위 설계에 흥미가 있습니다.</p>
        </div>
 
      </div>
      
      <div className={styles["flex-container-column"]}>
        <div className={styles["profile_infomation"]}>
          <h2 className={styles["name"]}>김주완</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["join_club"]}>DAU_DSIS</p>

          <h3 className={styles["introduce_title"]}>자기소개</h3>
          <p className={styles["introduce_myself"]}>컴퓨터공학과 1학년입니다.</p>
          <p className={styles["introduce_myself"]}>웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.</p>
        

          <h3 className={styles["introduce_title"]}>연락처</h3>
          <ul>
            <li>Email: mmnnbbnn070910@gmail.com</li>
            <li>Phone: 010-9041-1287</li>
            <li>Website: <a href="https://likelion.net/">Likelion main page</a></li>
          </ul>

          <h3 className={styles["introduce_title"]}>관심 기술</h3>
          <ul>
            <li>HTML/CSS</li>
            <li>JavaScript</li>
            <li>React(학습 중)</li>
          </ul>

          <h3 className={styles["introduce_title"]}>한 마디</h3>
          <p className={styles["introduce_last"]}>성실히 배워서 웹개발 마스터가 되고 싶습니다.</p>
        </div>

        <div className={styles["profile_infomation"]}>
          <h2 className={styles["name"]}>임도영</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["join_club"]}>DAU_DSIS</p>

          <h3 className={styles["introduce_title"]}>자기소개</h3>
          <p className={styles["introduce_myself"]}>동아대 26학번 컴퓨터공학과, 아기사자 14기 임도영입니다. 이번 활동을 통해 많이 공부하며, 공부한 것을 활동 및 대회 참여를 통해 활용해나가며 경험과 기술을 쌓기 위해 노력하겠습니다. 앞으로 잘 부탁드립니다.</p>
        

          <h3 className={styles["introduce_title"]}>연락처</h3>
          <ul>
            <li>Email: dlaehdud342@naver.com</li>
            <li>Phone: 010-3516-6306</li>
            <li>Website: <a href="https://www.google.com/">https://www.google.com/</a></li>
          </ul>

          <h3 className={styles["introduce_title"]}>관심 기술</h3>
          <ul>
            <li>HTML / CSS</li>
            <li>JavaScript</li>
            <li>React</li>
            <li>JAVA</li>
            <li>C / C++</li>
          </ul>

          <h3 className={styles["introduce_title"]}>한 마디</h3>
          <p className={styles["introduce_last"]}>꾸준히 노력하고 적극적인 참여를 통해 성장하는 개발자가 되겠습니다.</p>
        </div>

        <div className={styles["profile_infomation"]}>
          <h2 className={styles["name"]}>김나함</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["join_club"]}>DAU_DSIS</p>

          <h3 className={styles["introduce_title"]}>자기소개</h3>
          <p className={styles["introduce_myself"]}>동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다.</p>
        

          <h3 className={styles["introduce_title"]}>연락처</h3>
          <ul>
            <li>Email: naham9488@gmail.com</li>
            <li>Phone: 010-3626-9488</li>
            <li>Insta: <a href="https://www.instagram.com/kim_naham/">@kim_naham</a></li>
          </ul>

          <h3 className={styles["introduce_title"]}>관심 기술</h3>
          <ul>
            <li>HTML / CSS</li>
            <li>JavaScript</li>
          </ul>

          <h3 className={styles["introduce_title"]}>한 마디</h3>
          <p className={styles["introduce_last"]}>부족한 점은 많지만 포기하지 않고 계속 노력하여 성장하는 아기사자가 되겠습니다!</p>
        </div>

        <div className={styles["profile_infomation"]}>
          <h2 className={styles["name"]}>백태우</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["join_club"]}>DAU_DSIS</p>

          <h3 className={styles["introduce_title"]}>자기소개</h3>
          <p className={styles["introduce_myself"]}>AI학과지만 FullStack을 목표하기때문에 Frontend 짱 먹어보겠습니다</p>
        

          <h3 className={styles["introduce_title"]}>연락처</h3>
          <ul>
            <li>Email: btu0414@gmail.com</li>
            <li>Phone: 010-4564-4725</li>
            <li>Website: <a href="https://www.acmicpc.net/">www.acmicpc.net</a></li>
            <li className={styles["git_center"]}>github: <a href="https://github.com/TW1OO">github.com/TW1OO</a><a href="https://github.com/TW1OO"><img className={styles["mark_size"]} src="https://img.icons8.com/p1em/1200/github.jpg"></img></a></li>
          </ul>

          <h3 className={styles["introduce_title"]}>관심 기술</h3>
          <ul>
            <li>NLP</li>
            <li>LLM</li>
            <li>python</li>
          </ul>

          <h3 className={styles["introduce_title"]}>한 마디</h3>
          <p className={styles["introduce_last"]}>모두가 원하는 개발자가 되겠습니다.</p>
        </div>

        <div className={styles["profile_infomation"]}>
          <h2 className={styles["name"]}>정소민</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["join_club"]}>DAU_DSIS</p>

          <h3 className={styles["introduce_title"]}>자기소개</h3>
          <p className={styles["introduce_myself"]}>컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다.</p>
        

          <h3 className={styles["introduce_title"]}>연락처</h3>
          <ul>
            <li>Email: sominjung1116@gmail.com</li>
            <li>Phone: 010-5615-8474</li>
            <li>instagram: <a href="https://www.instagram.com/__z1siim">https://www.instagram.com/__z1siim</a></li>
            <li className={styles["git_center"]}>github: <a href="https://github.com/TW1OO">github.com/TW1OO</a><a href="https://github.com/TW1OO"><img className={styles["mark_size"]} src="https://img.icons8.com/p1em/1200/github.jpg"></img></a></li>
          </ul>

          <h3 className={styles["introduce_title"]}>관심 기술</h3>
          <ul>
            <li>React</li>
            <li>ReactNative</li>
            <li>JavaScript</li>
          </ul>

          <h3 className={styles["introduce_title"]}>한 마디</h3>
          <p className={styles["introduce_last"]}>열심히 하겠습니다.</p>
        </div>

        <div className={styles["profile_infomation"]}>
          <h2 className={styles["name"]}>이도은</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["join_club"]}>DAU_DSIS</p>

          <h3 className={styles["introduce_title"]}>자기소개</h3>
          <p className={styles["introduce_myself"]}>안녕하세요! 말하는 감자입니다. 잘부탁드립니다. 배움에는 끝이없다..!</p>
        

          <h3 className={styles["introduce_title"]}>연락처</h3>
          <ul>
            <li>Email: dodo55860@gmail.com</li>
            <li>Phone: 010-2686-5586</li>
            <li>Website: <a href="https://www.google.com/">구글로 이동</a></li>
          </ul>

          <h3 className={styles["introduce_title"]}>관심 기술</h3>
          <ul>
            <li>HTML / CSS</li>
            <li>JavaScript</li>
            <li>React (학습 중)</li>
          </ul>

          <h3 className={styles["introduce_title"]}>한 마디</h3>
          <p className={styles["introduce_last"]}>팀원들에게 든든한 개발자가 되고십습니다.</p>
        </div>

        <div className={styles["profile_infomation"]}>
          <h2 className={styles["name"]}>정서윤</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["join_club"]}>DAU_DSIS</p>

          <p>아직 준비 중입니다.</p>
        </div>

        <div className={styles["profile_infomation"]}>
          <h2 className={styles["name"]}>김아기사자</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["join_club"]}>likelion_univ</p>
          <p>아직 준비 중입니다.</p>
        </div>

        <div className={styles["profile_infomation"]}>
          <h2 className={styles["name"]}>최아기사자</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["join_club"]}>likelion_univ</p>
          <p>아직 준비 중입니다.</p>
        </div>
      </div>

    </div>
  );
}
