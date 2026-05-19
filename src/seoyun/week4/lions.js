import pfp from "./pfp.png";

export const PARTS = ["Frontend", "Backend", "Design"];

export const SKILLS_BY_PART = {
  Frontend: [
    "React",
    "Vue.js",
    "TypeScript",
    "CSS Grid",
    "Tailwind",
    "Next.js",
    "Svelte",
    "HTML/CSS",
  ],
  Backend: [
    "Node.js",
    "Spring",
    "Django",
    "FastAPI",
    "PostgreSQL",
    "Redis",
    "Docker",
    "GraphQL",
  ],
  Design: [
    "Figma",
    "Sketch",
    "Adobe XD",
    "Zeplin",
    "Framer",
    "Principle",
    "Lottie",
    "InVision",
  ],
};

export const ABOUT_PRESETS = [
  '4주차 미션에서 fetch로 데이터를 불러와 상태(lions)를 업데이트하는 연습을 하고 있습니다. 비동기(async/await)로 받아온 데이터를 map으로 변환해 UI에 반영하는 흐름을 이해하려고 합니다. 목표는 "데이터가 바뀌면 UI를 다시 그리는 구조"를 자연스럽게 체득하는 것입니다.',
  "외부 API를 활용해 동적으로 데이터를 불러오는 방식을 학습하고 있습니다. 비동기 처리와 상태 관리의 중요성을 배우면서, 더 나은 사용자 경험을 만드는 개발자가 되려고 노력하고 있습니다.",
  "JavaScript의 비동기 처리 방식인 Promise와 async/await를 깊이 이해하고 싶습니다. fetch API를 통해 실시간 데이터를 화면에 반영하는 흐름을 익히는 중입니다.",
  "데이터 중심의 UI 설계에 관심이 생겼습니다. 서버에서 받아온 정보를 가공해 화면에 뿌려주는 과정이 재미있고, 앞으로 더 다양한 API를 다뤄보고 싶습니다.",
];

export const QUOTE_PRESETS = [
  "데이터가 바뀌면 UI도 바뀐다!",
  "비동기를 정복하면 웹이 살아 숨쉰다!",
  "코드보다 흐름을 이해하자.",
  "작은 기능 하나가 큰 경험을 만든다.",
];

