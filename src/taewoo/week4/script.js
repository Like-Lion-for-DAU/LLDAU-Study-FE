import idyJPG from "../../assets/doyoung/week2/idy.jpg";
import jsmPNG from "../../assets/doyoung/week2/jsm.png";
import { useState, useEffect } from "react";

const emptyForm = { name: "", part: "Frontend", skills: "", introduce: "", introduceDetail: "", email: "", phone: "", website: "", last: "" };
const randomParts = ["Frontend", "Backend", "PM", "Design"];
const randomSkills = ["HTML / CSS", "JavaScript", "React", "Node.js", "Python", "Django", "Flask", "TypeScript", "GraphQL", "Docker"];
const randomLast = [
  "열심히 배우고 있습니다!",
  "프론트엔드 개발자로 성장하고 싶습니다.",
  "팀원들과 함께 멋진 프로젝트를 만들고 싶습니다.",
]
const randomIntroduce = [
  "안녕하세요! 새로운 멤버입니다. 잘 부탁드립니다!",
  "프론트엔드 개발에 관심이 많습니다. 열심히 배우겠습니다!",
  "멋쟁이사자처럼에서 좋은 경험 쌓고 싶습니다.",
]

const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validateWebsite = (v) => /^https?:\/\/.+\..+/.test(v);
const validatePhone = (v) => /^010-\d{3,4}-\d{4}$/.test(v);
const validators = { email: validateEmail, website: validateWebsite, phone: validatePhone };

export function useFormData() {
  const [formData, setFormData] = useState(emptyForm);
  const [touched, setTouched] = useState({});

  const handleInput = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid =
    Object.values(formData).every((v) => v.trim() !== "") &&
    validateEmail(formData.email) &&
    validateWebsite(formData.website) &&
    validatePhone(formData.phone);

  const warn = (field) => touched[field] && !formData[field].trim();
  const warnFormat = (field) =>
    touched[field] && !!formData[field].trim() && validators[field] && !validators[field](formData[field]);

  const reset = () => { setFormData(emptyForm); setTouched({}); };

  return { formData, setFormData, handleInput, isFormValid, warn, warnFormat, reset };
}

export const members = [
  {
    name: "김주완",
    part: "Frontend",
    intro: "성실히 배우고 싶은 학생입니다.",
    club: "DAU_DSIS",
    badge: "HTML/CSS",
    image: "https://i.namu.wiki/i/eThT8CYFzrGi-QEREijNJdiceYKYXYjArupDY07S2Gxlo0CZDO2cQyWWnDXHfqemvizFtSh0SRScxaIpKR-xZA.gif",
    introduce: ["컴퓨터공학과 1학년입니다.", "웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다."],
    contact: { email: "mmnnbbnn070910@gmail.com", phone: "010-9041-1287", website: { label: "Likelion main page", url: "https://likelion.net/" } },
    skills: ["HTML/CSS", "JavaScript", "React(학습 중)"],
    last: "성실히 배워서 웹개발 마스터가 되고 싶습니다.",
  },
  {
    name: "임도영",
    part: "Frontend",
    intro: "아기사자 14기 프론트엔드 임도영입니다.",
    club: "DAU_DSIS",
    badge: "HTML / CSS",
    image: idyJPG,
    introduce: ["동아대 26학번 컴퓨터공학과, 아기사자 14기 임도영입니다. 이번 활동을 통해 많이 공부하며, 공부한 것을 활동 및 대회 참여를 통해 활용해나가며 경험과 기술을 쌓기 위해 노력하겠습니다. 앞으로 잘 부탁드립니다."],
    contact: { email: "dlaehdud342@naver.com", phone: "010-3516-6306", website: { label: "https://www.google.com/", url: "https://www.google.com/" } },
    skills: ["HTML / CSS", "JavaScript", "React", "JAVA", "C / C++"],
    last: "꾸준히 노력하고 적극적인 참여를 통해 성장하는 개발자가 되겠습니다.",
  },
  {
    name: "김나함",
    part: "Frontend",
    intro: "분야를 넘나들며 성장하는 개발자입니다.",
    club: "DAU_DSIS",
    badge: "HTML / CSS",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s",
    introduce: ["동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다."],
    contact: { email: "naham9488@gmail.com", phone: "010-3626-9488", website: { label: "@kim_naham", url: "https://www.instagram.com/kim_naham/" } },
    skills: ["HTML / CSS", "JavaScript"],
    last: "부족한 점은 많지만 포기하지 않고 계속 노력하여 성장하는 아기사자가 되겠습니다!",
  },
  {
    name: "백태우",
    part: "Frontend",
    intro: "I'm Empty Stack Junior :(",
    club: "DAU_DSIS",
    badge: "NLP",
    image: "https://i.pinimg.com/236x/ab/58/35/ab58355b3cc43e8649ef972985205330.jpg",
    introduce: ["AI학과지만 FullStack을 목표하기때문에 Frontend 짱 먹어보겠습니다"],
    contact: { email: "btu0414@gmail.com", phone: "010-4564-4725", website: { label: "www.acmicpc.net", url: "https://www.acmicpc.net/" }, github: "https://github.com/TW1OO" },
    skills: ["NLP", "LLM", "python"],
    last: "모두가 원하는 개발자가 되겠습니다.",
  },
  {
    name: "정소민",
    part: "Frontend",
    intro: "컴퓨터공학과 25학번 정소민입니다.",
    club: "DAU_DSIS",
    badge: "React",
    image: jsmPNG,
    introduce: ["컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다."],
    contact: { email: "sominjung1116@gmail.com", phone: "010-5615-8474", website: { label: "https://www.instagram.com/__z1siim", url: "https://www.instagram.com/__z1siim" } },
    skills: ["React", "ReactNative", "JavaScript"],
    last: "열심히 하겠습니다.",
  },
  {
    name: "이도은",
    part: "Frontend",
    intro: "열심히 배우는 프론트엔드 개발자입니다!",
    club: "DAU_DSIS",
    badge: "HTML / CSS",
    image: "https://i.pinimg.com/736x/4f/6a/e8/4f6ae87f63609f8d7f1f38b3617cbe1c.jpg",
    introduce: ["안녕하세요! 말하는 감자입니다. 잘부탁드립니다. 배움에는 끝이없다..!"],
    contact: { email: "dodo55860@gmail.com", phone: "010-2686-5586", website: { label: "구글로 이동", url: "https://www.google.com/" } },
    skills: ["HTML / CSS", "JavaScript", "React (학습 중)"],
    last: "팀원들에게 든든한 개발자가 되고싶습니다.",
  },
  {
    name: "정서윤",
    part: "Frontend",
    intro: "멋사대학 14기 아기사자",
    club: "DAU_DSIS",
    badge: "Null",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s",
    introduce: ["아직 준비 중입니다."],
    contact: null,
    skills: null,
    last: null,
  },
  {
    name: "김아기사자",
    part: "Frontend",
    intro: "구조적인 UI를 고민하는 프론트엔드 개발자입니다.",
    club: "likelion_univ",
    badge: "React",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s",
    introduce: ["아직 준비 중입니다."],
    contact: null,
    skills: null,
    last: null,
  },
  {
    name: "최아기사자",
    part: "Frontend",
    intro: "컴포넌트 단위 설계에 흥미가 있습니다.",
    club: "likelion_univ",
    badge: "TypeScript",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s",
    introduce: ["아직 준비 중입니다."],
    contact: null,
    skills: null,
    last: null,
  },
];

