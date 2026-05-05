import "./Page.css";

export default function Week2Page() {
  return (
    <div className="week-page">
        <div className="week2-card-grid">
          
          <div className="week2-summary-card my-card">
            <div className="week2-card-image-wrap">
              <img src="https://i.pinimg.com/originals/4f/6a/e8/4f6ae87f63609f8d7f1f38b3617cbe1c.jpg" alt="이도은" className="week2-card-image" />
              <span className="week2-card-badge">HTML / CSS</span>
              <span className="week2-my-badge">나</span>
            </div>
            <div className="week2-card-body">
              <h3 className="week2-card-name">이도은</h3>
              <p className="week2-card-part">Frontend</p>
              <p className="week2-card-intro">열심히 배우는 프론트엔드 개발자입니다!</p>
            </div>
          </div>

          <div className="week2-summary-card">
            <div className="week2-card-image-wrap">
              <img src="https://i.namu.wiki/i/eThT8CYFzrGi-QEREijNJdiceYKYXYjArupDY07S2Gxlo0CZDO2cQyWWnDXHfqemvizFtSh0SRScxaIpKR-xZA.gif" alt="김주완" className="week2-card-image" />
              <span className="week2-card-badge">HTML/CSS</span>
            </div>
            <div className="week2-card-body">
              <h3 className="week2-card-name">김주완</h3>
              <p className="week2-card-part">Frontend</p>
              <p className="week2-card-intro">성실히 배우고 싶은 학생입니다.</p>
            </div>
          </div>

          <div className="week2-summary-card">
            <div className="week2-card-image-wrap">
              <img src="" alt="김나함" className="week2-card-image" />
              <span className="week2-card-badge">HTML / CSS</span>
            </div>
            <div className="week2-card-body">
              <h3 className="week2-card-name">김나함</h3>
              <p className="week2-card-part">Frontend</p>
              <p className="week2-card-intro">분야를 넘나들며 성장하는 개발자입니다.</p>
            </div>
          </div>

          <div className="week2-summary-card">
            <div className="week2-card-image-wrap">
              <img src="https://i.pinimg.com/236x/4d/95/31/4d9531cd97ec55ed7ec35448fbe0e41d.jpg" alt="임도영" className="week2-card-image" />
              <span className="week2-card-badge">HTML / CSS</span>
            </div>
            <div className="week2-card-body">
              <h3 className="week2-card-name">임도영</h3>
              <p className="week2-card-part">Frontend</p>
              <p className="week2-card-intro">아기사자 14기 프론트엔드 임도영입니다.</p>
            </div>
          </div>

          <div className="week2-summary-card">
            <div className="week2-card-image-wrap">
              <img src="" alt="정소민" className="week2-card-image" />
              <span className="week2-card-badge">React</span>
            </div>
            <div className="week2-card-body">
              <h3 className="week2-card-name">정소민</h3>
              <p className="week2-card-part">Frontend</p>
              <p className="week2-card-intro">컴퓨터공학과 25학번 정소민입니다.</p>
            </div>
          </div>

          <div className="week2-summary-card">
            <div className="week2-card-image-wrap">
              <img src="https://i.pinimg.com/236x/ab/58/35/ab58355b3cc43e8649ef972985205330.jpg" alt="백태우" className="week2-card-image" />
              <span className="week2-card-badge">NLU / NLG</span>
            </div>
            <div className="week2-card-body">
              <h3 className="week2-card-name">백태우</h3>
              <p className="week2-card-part">Frontend</p>
              <p className="week2-card-intro">I'm Empty Stack Junior :(</p>
            </div>
          </div>

        </div>
    </div>
  );
}
