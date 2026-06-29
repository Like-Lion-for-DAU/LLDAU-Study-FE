Typescript 정의
자바스크립트의 단점을 보완하기 위해 만들어진 언어
자신이 원하는 타입 정의, 프로그래밍하면 자바스크립트로 컴파일되어 실행되는 정적타입언어

타입스크립트의 타입 정의

1. "types"
   기본 타입 : string, boolean, number, array, tuple, enum
   - : type aliases(타입 별칭)라는 기능 존재
     type의 이름을 붙여 type을 쉽게 정의 가능
2. "interfaces"
   object가 따라야만 하는 규칙 또는 요구사항의 집합
   정의 가능한 타입
   - 객체의 스펙(속성과 속성의 타입)
   - 함수의 파라미터
   - 함수의 스펙 (파라미터, 반환 타입 등)
   - 배열과 객체를 접근하는 방식
   - 클래스

   옵션 속성 : 인터페이스에 정의된 속성 다 안써도 됨 -> ? 사용

   읽기 전용 속성 : readonly -> 인터페이스로 객체 처음 생성시만 값 할당하고 이후는 변경 불가능
   - 이와 비슷한 방식 "type annotations"

type과 interface의 차이
type : 원시타입으로 직접적으로 정의함
interface : 원시 타입을 직접적으로 정의하는 용도로 사용 불가

함수 타입 - void, never
void - 함수에서 아무 값도 반환하지 않을 때
never - 항상 에러를 반환 하거나 무한 루프일 경우

원시 자료형 타입 - null, undefined

enum : 특정 값들의 집합을 의미함

any : 특정 데이터의 타입을 모를때 사용, 모든 타입 허용

void : 반환 값이 없는 함수의 반환 타입

never : 절대 발생하지 않는 값을 의미
ex) 함수가 반복문 or 에러 핸들링으로 인해 함수의 끝에 절대 도달할 수 없는 경우

Union Type
자바스크립트의 ||과 같이 a이거나 b이다라는 의미의 타입

| 연산자를 이용하여 타입 여러 개 연결

Intersection Type
여러 타입을 모두 만족하는 하나의 타입

& 연산자를 이용하여 여러 개의 타입 정의를 하나로 합침

keyof/typeof 연산자

1. typeof 연산자
   객체 데이터를 객체 타입으로 변환해주는 연산자
   객체에 쓰인 타입 구조를 그대로 가져와 독립된 타입으로 만들어 사용하고 싶을 경우 사용
   함수 역시 타입으로 변환하여 재사용 가능

2. keyof 연산자
   객체 형태의 타입을, 따로 속성들만 뽑아 모아 유니온 타입(|)으로 만들어 주는 연산자

유틸리티 타입 - ReturnType
함수의 반환 타입을 활용해야할 경우가 많은데, 유틸리티 타입을 쓰면 매번 타입 정의 안해도 됨

ReturnType이란?
함수의 반환 타입을 추론하여 새로운 타입을 생성해주는 유틸리티 타입
쉽게 말해 : "이 함수의 반환 타입이 뭐지"라는 질문을 자동으로 응답해줌

react/typescript 이벤트 타입
React.FormEvent -> 해당 event가 Form에서 왔다는 사실 설명 가능
input의 경우 : <HTMLInputElement>
form의 경우 : <HTMLFormElement>
TypeScript에서는 target 대신 currentTarget 사용

리액트에서 사용할 수 있는 모든 Synthetic Event의 종류
Clipboard Events
Composition Events
Keyboard Events
Focus Events
Form Events
Generic Events
Mouse Events
Pointer Events
Selection Events
Touch Events
UI Events
Wheel Events
Media Events
Image Events
Animation Events
Transition Events 등..

타입스크립트 선언 파일
d.ts -> 타입스크립트 코드의 타입 추론을 돕는 파일

타입스크립트에서의 타입이란?
타입스크립트에서의 타입이라는 개념은 크게 아래 5가지 범주를 의미

- 타입 별칭 type sn = number | string;
- 인터페이스 interface I { x: number[]; }
- 클래스 class C { }
- 이넘 enum E { A, B, C }
- 타입을 가리키는 import 구문
