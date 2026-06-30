# 타입스크립트

## 타입스크립트란?
자바스크립트는 변수의 자료형을 미리 정하지 않아도 되는언어
타입스크립트는 자바스크립트에 type을 추가한 언어, 실행하기 전에 오류를 알려줌
type은 데이터의 종류를 의미한다.
string : 문자열 , number : 숫자, boolean : 참거짓, ...

## interface
interface는 객체의 설계도

 member.js의 
 ```jsx
  {
    id: 1,
    name: "정소민",
    role: "Frontend",
    intro: "컴퓨터공학과 25학번 정소민입니다.",
    image: jsm,
    badge: "React",
    club: "디스이즈",
    bio: "컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다.",
    email: "sominjung1116@gmail.com",
    phone: "010-5615-8474",
    website: "https://www.instagram.com/__z1siim",
    skills: ["React", "ReactNative", "JavaScript"],
    motto: "열심히 하겠습니다.",
    isMe: true,
  },
```
를 바꾸면

```tsx
interface Member {
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
```

## props

 ```jsx
function SummaryCard({ member }) {

}
```

 ```tsx
interface Props{
    member:Member;
}

function SummaryCard({
    member
}:Props){

}
```

## useState
 ```jsx
const [isFormOpen, setIsFormOpen] = useState(false);
const [asyncStatus, setAsyncStatus] = useState("idle");
```
 ```tsx
const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
type AsyncStatus = "idle" | "loading" | "success" | "fail";
const [asyncStatus, setAsyncStatus] = useState<AsyncStatus>("idle");
```

## useRef
 ```jsx
const fillControllerRef = useRef(null);
const statusResetTimerRef = useRef(null);
const lastActionRef = useRef(null);
```
 ```tsx
const fillControllerRef = useRef<AbortController | null>(null);
const statusResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const lastActionRef = useRef<(() => void) | null>(null);
```



## react에서 typescript를 쓰는 이유
자바스크립트는 실행해야지 오류를 알 수 있고 타입스크립트는 저장하는 순간 알려줘서 오류를 알 수 있다.