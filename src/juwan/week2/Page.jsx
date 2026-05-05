import "./Page.css";
import catimg from "./cat.gif"
import flower1 from "./flower1.jpg"
import window1 from "./window.jpg"

export default function Week2Page() {
  return (
    <div className="week-page">
      <div className="card-container">

        <div className="card main-card">
          <img src={catimg} alt="이미지"/>
          <span className="badge">React</span>
          <div className="card-content">
            <h3>김주완</h3>
            <p className="role">Frontend</p>
            <p className="introduce">열심히 배우는 프론트엔드 개발자 입니다.</p>
          </div>
        </div>

                <div className="card">
          <img src={flower1} alt="이미지"/>
          <span className="badge">Spring</span>
          <div className="card-content">
            <h3>김아기사자</h3>
            <p className="role">Backend</p>
            <p className="introduce">안정적인 서버 구조에 관심이 많습니다.</p>
          </div>
        </div>

                <div className="card">
          <img src={window1} alt="이미지"/>
          <span className="badge">React</span>
          <div className="card-content">
            <h3>박아기사자</h3>
            <p className="role">Frontend</p>
            <p className="introduce">구조적인 UI를 고민하는 프론트엔드 개발자입니다.</p>
          </div>
        </div>

                <div className="card">
          <img src={flower1} alt="이미지"/>
          <span className="badge">React</span>
          <div className="card-content">
            <h3>이아기사자</h3>
            <p className="role">Frontend</p>
            <p className="introduce">구조적인 UI를 고민하는 프론트엔드 개발자입니다.</p>
          </div>
        </div>

                <div className="card">
          <img src={flower1} alt="이미지"/>
          <span className="badge">React</span>
          <div className="card-content">
            <h3>최아기사자</h3>
            <p className="role">Frontend</p>
            <p className="introduce">구조적인 UI를 고민하는 프론트엔드 개발자입니다.</p>
          </div>
        </div>

                <div className="card">
          <img src={flower1} alt="이미지"/>
          <span className="badge">React</span>
          <div className="card-content">
            <h3>최아기사자</h3>
            <p className="role">Frontend</p>
            <p className="introduce">구조적인 UI를 고민하는 프론트엔드 개발자입니다.</p>
          </div>
        </div>

                <div className="card">
          <img src={flower1} alt="이미지"/>
          <span className="badge">React</span>
          <div className="card-content">
            <h3>오아기사자</h3>
            <p className="role">Frontend</p>
            <p className="introduce">구조적인 UI를 고민하는 프론트엔드 개발자입니다.</p>
          </div>
        </div>

                <div className="card">
          <img src={flower1} alt="이미지"/>
          <span className="badge">React</span>
          <div className="card-content">
            <h3>남궁아기사자</h3>
            <p className="role">Frontend</p>
            <p className="introduce">구조적인 UI를 고민하는 프론트엔드 개발자입니다.</p>
          </div>
        </div>

                <div className="card">
          <img src={flower1} alt="이미지"/>
          <span className="badge">React</span>
          <div className="card-content">
            <h3>제갈아기사자</h3>
            <p className="role">Frontend</p>
            <p className="introduce">구조적인 UI를 고민하는 프론트엔드 개발자입니다.</p>
          </div>
        </div>
      </div>





        {/* <div className="flex-container justify-around">
          <div className="profile-first justify-around">
            <div className="profile p11">
              <img src={catimg} alt="p11" />
              <h2 className="name">김주완</h2>
            </div>
            <div className="profile p12">p12</div>
            <div className="profile p13">p13</div>
          </div>

          <div className="profile-second justify-around">
            <div className="profile p21">p21</div>
            <div className="profile p22">p22</div>
            <div className="profile p23">p23</div>
          </div>

          <div className="profile-third justify-around">
            <div className="profile p31">p31</div>
            <div className="profile p32">p32</div>
            <div className="profile p33">p33</div>
          </div>
        </div> */}
    </div>
  );
}