export const initialMembers = [
  {
    id: 1,
    name: "정서윤",
    part: "Frontend",
    badge: "TypeScript",
    intro: "열심히 배워가고있는 프론트엔드 개발자입니다!",
    image: pfp,
    isMine: true,
    club: "디스이즈",
    about:
      "안녕하세요, 프론트엔드를 맡고 있는 07년생 26학번 컴퓨터공학과 정서윤입니다. 아직 부족한 점이 많지만, 배우는 과정 자체를 즐기며 꾸준히 성장하고 있습니다. MBTI는 ESTP이고, 이번 멋사 리그에는 '쫄?'이라는 게임으로 참여했습니다. 많이 배우고 경험하는 것을 목표로 열심히 해보겠습니다. 감사합니다!",
    skills: [
      "TypeScript — 타입 기반 개발",
      "SSR/SSG — 서버 사이드 렌더링",
      "Utility-First CSS — 효율적인 스타일링",
      "Server State Management — 데이터 관리 최적화",
    ],
    email: "t01021124995@gmail.com",
    phone: "010-3846-5638",
    website: "https://github.com/dkjksd",
    quote: "기초를 탄탄히 다지며, 맡은 역할을 끝까지 책임지는 개발자가 되겠습니다.",
  },
  {
    id: 2,
    name: "김아기사자",
    part: "Frontend",
    badge: "React",
    intro: "구조적인 UI를 고민하는 프론트엔드 개발자입니다.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=280&fit=crop",
    isMine: false,
    club: "LION TRACK",
    about:
      "HTML과 CSS를 처음 배우면서 화면이 어떻게 구성되는지에 흥미를 느꼈습니다. 시맨틱 태그의 중요성과 CSS의 계층적 구조를 깊이 있게 학습하면서, 사용자 경험을 향상시키는 구조적인 UI 설계에 매력을 느끼고 있습니다.",
    skills: ["React", "JavaScript", "CSS Animation"],
    email: "lionkim@example.com",
    phone: "010-1234-5678",
    website: "https://example.com",
    quote: "기본기를 탄탄히 다지는 개발자가 되고 싶습니다.",
  },
  {
    id: 3,
    name: "박아기사자",
    part: "Backend",
    badge: "Java",
    intro: "안정적인 서버 구조에 관심이 많습니다.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=280&fit=crop",
    isMine: false,
    club: "LION TRACK",
    about:
      "서버 개발을 배우며 데이터가 오가는 흐름에 관심을 가지게 되었습니다. 대용량 트래픽을 견딜 수 있는 서버 구축과 데이터베이스 최적화에 관심이 많습니다.",
    skills: ["Java", "Spring", "Database"],
    email: "lionpark@example.com",
    phone: "010-2345-6789",
    website: "https://backend.dev",
    quote: "안정적인 서비스를 만드는 개발자가 되고 싶습니다.",
  },
  {
    id: 4,
    name: "이아기사자",
    part: "Frontend",
    badge: "Figma",
    intro: "사용자 관점에서 디자인을 고민합니다.",
    image:
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&h=280&fit=crop",
    isMine: false,
    club: "LION TRACK",
    about:
      "사용자 경험을 중심에 두고 디자인을 고민합니다. UX 리서치와 프로토타이핑에 관심을 갖고 있습니다.",
    skills: ["Figma", "Adobe XD", "Prototyping"],
    email: "lionlee@example.com",
    phone: "010-3456-7890",
    website: "https://design.io",
    quote: "사용자 중심의 디자이너가 되겠습니다.",
  },
  {
    id: 5,
    name: "최아기사자",
    part: "Frontend",
    badge: "TypeScript",
    intro: "컴포넌트 단위 설계에 흥미가 있습니다.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=280&fit=crop",
    isMine: false,
    club: "LION TRACK",
    about:
      "컴포넌트 단위로 UI를 설계하는 것에 흥미를 느끼고 있습니다. 재사용 가능한 컴포넌트를 만들어 생산성을 높이고 싶습니다.",
    skills: ["TypeScript", "React", "Storybook"],
    email: "lionchoi@example.com",
    phone: "010-4567-8901",
    website: "https://typescript.dev",
    quote: "타입 안정성을 중시하는 개발자가 되겠습니다.",
  },
  {
    id: 6,
    name: "정아기사자",
    part: "Backend",
    badge: "Node.js",
    intro: "데이터 흐름을 명확히 하는 개발을 지향합니다.",
    image:
      "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=400&h=280&fit=crop",
    isMine: false,
    club: "LION TRACK",
    about:
      "데이터 흐름을 명확히 이해하고 이를 코드로 표현하는 것을 중요하게 생각합니다. RESTful API 설계와 클린 코드를 지향합니다.",
    skills: ["Node.js", "Express", "MongoDB"],
    email: "lionjeong@example.com",
    phone: "010-5678-9012",
    website: "https://node.dev",
    quote: "깔끔한 API를 설계하는 개발자가 되겠습니다.",
  },
  {
    id: 7,
    name: "오아기사자",
    part: "Frontend",
    badge: "Sketch",
    intro: "디자인 시스템에 관심이 많습니다.",
    image:
      "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=280&fit=crop",
    isMine: false,
    club: "LION TRACK",
    about:
      "디자인 시스템을 구축하고 일관된 UI 규칙을 만드는 것에 관심이 있습니다. 컴포넌트 라이브러리 구축을 목표로 합니다.",
    skills: ["Sketch", "FE Token", "Zeplin"],
    email: "lionoh@example.com",
    phone: "010-6789-0123",
    website: "https://designsystem.io",
    quote: "디자인 시스템으로 팀을 하나로 묶겠습니다.",
  },
  {
    id: 8,
    name: "강아기사자",
    part: "Frontend",
    badge: "CSS Grid",
    intro: "레이아웃 구현에 강점을 가지고 있습니다.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=280&fit=crop",
    isMine: false,
    club: "LION TRACK",
    about:
      "CSS Grid와 Flexbox를 활용한 복잡한 레이아웃 구현에 강점을 가지고 있습니다. 반응형 웹 디자인을 지향합니다.",
    skills: ["CSS Grid", "Flexbox", "Accessibility"],
    email: "lionkang@example.com",
    phone: "010-7890-1234",
    website: "https://layout.dev",
    quote: "레이아웃 전문가 개발자가 되겠습니다.",
  },
  {
    id: 9,
    name: "윤아기사자",
    part: "Backend",
    badge: "GraphQL",
    intro: "효율적인 API 설계를 고민합니다.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=280&fit=crop",
    isMine: false,
    club: "LION TRACK",
    about:
      "효율적인 API 설계와 데이터 쿼리 최적화에 관심이 있습니다. GraphQL을 통해 유연한 API를 구축하고 싶습니다.",
    skills: ["GraphQL", "Apollo Server", "PostgreSQL"],
    email: "lionyoon@example.com",
    phone: "010-8901-2345",
    website: "https://graphql.dev",
    quote: "데이터 중심의 API 전문가가 되겠습니다.",
  },
  {
    id: 10,
    name: "한아기사자",
    part: "Frontend",
    badge: "Typography",
    intro: "타이포그래피와 여백의 미학을 추구합니다.",
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=280&fit=crop",
    isMine: false,
    club: "LION TRACK",
    about:
      "타이포그래피와 여백을 통해 콘텐츠에 집중할 수 있는 UI를 만드는 것을 좋아합니다.",
    skills: ["Typography", "Motion FE", "Brand Identity"],
    email: "lionhan@example.com",
    phone: "010-9012-3456",
    website: "https://typography.design",
    quote: "디테일에 강한 디자이너가 되겠습니다.",
  },
];

export const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=280&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=280&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=280&fit=crop",
];
