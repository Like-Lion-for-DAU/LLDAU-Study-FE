import styles from "./Page.module.css";
import idyJPG from "../../assets/doyoung/week2/idy.jpg";
import jsmPNG from "../../assets/doyoung/week2/jsm.png";
import { useState, useEffect } from "react";

export const members = [
  {
    name: "김주완",
    part: "Frontend",
    club: "DAU_DSIS",
    badge: "HTML/CSS",
    image: "https://i.namu.wiki/i/eThT8CYFzrGi-QEREijNJdiceYKYXYjArupDY07S2Gxlo0CZDO2cQyWWnDXHfqemvizFtSh0SRScxaIpKR-xZA.gif",
    intro: ["컴퓨터공학과 1학년입니다.", "웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다."],
    contact: { email: "mmnnbbnn070910@gmail.com", phone: "010-9041-1287", website: { label: "Likelion main page", url: "https://likelion.net/" } },
    skills: ["HTML/CSS", "JavaScript", "React(학습 중)"],
    last: "성실히 배워서 웹개발 마스터가 되고 싶습니다.",
  },
  {
    name: "임도영",
    part: "Frontend",
    club: "DAU_DSIS",
    badge: "HTML / CSS",
    image: idyJPG,
    intro: ["동아대 26학번 컴퓨터공학과, 아기사자 14기 임도영입니다. 이번 활동을 통해 많이 공부하며, 공부한 것을 활동 및 대회 참여를 통해 활용해나가며 경험과 기술을 쌓기 위해 노력하겠습니다. 앞으로 잘 부탁드립니다."],
    contact: { email: "dlaehdud342@naver.com", phone: "010-3516-6306", website: { label: "https://www.google.com/", url: "https://www.google.com/" } },
    skills: ["HTML / CSS", "JavaScript", "React", "JAVA", "C / C++"],
    last: "꾸준히 노력하고 적극적인 참여를 통해 성장하는 개발자가 되겠습니다.",
  },
  {
    name: "김나함",
    part: "Frontend",
    club: "DAU_DSIS",
    badge: "HTML / CSS",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s",
    intro: ["동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다."],
    contact: { email: "naham9488@gmail.com", phone: "010-3626-9488", website: { label: "@kim_naham", url: "https://www.instagram.com/kim_naham/" } },
    skills: ["HTML / CSS", "JavaScript"],
    last: "부족한 점은 많지만 포기하지 않고 계속 노력하여 성장하는 아기사자가 되겠습니다!",
  },
  {
    name: "백태우",
    part: "Frontend",
    club: "DAU_DSIS",
    badge: "NLP",
    image: "https://i.pinimg.com/236x/ab/58/35/ab58355b3cc43e8649ef972985205330.jpg",
    intro: ["AI학과지만 FullStack을 목표하기때문에 Frontend 짱 먹어보겠습니다"],
    contact: { email: "btu0414@gmail.com", phone: "010-4564-4725", website: { label: "www.acmicpc.net", url: "https://www.acmicpc.net/" }, github: "https://github.com/TW1OO" },
    skills: ["NLP", "LLM", "python"],
    last: "모두가 원하는 개발자가 되겠습니다.",
  },
  {
    name: "정소민",
    part: "Frontend",
    club: "DAU_DSIS",
    badge: "NLP",
    image: jsmPNG,
    intro: ["컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다."],
    contact: { email: "sominjung1116@gmail.com", phone: "010-5615-8474", website: { label: "https://www.instagram.com/__z1siim", url: "https://www.instagram.com/__z1siim" }, github: "https://github.com/TW1OO" },
    skills: ["React", "ReactNative", "JavaScript"],
    last: "열심히 하겠습니다.",
  },
  {
    name: "이도은",
    part: "Frontend",
    club: "DAU_DSIS",
    badge: "HTML / CSS",
    image: "https://i.pinimg.com/736x/4f/6a/e8/4f6ae87f63609f8d7f1f38b3617cbe1c.jpg",
    intro: ["안녕하세요! 말하는 감자입니다. 잘부탁드립니다. 배움에는 끝이없다..!"],
    contact: { email: "dodo55860@gmail.com", phone: "010-2686-5586", website: { label: "구글로 이동", url: "https://www.google.com/" } },
    skills: ["HTML / CSS", "JavaScript", "React (학습 중)"],
    last: "팀원들에게 든든한 개발자가 되고싶습니다.",
  },
  {
    name: "정서윤",
    part: "Frontend",
    club: "DAU_DSIS",
    badge: "Null",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s",
    intro: ["아직 준비 중입니다."],
    contact: null,
    skills: null,
    last: null,
  },
  {
    name: "김아기사자",
    part: "Frontend",
    club: "likelion_univ",
    badge: "React",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s",
    intro: ["아직 준비 중입니다."],
    contact: null,
    skills: null,
    last: null,
  },
  {
    name: "최아기사자",
    part: "Frontend",
    club: "likelion_univ",
    badge: "TypeScript",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s",
    intro: ["아직 준비 중입니다."],
    contact: null,
    skills: null,
    last: null,
  },
];

