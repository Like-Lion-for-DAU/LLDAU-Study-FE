import "./Page.css";
import profileImg from "/src/doeun/week1/talk_potato.jpg";

export default function Week1Page() {
  return (
    <div className="week-page">
      <div className="profile-card">
        <img
          src={profileImg}
          alt="profile"
          className="profile-img"
          />
        <h2>이도은 아기사자</h2>
        <strong>Frontend</strong>
        <p>열심히 배우는 프론트엔드 개발자입니다!</p>
      </div>

      <div className="detail-card">
        <header className="detail-H">
          <h1>이도은</h1>
          <strong>Frontend</strong>
          <p>LION TRACK</p>
        </header>
        
        <main className="detail">
          <section className = "info">
            <h3>자기소개</h3>
            <p>안녕하세요! 말하는 감자입니다.
              배움에는 끝이없다..!</p>
          </section>

          <section className="number">
            <footer>
            <h3>연락처</h3>
            <ul>
              <li> Email: dodo55860@gmail.com</li>
              <li><a href = "https://www.google.com" target="_blank">구글로 이동</a></li>
              <li>Phone: 010-2686-5586</li>
            </ul>
            </footer>
          </section>
          
          <section className="skill">
            <h3>관심 기술</h3>
            <ul>
              <li>HTML / CSS</li>
              <li>JavaScript</li>
              <li>React (학습 중)</li>
            </ul>
          </section>

          <section className="word">
           <h3>한 마디</h3>
           <p>팀원들에게 든든한 개발자가 되고싶습니다.</p>
          </section>
        </main>
      </div>
    </div>
  );
}
