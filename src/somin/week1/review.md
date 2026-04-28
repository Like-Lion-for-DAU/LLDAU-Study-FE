# 1주차 소민 과제 리뷰

## img 태그는 닫는 태그 안 쓰는게 보편적이에요!

<img src = {profile} alt = "프로필 사진" className = "profileimg"></img>

<img src = {profile} alt = "프로필 사진" className = "profileimg"/>

닫는 태그 쓰는게 틀린 건 아니지만 다들 닫는 태그 안 쓰더라구요.

## 시멘틱 태그 사용

코드 전반이 <div>태그로 이루어져 있습니다.

<header>, <section>, <main> 등 다양한 시멘틱 태그가 있으니 한번 공부 해보시는 것도 낫배드

## 시인성

<a href = "https://www.instagram.com/__z1siim" >
https://www.instagram.com/__z1siim</a>

사용자에게 표시될 때 https://www.instagram.com/__z1siim url이 그대로 노출되니

<a href = "https://www.instagram.com/__z1siim" >
    @__z1siim
</a>

이렇게 작성해서 @\_\_z1siim가 렌더링 되도록 하는 방법도 있어요.

## <h1>, <h2>, ..., <hN> 태그에 대해

h태그는 폰트 사이즈가 자동으로 설정된다는 편리함이 있지만 의미가 조금 달라요.

h태그들은 폰트 사이즈를 조절하는 태그가 아닌 문서 구조와 의미를 나타내는 태그에요.

따라서 폰트 사이즈는 클래스를 붙여서 font-size, font-weight, color 등을 조절하는게 좋아요.

텍스트를 쓰고 싶을땐 <p class = "intro-name">, <span>, <div>태그 등을 사용하고 클래스를 붙여
폰트와 관련된 모든 css를 조절하는게 좋습니다.

다른 코드는 잘 썼지만

<h2 className = "intro-name">정소민</h2>

이 코드 때문에 한번 리마인드 했습니다.

사실 <h2 className = "intro-name">정소민</h2> 그대로 써도 문제 없긴해요.
제가 h1, h2 안 써서 말씀드렸어요.

## 굿굿 잘했음 최고 정소민
