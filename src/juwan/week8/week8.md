# jsx -> tsx

# 1. 함수 반환

```jsx
export default function Week8App() {
  return ( ... );
}
```

```tsx
export default function Week8App(): JSX.Element {
  return ( ... );
}
```

- TypeScript에서는 함수가 뭘 반환하는지 명시할 수 있다고 하였다.
- jsx를 반환하는 함수는 jsx.Element를 붙여줘야 한다고 했다.
- 생략해도 typescript가 자동으로 해준다고 하지만, 명시적으로 써주는게 좋다고 한다.



# 2. 인터페이스 추가

```js
export const members = [ ... ];
```

```ts
export interface Member {
  name: string;
  role: string;
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
```

- interface는 어떤 타입이 있고 필드가 뭔지, 객체의 구조를 정의한다고 한다.
- 추가로 isMe?: boolean처럼 '?'가 붙으면 없어도 되는 필드라고 한다.



# 3. 배열 타입 명시

```js
export const members = [ ... ];
```

```ts
export const members: Member[] = [ ... ];
```

- Member[]은 타입의 배열이라는 뜻이라고 한다.
- 이렇게 안하면 배열 안에 잘못된 구조의 객체를 넣으면 바로 오류가 난다고 하는데, 이 부분은 잘 모르겠다..



# 4. import에 타입 추가

```jsx
import { members } from "./members";
```

```tsx
import { members, Member } from "./members";
```

- 'Member' interface를 다른 파일에서도 쓰려면 import를 해줘야 한다고 한다.



# 5. 상수에 타입 명시

```jsx
const roles = ["Frontend", "Backend", "Design"];
const badges = ["React", "JavaScript", "Node.js", "Figma", "CSS Grid", "GraphQL"];
```

```tsx
const roles: string[] = ["Frontend", "Backend", "Design"];
const badges: string[] = ["React", "JavaScript", "Node.js", "Figma", "CSS Grid", "GraphQL"];
```

- 문자열 배열인 것을 명시해야 한다고 한다. 이것도 TypeScript가 자동으로 추론해준다고 하는데 명시해야 더 명확하다고 한다.



# 6. FormData, MemberItem, RandomUser에 interface 추가

```tsx
interface FormData {
  name: string;
  role: string;
  badge: string;
  intro: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  image: string;
  comment: string;
}

interface MemberItem extends Member {
  id: string;
  isMe: boolean;
  createdAt: number;
}

interface RandomUser {
  login: { uuid: string };
  name: { first: string; last: string };
  location: { country: string; city: string };
  picture: { large: string };
  email: string;
  phone: string;
}
```

- FormData: 폼 입력값의 구조를 정의해주는 것
- MemberItem: Member를 기반으로 'id', 'isMe', 'cratedAt'을 추가한 타입이다.
- RandomUser: 외부 API의 randomuser.me에서 오는 데이터의 구조를 정해준다.



# 7. 제네릭 함수

```jsx
function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}
```

```tsx
function getRandomItem<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
```

- <T>가 제네릭인데, "어떤 타입이든 받을 수 있는 함수"를 만들 때 사용된다고 한다.
- 넣은 타입을 반환해준다고 함.
- 추가로 T는 임의의 이름이고 다른 걸 써도 되지만, T를 가장 많이 사용한다고 한다.



# 8. 함수 파라미터 타입 추가

```jsx
function makeLocalMember(member, order) { ... }
function makeRandomMember(user, order) { ... }
function userToFormData(user) { ... }
```

```tsx
function makeLocalMember(member: Member, order: number): MemberItem { ... }
function makeRandomMember(user: RandomUser, order: number): MemberItem { ... }
function userToFormData(user: RandomUser): FormData { ... }
```

-함수 파라미터에도 뒤에 타입을 붙인다고 한다.
- 함수 뒤에 변환 타입도 붙여야 한다.

# 9. useState 타입

