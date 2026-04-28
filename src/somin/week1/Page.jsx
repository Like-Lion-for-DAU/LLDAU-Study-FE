import "./Page.css";
import profile from "./profileimg.png"

export default function Week1Page() {
  return (
    <div className="week-page">
      <div className="intro">
        <img src = {profile} alt = "프로필 사진" className = "profileimg"></img>
        <h2 className = "intro-name">정소민</h2>
        <p className = "end">Frontend</p>
        <p>컴퓨터공학과 25학번 정소민입니다.</p>
      </div>

      <div className="detail">
        <div className = "main">
          <h1>정소민</h1>
          <p className = "end">Frontend</p>
          <p className = "club">디스이즈</p>
        </div>

        <div className = "introduce">
          <h3>자기소개</h3>
          <p>컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다.</p>
        </div>

        <div className = "contact">
          <h3>연락처</h3>
          <ul>
            <li>email : sominjung1116@gmail.com</li>
            <li>instagram :  
              <a href = "https://www.instagram.com/__z1siim" >
              https://www.instagram.com/__z1siim</a></li>
            <li>번호 : 010-5615-8474</li>
          </ul>
        </div>

        <div className = "interest">
          <h3>관심기술</h3>
          <ul>
            <li>React</li>
            <li>ReactNative</li>
            <li>JavaScript</li>
          </ul>
        </div>
        
        <div className = "gako">
          <h3>각오 한 마디</h3>
          <p>열심히 하겠습니다.</p>
        </div>
      </div>
    </div>
  );
}
