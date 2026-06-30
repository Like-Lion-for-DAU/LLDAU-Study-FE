import taeyeopImg from "../../assets/juwan/taeyeop.png";
import doeunImg from "../../assets/juwan/doeun.jpeg";
import doyoungImg from "../../assets/juwan/doyoung.jpg";
import juwanImg from "../../assets/juwan/juwan.gif";
import nahamImg from "../../assets/juwan/naham.png";
import seoyunImg from "../../assets/juwan/seoyun.png";
import sominImg from "../../assets/juwan/somin.png";
import taewooImg from "../../assets/juwan/taewoo.jpg";

export const initialLions = [
  {
    id: 1,
    name: "이태엽",
    part: "Frontend",
    skills: ["React", "JavaScript", "TypeScript"],
    oneLineIntro: "나 이태엽인데",
    description: "나는 태엽",
    oneWord: "내 이름이 뭐라고",
    imgSrc: taeyeopImg,
    organization: "LION TRACK",
    isMe: true,
    contacts: {
      email: "xoduq020827@gmail.com",
      phone: "010-3312-6819",
      website: "https://github.com/2taeyeop",
    },
  },
  {
    id: 2,
    name: "이도은",
    part: "Frontend",
    skills: ["HTML / CSS", "JavaScript", "React (학습 중)"],
    oneLineIntro: "열심히 배우는 프론트엔드 개발자입니다!",
    description:
      "안녕하세요! 말하는 감자입니다. 잘 부탁드립니다. 배움에는 끝이 없다고 생각하며, 스펀지처럼 이해하려고 노력하고 있습니다. 모르는 게 너무 많지만 하나하나 차근차근 배워가며 팀원들에게 도움이 되는 개발자가 되고 싶습니다.",
    oneWord: "팀원들에게 든든한 개발자가 되고 싶습니다.",
    imgSrc: doeunImg,
    organization: "LION TRACK",
    isMe: false,
    contacts: {
      email: "dodo55860@gmail.com",
      phone: "010-2686-5586",
      website: "https://google.com",
    },
  },
  {
    id: 3,
    name: "임도영",
    part: "Frontend",
    skills: ["HTML / CSS", "JavaScript", "React", "JAVA", "C / C++"],
    oneLineIntro: "아기사자 14기 프론트엔드 임도영입니다.",
    description:
      "동아대 26학번 컴퓨터공학과, 아기사자 14기 임도영입니다. 이번 활동을 통해 많이 공부하며, 공부한 것을 활동 및 대회 참여를 통해 활용해나가며 경험과 기술을 쌓기 위해 노력하겠습니다. 앞으로 잘 부탁드립니다.",
    oneWord:
      "꾸준히 노력하고 적극적인 참여를 통해 성장하는 개발자가 되겠습니다.",
    imgSrc: doyoungImg,
    organization: "디스이즈",
    isMe: false,
    contacts: {
      email: "dlaehdud342@naver.com",
      phone: "010-3516-6306",
      website: "https://www.google.com",
    },
  },
  {
    id: 4,
    name: "김주완",
    part: "Frontend",
    skills: ["HTML / CSS", "JavaScript", "React (학습 중)"],
    oneLineIntro: "성실히 배우고 싶은 학생입니다.",
    description:
      "컴퓨터공학과 1학년입니다. 웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다. 프론트엔드 개발자로 성장하고 싶은 학생이고, 작은 부분부터 꼼꼼히 챙기는 습관을 들이고 있습니다.",
    oneWord: "성실히 배워서 웹개발 마스터가 되고 싶습니다.",
    imgSrc: juwanImg,
    organization: "LION TRACK",
    isMe: false,
    contacts: {
      email: "mmnnbbnn070910@gmail.com",
      phone: "010-9041-1287",
      website: "https://likelion.net/",
    },
  },
  {
    id: 5,
    name: "김나함",
    part: "Frontend",
    skills: ["HTML / CSS", "JavaScript"],
    oneLineIntro: "분야를 넘나들며 성장하는 개발자입니다.",
    description:
      "동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다. 새로운 분야지만 포기하지 않고 꾸준히 학습하며 성장해나가고 있습니다.",
    oneWord:
      "부족한 점은 많지만 포기하지 않고 계속 노력하여 성장하는 아기사자가 되겠습니다!",
    imgSrc: nahamImg,
    organization: "멋쟁이사자처럼 아기사자 14기",
    isMe: false,
    contacts: {
      email: "naham9488@gmail.com",
      phone: "010-3626-9488",
      website: "https://www.instagram.com/kim_naham",
    },
  },
  {
    id: 6,
    name: "정서윤",
    part: "Frontend",
    skills: [
      "TypeScript",
      "SSR/SSG",
      "Utility-First CSS",
      "Server State Management",
    ],
    oneLineIntro: "열심히 배워가고 있는 프론트엔드 개발자입니다!",
    description:
      "안녕하세요, 프론트엔드를 맡고 있는 07년생 26학번 컴퓨터공학과 정서윤입니다. 아직 부족한 점이 많지만, 배우는 과정 자체를 즐기며 꾸준히 성장하고 있습니다. MBTI는 ESTP이고, 이번 멋사 리그에는 '쫄?'이라는 게임으로 참여했습니다. 많이 배우고 경험하는 것을 목표로 열심히 해보겠습니다. 감사합니다!",
    oneWord:
      "기초를 탄탄히 다지며, 맡은 역할을 끝까지 책임지는 개발자가 되겠습니다.",
    imgSrc: seoyunImg,
    organization: "디스이즈",
    isMe: false,
    contacts: {
      email: "t01021124995@gmail.com",
      phone: "010-3846-5638",
      website: "https://github.com/dkjksd",
    },
  },
  {
    id: 7,
    name: "정소민",
    part: "Frontend",
    skills: ["React", "React Native", "JavaScript"],
    oneLineIntro: "컴퓨터공학과 25학번 정소민입니다.",
    description:
      "컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있으며, React와 React Native를 학습하며 모바일까지 아우르는 개발을 목표로 하고 있습니다. 사용자에게 편리한 경험을 만드는 것에 관심이 많습니다.",
    oneWord: "열심히 하겠습니다.",
    imgSrc: sominImg,
    organization: "디스이즈",
    isMe: false,
    contacts: {
      email: "sominjung1116@gmail.com",
      phone: "010-5615-8474",
      website: "https://www.instagram.com/__z1siim",
    },
  },
  {
    id: 8,
    name: "백태우",
    part: "Frontend",
    skills: ["NLU / NLG", "NLP", "LLM"],
    oneLineIntro: "I'm Empty Stack Junior :(",
    description:
      "AI학과이지만 Full Stack Developer를 목표로 하고 있기 때문에 Frontend에서 짱 먹어보겠습니다. NLP/LLM 등 자연어 처리를 메인으로 공부하면서도, 풀스택을 향한 학습을 꾸준히 이어가고 있습니다.",
    oneWord: "모두가 원하는 개발자가 되어보겠습니다.",
    imgSrc: taewooImg,
    organization: "DAU_DSIS",
    isMe: false,
    contacts: {
      email: "btu0414@gmail.com",
      phone: "010-4564-4725",
      website: "https://www.acmicpc.net/",
    },
  },
];
