// week8 과제(jsx -> tsx 마이그레이션) 정정본의 도메인 타입 모음.
// week8 리뷰의 2-2(Member/MemberItem 분리 의도), 2-4(as const + 리터럴 유니온)를 반영.

// 1) 리터럴 유니온 패턴 - as const로 동결하고 (typeof ARR)[number]로 유니온 추출
//    이렇게 하면 ROLES 배열에 새 값을 추가/제거하는 순간 Role 유니온도 같이 바뀐다.
export const ROLES = ["Frontend", "Backend", "Design"] as const;
export type Role = (typeof ROLES)[number]; // "Frontend" | "Backend" | "Design"

export const BADGES = [
  "React",
  "JavaScript",
  "Node.js",
  "Figma",
  "CSS Grid",
  "GraphQL",
] as const;
export type Badge = (typeof BADGES)[number];

// 2) Member - members.ts의 정적 데이터 모양 (id/createdAt 없음, isMe 선택)
//    초기 데이터 단계라 런타임에서 부여되는 필드를 갖지 않는다.
export interface Member {
  name: string;
  role: Role;
  intro: string;
  description: string;
  image: string;
  badge: string;
  isMe?: boolean;
  club: string;
  email: string;
  phone: string;
  website: string;
  comment: string;
}

// 3) MemberItem - 런타임에서 메모리에 들어가는 카드 (id/createdAt 부여, isMe 확정)
//    Member를 extends해서 공통 필드 재사용 + 추가 필드만 명시한다.
export interface MemberItem extends Member {
  id: string;
  isMe: boolean;
  createdAt: number;
}

// 4) FormData - 폼 입력값 (id/isMe/createdAt은 제출 시점에 부여)
export interface AddMemberForm {
  name: string;
  role: Role;
  badge: string;
  intro: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  image: string;
  comment: string;
}

// 5) 외부 API (randomuser.me) 응답 모양
export interface RandomUser {
  login: { uuid: string };
  name: { first: string; last: string };
  location: { country: string; city: string };
  picture: { large: string };
  email: string;
  phone: string;
}

export interface RandomUserResponse {
  results: RandomUser[];
}

// 6) fetchRandomMembers의 모드 - 유니온 타입
export type FetchMode = "add" | "replace";
