# 1주차 이도은 과제 리뷰

## 1. 시멘틱 태그 구조에 대해서 조금 더 공부했으면 좋겠습니다.

## 2. footer 태의 위치가 살짝 어색해요!

## 3. 전역 태그 셀렉터는 지양하시는게 좋습니다.

    strong {
    color: rgb(78, 78, 238);
    }
    ul {
    padding-left: 20px;
    margin: 10px;
    }

    이렇게 될 경우 모든 strong, ul 태그에 css가 적용되기 때문에
    나중에 유지보수하기 힘들 수 있어요!
    왠만해선 클래스 선택자 사용하기

## 4. 클래스 네이밍은 의미 기반으로 작성하기!

    <div className="card1">, <div className="card2">
    이런 방식의 네이밍은 나중에 카드가 추가되거나 수정할 때 이게 뭐더라 헷갈릴 수 있어요

    만약 저였다면
    <div className="card1"> -> <div className="profile-card">
    <div className="card2"> -> <div className="detail-card">
    이런 식으로 할 것 같아용

## 5. 이미지는 링크 대신 프로젝트 내 삽입하기

    <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeiEU1E04mO8ZKPSBg0rEkODKXVoW3MTeypA&s"
          alt="profile"
          className="profile-img"
        />
    이렇게 링크로 작성 할 경우 이미지가 언제든 사라지거나 변경될 수 있어요.
    따라서 아이콘, 이미지, 로고 등등 "이미지"가 필요한 경우
    src\assets 폴더에 이미지를 모아두는게 좋아요.

    제가 작성한다면 src\assets\doeun\week1 이렇게 이미지 폴더를 만들어서
    이미지를 import하는 방법으로 사용할겁니다.

    src\components\NavBar\Navbar.jsx 파일 확인
    이미지 import 방법은 상대 경로로 코드 최상단에 작성합니다
    import logo from "../../assets/header/logo.png";