```jsx
const [memberList, setMemberList] = useState(() => ...);
const [showForm, setShowForm] = useState(false);
const [statusText, setStatusText] = useState("준비 완료");
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const [formData, setFormData] = useState(EMPTY_FORM);
const [isFilling, setIsFilling] = useState(false);
const [fillError, setFillError] = useState("");
```

```tsx
const [memberList, setMemberList] = useState<MemberItem[]>(() => ...);
const [showForm, setShowForm] = useState<boolean>(false);
const [statusText, setStatusText] = useState<string>("준비 완료");
const [isLoading, setIsLoading] = useState<boolean>(false);
const [hasError, setHasError] = useState<boolean>(false);
const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
const [isFilling, setIsFilling] = useState<boolean>(false);
const [fillError, setFillError] = useState<string>("");
```

- useState<타입><초기값> 형태로 써야한다.



# 10. useRef 타입

```jsx
const nextOrderRef = useRef(0);
const latestControllerRef = useRef(null);
const lastRequestRef = useRef(null);
```

```tsx
const nextOrderRef = useRef<number>(0);
const latestControllerRef = useRef<AbortController | null>(null);
const lastRequestRef = useRef<(() => void) | null>(null);
const statusResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

- useRef<number>(0): 숫자를 담는 ref
- AbortController: 함수 또는 null, ()=>void는 아무것도 반환하지 않는 함수다.
- ReturnType<typeof setTimout>: setTimeout의 반환값 타입을 자동으로 가져와준다고 한다.



# 11. useParams 타입 명시

```jsx
const { memberId } = useParams();
```

```tsx
const { memberId } = useParams<{ memberId: string }>();
```

- URL 파라미터의 타입을 명시해야 하고, memberID가 string인 것을 알려준다고 한다.



# 12. useMemo 타입 명시

```jsx
const visibleMembers = useMemo(() => { ... }, [...]);
```

```tsx
const visibleMembers = useMemo<MemberItem[]>(() => { ... }, [...]);
```

- useMemo가 반환하는 값의 타입을 명시한다.



# 13. fetch 응답 타입 명시

```jsx
.then((data) => {
  const randomMembers = data.results.map(...);
})
```

```tsx
.then((data: { results: RandomUser[] }) => {
  const randomMembers = data.results.map(...);
})
```

- fetch로 받아온 데이터의 구조를 TypeScript에게 알려준다.



# 14. catch 에러 타입

```jsx
.catch((error) => {
  if (error.name === "AbortError") ...
})
```

```tsx
.catch((error: Error) => {
  if (error.name === "AbortError") ...
})
```

- 에러도 'Error'타입을 명시해야 한다.



# 15. 함수 반환 타입

```jsx
const makeNextOrder = () => { ... }
const makeNextCustomId = () => { ... }
const resetStatusLater = () => { ... }
const updateQuery = (key, value) => { ... }
const getMemberLink = (member) => { ... }
```

```tsx
const makeNextOrder = (): number => { ... }
const makeNextCustomId = (): string => { ... }
const resetStatusLater = (): void => { ... }
const updateQuery = (key: string, value: string): void => { ... }
const getMemberLink = (member: MemberItem): { pathname: string; search: string } => { ... }
```

- 함수가 반환하는 값의 타입을 명시해야 한다.
- 반환값이 없으면 'void', 숫자는 'number', 문자열은 'string'을 쓴다고 한다.



# 16. fetchRandomMembers 파라미터 타입

```jsx
const fetchRandomMembers = (count, mode, preservedCards = []) => { ... }
```

```tsx
const fetchRandomMembers = (
  count: number,
  mode: "add" | "replace",
  preservedCards: MemberItem[] = []
): void => { ... }
```

- "add" | "replace": 이 두 문자열 중 하나만 받을 수 있는 OR같은 타입인 것 같다. (유니온 타입으로 불림)



# 느낀점: 타입을 명시해야 하는 부분이 매우 많다.
+ 이게 최선인 것이 죄송합니다.