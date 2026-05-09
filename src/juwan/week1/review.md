# 1주차 주완 과제 리뷰

## 1. 시멘틱 태그 구조에 대해서 조금 더 공부했으면 좋겠습니다.

## 2. 전역 태그 셀렉터는 지양하시는게 좋습니다.

    #root {
        min-height: 100vh;
        background-color: rgb(237, 237, 235);
    }

    * {
        box-sizing: border-box;
    }

    img {
        object-fit: cover;
    }

    이렇게 될 경우 다른 컴포넌트에도 #root (전역), * (모든태그), img 태그에 css가 적용되기 때문에 유지보수하기 힘들 수 있어요!
    왠만해선 클래스 선택자 사용하기

## 4. 클래스 네이밍은 의미 기반으로 작성하기!

    <div className="box1">, <div className="box2">
    이런 방식의 네이밍은 나중에 카드가 추가되거나 수정할 때 이게 뭐더라 헷갈릴 수 있어요

    만약 저였다면
    <div className="box1"> -> <div className="profile-card">
    <div className="box2"> -> <div className="detail-card">
    이런 식으로 할 것 같아용

## 5. 이미지는 링크 대신 프로젝트 내 삽입하기

    <img
        src="https://i.namu.wiki/i/eThT8CYFzrGi-QEREijNJdiceYKYXYjArupDY07S2Gxlo0CZDO2cQyWWnDXHfqemvizFtSh0SRScxaIpKR-xZA.gif"
        alt="이미지 불러오기 실패"
        />

    이렇게 링크로 작성 할 경우 이미지가 언제든 사라지거나 변경될 수 있어요.
    따라서 아이콘, 이미지, 로고 등등 "이미지"가 필요한 경우
    src\assets 폴더에 이미지를 모아두는게 좋아요.

    제가 작성한다면 src\assets\juwan\week1 이렇게 이미지 폴더를 만들어서
    이미지를 import하는 방법으로 사용할겁니다.

    src\components\NavBar\Navbar.jsx 파일 확인
    이미지 import 방법은 상대 경로로 코드 최상단에 작성합니다
    import logo from "../../assets/header/logo.png";

## 6. <br> 태그의 위치

    <p className="my">컴퓨터공학과 1학년입니다.
    <br/>웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.</p>

    이렇게 쓰는 것 보다

    <p className="my">
        컴퓨터공학과 1학년입니다. <br/>
        웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.
    </p>

    이렇게 쓰는게 조금 더 자연스러워 보이는 느낌

## 7. margin 중복 선언

    margin: top right bottom left;
    margin: 10px 20px 5px 25px;

    margin: top·bottom right·left
    margin: 10px 20px;

    margin: top right·left bottom
    margin: 0px 12px 6px; -> 주완씨가 쓰신거

    .club_name {
        color: gray;
        margin: 0px 12px 6px;
        margin-bottom: 20px;
    }

    그런데!
    margin: 0px 12px 6px;를 통하여 margin-bottom을 6px만큼 줬는데

    margin-bottom: 20px;을 선언하면
    margin-bottom: 20px;이 적용돼요.

    한 클래스에 중복되는 요소(margin-bottom)가 생기면 안돼요.

    .club_name {
        color: gray;
        margin: 0px 12px 20px;
    }

    이렇게 하는게 좀 더 자연스럽습니다.
