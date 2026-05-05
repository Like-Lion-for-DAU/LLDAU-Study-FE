# 1주차 도영 과제 리뷰

## 1. 이미지는 링크 대신 프로젝트 내 삽입하기

    <img
        src="https://i.pinimg.com/236x/4d/95/31/4d9531cd97ec55ed7ec35448fbe0e41d.jpg"   alt="프로필 사진"
        width="300px"
        />

    이렇게 링크로 작성 할 경우 이미지가 언제든 사라지거나 변경될 수 있어요.
    따라서 아이콘, 이미지, 로고 등등 "이미지"가 필요한 경우
    src\assets 폴더에 이미지를 모아두는게 좋아요.

    제가 작성한다면 src\assets\doyoung\week1 이렇게 이미지 폴더를 만들어서
    이미지를 import하는 방법으로 사용할겁니다.

    src\components\NavBar\Navbar.jsx 파일 확인
    이미지 import 방법은 상대 경로로 코드 최상단에 작성합니다
    import logo from "../../assets/header/logo.png";

## 2. 태그 내에선 css 속성 단위 지양하기

     <img
        src="https://i.pinimg.com/236x/4d/95/31/4d9531cd97ec55ed7ec35448fbe0e41d.jpg"   alt="프로필 사진"
        width="300px"
        />

    width="300px"의 경우 2가지의 문제 점이 있습니다.

    A. jsx에서 width속성을 주기 위해선 단위 없이 숫자만 기록합니다.
        ex. width="300"

    B. 단위가 필요하다면 꼭 css 클래스에서 작성하는게 좋습니다.
        jsx파일의 html내에 스타일 속성이 있다면 나중에 유지보수하기 조금 힘들어용
        지금은 코드가 짧고 한번에 보이지만,
        코드가 길어지고 hook들이 많아지고 하다보면 jsx파일에서 스타일 찾기 정말 힘들어집니다!

        꼭 스타일은 css파일에서 관리하기

## 3. 전역 태그 셀렉터는 global.css에

    body {
        margin: 0;
        font-family: Arial, sans-serif;
        color: #333;
    }

    section {
        margin-bottom: 25px;
    }

    section h2 {
        border-bottom: 2px solid #ddd;
        padding-bottom: 5px;
    }

    a {
        text-decoration: none;
    }

    이렇게 될 경우 다른 컴포넌트의 body, section,  section의 h2, a 태그에 css가 적용되기 때문에
    나중에 유지보수하기 힘들 수 있어요!
    왠만해선 클래스 선택자 사용하기

    위와 같은 전역 스타일 지정은 src\styles\globals.css에서 진행합니다.

    AI 흔적이 다소 보입니다.

## 4. 들여쓰기 이쁘게

    vscode 확장 프로그램인 prettier 사용하면 따로 신경 안 써도 이쁘게 나와용
    제가 src\doyoung\week1\Page.jsx이 코드에 제 기준 이쁘게 들여쓰기 해놓을태니 확인하봐용
