export interface Member {
  id: number;
  name: string;
  role: string;
  intro: string;
  image: string;
  badge: string;
  club: string;
  bio: string;
  email: string;
  phone: string;
  website: string;
  skills: string[];
  motto: string;
  isMe?: boolean;
}

export interface MemberFormData {
  name: string;
  part: string;
  skills: string;
  intro: string;
  bio: string;
  club: string;
  email: string;
  phone: string;
  website: string;
  motto: string;
}

export interface RandomUser {
  name: {
    first: string;
    last: string;
  };
  location: {
    city: string;
    country: string;
  };
  picture: {
    large: string;
  };
  email: string;
  phone: string;
}