export default function Week2Page() {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!selected) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleEsc);
    const original = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.documentElement.style.overflow = original;
    };
  }, [selected]);

  return (
    <div className={styles["week-page"]}>
      <h2>2주차</h2>

      <div className={styles["grid-container"]}>
 
        <div className={styles["main_profil"]}
        onClick={() => setSelected(members[0])}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>HTML/CSS</span>
          </p>
          <img className={styles["profile_image"]} src="https://i.namu.wiki/i/eThT8CYFzrGi-QEREijNJdiceYKYXYjArupDY07S2Gxlo0CZDO2cQyWWnDXHfqemvizFtSh0SRScxaIpKR-xZA.gif" />
          <h2 className={styles["name"]}>김주완</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>성실히 배우고 싶은 학생입니다.</p>
        </div>
 
        <div className={styles["main_profil"]}
        onClick={() => setSelected(members[1])}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>HTML / CSS</span>
          </p>
          <img className={styles["profile_image"]} src={idyJPG} />
          <h2 className={styles["name"]}>임도영</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>아기사자 14기 프론트엔드 임도영 입니다.</p>
        </div>
 
        <div className={styles["main_profil"]}
        onClick={() => setSelected(members[2])}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>HTML / CSS</span>
          </p>
          <img className={styles["profile_image"]} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s" />
          <h2 className={styles["name"]}>김나함</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>분야를 넘나들며 성장하는 개발자입니다.</p>
        </div>
 
        <div className={styles["main_profil"]}
        onClick={() => setSelected(members[3])}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>NLP</span>
          </p>
          <img className={styles["profile_image"]} src="https://i.pinimg.com/236x/ab/58/35/ab58355b3cc43e8649ef972985205330.jpg" />
          <h2 className={styles["name"]}>백태우</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>I'm Empty Stack Junior <b>:(</b></p>


        </div>
 
        <div className={styles["main_profil"]}
        onClick={() => setSelected(members[4])}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>React</span>
          </p>
          <img className={styles["profile_image"]} src={jsmPNG} />
          <h2 className={styles["name"]}>정소민</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>컴퓨터공학과 25학번 정소민입니다.</p>
        </div>
 
        <div className={styles["main_profil"]}
        onClick={() => setSelected(members[5])}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>HTML / CSS</span>
          </p>
          <img className={styles["profile_image"]} src="https://i.pinimg.com/736x/4f/6a/e8/4f6ae87f63609f8d7f1f38b3617cbe1c.jpg" />
          <h2 className={styles["name"]}>이도은</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>열심히 배우는 프론트엔드 개발자입니다!</p>
        </div>
 
        <div className={styles["main_profil"]}
        onClick={() => setSelected(members[6])}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>Null</span>
          </p>
          <img className={styles["profile_image"]} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s" />
          <h2 className={styles["name"]}>정소윤</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>멋사대학 14기 아기사자</p>
        </div>
 
        <div className={styles["main_profil"]}
        onClick={() => setSelected(members[7])}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>React</span>
          </p>
          <img className={styles["profile_image"]} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s" />
          <h2 className={styles["name"]}>김아기사자</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>구조적인 UI를 고민하는 프론트엔드 개발자입니다.</p>
        </div>
 
        <div className={styles["main_profil"]}
        onClick={() => setSelected(members[8])}>
          <p className={styles["badge"]}>
            <span className={styles["badge_space"]}>TypeScript</span>
          </p>
          <img className={styles["profile_image"]} src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s" />
          <h2 className={styles["name"]}>최아기사자</h2>
          <b className={styles["blue_rule"]}>Frontend</b>
          <p className={styles["line_introduce"]}>컴포넌트 단위 설계에 흥미가 있습니다.</p>
        </div>
 
      </div>
      {selected && (
        <div className={styles["modal_overlay"]}
        onClick={() => setSelected(null)}>
          <div className={styles["modal_content"]}
          onClick={(e) => e.stopPropagation()}>

            <h2 className={styles["name"]}>{selected.name}</h2>
            <b className={styles["blue_rule"]}>{selected.part}</b>
            <p className={styles["join_club"]}>{selected.club}</p>

            <hr className={styles["modal_divider"]} />

            {!selected.contact && !selected.skills && !selected.last ? (
              <p className={styles["introduce_myself"]}>아직 준비 중입니다.</p>
            ) : (
              <>

            <h3 className={styles["introduce_title"]}>자기소개</h3>
            {selected.intro.map((text, i) => (
              <p key={i} className={styles["introduce_myself"]}>{text}</p>
            ))}

            {(selected.contact.email || selected.contact.phone || selected.contact.website) && (
              <>
                <h3 className={styles["introduce_title"]}>연락처</h3>
                <ul>
                  {selected.contact.email && <li className={styles["list_style"]}>Email: {selected.contact.email}</li>}
                  {selected.contact.phone && <li className={styles["list_style"]}>Phone: {selected.contact.phone}</li>}
                  {selected.contact.website && (
                    <li className={styles["list_style"]}>Website: <a href={selected.contact.website.url}>{selected.contact.website.label}</a></li>
                  )}
                </ul>
              </>
            )}

            {selected.skills && (
              <>
                <h3 className={styles["introduce_title"]}>관심 기술</h3>
                <ul>
                  {selected.skills.map((skill, i) => (
                    <li key={i} className={styles["list_style"]}>{skill}</li>
                  ))}
                </ul>
              </>
            )}

            {selected.last && (
              <>
                <h3 className={styles["introduce_title"]}>한 마디</h3>
                <p className={styles["introduce_last"]}>{selected.last}</p>
              </>
            )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}