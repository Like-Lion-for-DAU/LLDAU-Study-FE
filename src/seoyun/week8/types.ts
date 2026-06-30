// 도메인 모델 + 외부 API 응답 형태.
// lions.ts 와 Page.tsx 가 함께 import 해서 Member 정의를 한 곳에서 공유한다.

export type Part = "Frontend" | "Backend" | "Design";

export interface Member {
  id: number;
  name: string;
  part: Part;
  badge: string;
  intro: string;
  image: string;
  isMine: boolean;
  club: string;
  about: string;
  skills: string[];
  email: string;
  phone: string;
  website: string;
  quote: string;
}

// randomuser.me API 응답 (inc=name,email,phone,picture,login 으로 요청한 필드만)
export interface RandomUser {
  name: { first: string; last: string };
  email: string;
  phone: string;
  picture: { large: string; medium: string; thumbnail: string };
  login: { username: string };
}