export function usePageScrollDown(selected, setSelected) {
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
}



export async function randomResult(number) {
  const fetchURL = `https://randomuser.me/api/?results=${number}&nat=us,gb,ca,au,nz`;
  const res = await fetch(fetchURL);
  const data = await res.json();
  return data.results;
}

export function randomNewMember(user) {
  const randomPart = randomParts[Math.floor(Math.random() * randomParts.length)];
  const skillspoint = parseInt(Math.random() * (randomSkills.length - 3)) + 1;
  return {
    name: `${user.name.first} ${user.name.last}`,
    part: randomPart,
    intro: `${randomPart} · ${user.location.country} ${user.location.state}에서 합류했어요!`,
    club: "랜덤 유저 클럽",
    badge: randomSkills[skillspoint],
    image: user.picture.large,
    introduce: [`${user.name.first} ${user.name.last}입니다.`, `저는 ${randomPart}입니다.`, `현재 ${user.location.country} ${user.location.state}에 살고 있습니다.`],
    contact: { email: user.email, phone: user.phone, website: { label: "Random User Profile", url: user.picture.large } },
    skills: randomSkills.slice(skillspoint, skillspoint + 3),
    last: randomLast[parseInt(Math.random() * randomLast.length)],
  };
}

export async function pushRandomMembers() {
  const users = await randomResult(1);
  const user = users[0];
  const randomPart = randomParts[parseInt(Math.random() * randomParts.length)];
  const skillspoint = parseInt(Math.random() * (randomSkills.length - 3));
  const selectedSkills = randomSkills.slice(skillspoint, skillspoint + 3);
  const randomPhone = `010-${String(parseInt(Math.random() * 9000) + 1000)}-${String(parseInt(Math.random() * 9000) + 1000)}`;

  return {
    name: `${user.name.first} ${user.name.last}`,
    part: randomPart,
    skills: selectedSkills.join(", "),
    introduce: randomIntroduce[parseInt(Math.random() * randomIntroduce.length)],
    introduceDetail: `${user.location.city}에서 왔습니다. ${randomPart} 분야에 관심이 많습니다.`,
    email: user.email,
    phone: randomPhone,
    website: `https://randomuser.me`,
    last: randomLast[parseInt(Math.random() * randomLast.length)],
  };
}