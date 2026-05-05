import "./Page.css";
import jsm from './profile/jsm.png';
import kjw from './profile/kjw.gif';
import idy from './profile/idy.png';
import btw from './profile/btw.png';
import ide from './profile/ide.png';
import jsy from './profile/jsy.png';



export default function Week2Page() {
  return (
    <div className="week-page">
      <section className="card-intro">
        <div className = "card-me">
          <div className="profileimg">
            <img src={jsm} alt="정소민 프로필" />
            <span className="badge">React</span>
          </div>
          <p className = "name">정소민</p>
          <p className = "end">Frontend</p>
          <p>컴퓨터공학과 25학번 정소민입니다.</p>
        </div>
        
        <div className = "card">
          <div className="profileimg">
            <img src={kjw} alt="김주완 프로필" />
            <span className="badge">HTML/CSS</span>
          </div>
          <p className = "name">김주완</p>
          <p className = "end">Frontend</p>
          <p>성실히 배우고 싶은 학생입니다.</p>
        </div>
        
        <div className = "card">
          <div className="profileimg">
            <img src={idy} alt="임도영 프로필" />
            <span className="badge">HTML / CSS</span>
          </div>
          <p className = "name">임도영</p>
          <p className = "end">Frontend</p>
          <p>아기사자 14기 프론트엔드 임도영입니다.</p>
        </div>
        
        <div className = "card">
          <div className="profileimg">
            <img src={jsm} alt="김나함 프로필" />
            <span className="badge">HTML / CSS</span>
          </div>
          <p className = "name">김나함</p>
          <p className = "end">Frontend</p>
          <p>분야를 넘나들며 성장하는 개발자입니다.</p>
        </div>
        
        <div className = "card">
          <div className="profileimg">
            <img src={btw} alt="백태우 프로필" />
            <span className="badge">NLU / NLG</span>
          </div>
          <p className = "name">백태우</p>
          <p className = "end">Frontend</p>
          <p>I'm Empty Stack Junior</p>
        </div>
        
        <div className = "card">
          <div className="profileimg">
            <img src={ide} alt="이도은 프로필" />
            <span className="badge">HTML / CSS</span>
          </div>
          <p className = "name">이도은</p>
          <p className = "end">Frontend</p>
          <p>열심히 배우는 프론트엔드 개발자입니다!</p>
        </div>
        
        <div className = "card">
          <div className="profileimg">
            <img src={jsy} alt="정서윤 프로필" />
            <span className="badge">TypeScript</span>
          </div>
          <p className = "name">정서윤</p>
          <p className = "end">Frontend</p>
          <p>열심히 배워가고있는 프론트엔드 개발자입니다!</p>
        </div>
      </section>

      <section className="card-detail">

        <div className = "detail">
          <div className = "main">
            <p className = "name">정소민</p>
            <p className = "end">Frontend</p>
            <p className = "club">디스이즈</p>
          </div>

          <div className = "introduce">
            <p>자기소개</p>
            <p>컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다.</p>
          </div>

          <div className = "contact">
            <p>연락처</p>
            <ul>
              <li>email : sominjung1116@gmail.com</li>
              <li>instagram :  
                <a href = "https://www.instagram.com/__z1siim" >@__z1siim</a></li>
              <li>phne : 010-5615-8474</li>
            </ul>
          </div>

          <div className = "interest">
            <p>관심기술</p>
            <ul>
              <li>React</li>
              <li>ReactNative</li>
              <li>JavaScript</li>
            </ul>
          </div>
        
          <div className = "gako">
            <p>각오 한 마디</p>
            <p>열심히 하겠습니다.</p>
          </div>
        </div>

        <div className = "detail">
          <div className = "main">
            <p className = "name">김주완</p>
            <p className = "end">Frontend</p>
            <p className = "club">LikeLion DAU</p>
          </div>

          <div className = "introduce">
            <p>자기소개</p>
            <p>컴퓨터공학과 1학년입니다. <br/>웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.</p>
          </div>

          <div className = "contact">
            <p>연락처</p>
            <ul>
              <li>email : mmnnbbnn070910@gmail.com</li>
              <li>Website: <a href="https://likelion.net/" target="_blank"> Likelion main page</a></li>
              <li>phone : 010-9041-1287</li>
            </ul>
          </div>

          <div className = "interest">
            <p>관심기술</p>
            <ul>
              <li>HTML/CSS</li>
              <li>JavaScript</li>
              <li>React(학습 중)</li>
            </ul>
          </div>
        
          <div className = "gako">
            <p>각오 한 마디</p>
            <p>성실히 배워서 웹개발 마스터가 되고 싶습니다.</p>
          </div>
        </div>

        <div className = "detail">
          <div className = "main">
            <p className = "name">임도영</p>
            <p className = "end">Frontend</p>
            <p className = "club">디스이즈</p>
          </div>

          <div className = "introduce">
            <p>자기소개</p>
            <p>동아대 26학번 컴퓨터공학과, 아기사자 14기 임도영입니다. 이번 활동을
            통해 많이 공부하며, 공부한 것을 활동 및 대회 참여를 통해
            활용해나가며 경험과 기술을 쌓기 위해 노력하겠습니다. 앞으로 잘
            부탁드립니다.</p>
          </div>

          <div className = "contact">
            <p>연락처</p>
            <ul>
              <li>email : dlaehdud342@naver.com</li>
              <li>Website: <a href="https://www.google.com" target="_blank"> web </a></li>
              <li>phone : 010-3516-6306</li>
            </ul>
          </div>

          <div className = "interest">
            <p>관심기술</p>
            <ul>
              <li>HTML / CSS</li>
              <li>JavaScript</li>
              <li>React</li>
              <li>JAVA</li>
              <li>C / C++</li>
            </ul>
          </div>
        
          <div className = "gako">
            <p>각오 한 마디</p>
            <p>꾸준히 노력하고 적극적인 참여를 통해 성장하는 개발자가 되겠습니다.</p>
          </div>
        </div>

        <div className = "detail">
          <div className = "main">
            <p className = "name">김나함</p>
            <p className = "end">Frontend</p>
            <p className = "club">멋쟁이사자처럼 아기사자 14기, 자기개발 동아리</p>
          </div>

          <div className = "introduce">
            <p>자기소개</p>
            <p>동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다.</p>
          </div>

          <div className = "contact">
            <p>연락처</p>
            <ul>
              <li>email : naham9488@gmail.com</li>
              <li>instagram : @kim_naham</li>
              <li>phone : 010-3626-9488</li>
            </ul>
          </div>

          <div className = "interest">
            <p>관심기술</p>
            <ul>
              <li>HTML / CSS</li>
              <li>JavaScript</li>
            </ul>
          </div>
        
          <div className = "gako">
            <p>각오 한 마디</p>
            <p>부족한 점은 많지만 포기하지 않고 계속 노력하여 성장하는 아기사자가 되겠습니다!</p>
          </div>
        </div>

        <div className = "detail">
          <div className = "main">
            <p className = "name">백태우</p>
            <p className = "end">Frontend</p>
            <p className = "club">DAU_DSIS</p>
          </div>

          <div className = "introduce">
            <p>자기소개</p>
            <p>AI학과이지만 Full Stack Developer를 목표로 하고있기 때문에 Frontend에서 짱 먹어보겠습니다 감사합니다</p>
          </div>

          <div className = "contact">
            <p>연락처</p>
            <ul>
              <li>email : btu0414@gmail.com</li>
              <li>website :  
                <a href = "https://www.acmicpc.net/" > web </a></li>
              <li>phone : 010-4564-4725</li>
            </ul>
          </div>

          <div className = "interest">
            <p>관심기술</p>
            <ul>
              <li>NLU / NLG</li>
              <li>NLP</li>
              <li>LLM</li>
            </ul>
          </div>
        
          <div className = "gako">
            <p>각오 한 마디</p>
            <p>모두가 원하는 개발자가 되어보겠습니다.</p>
          </div>
        </div>
        <div className = "detail">
          <div className = "main">
            <p className="name">이도은</p>
            <p className = "end">Frontend</p>
            <p className = "club">LION TRACK</p>
          </div>

          <div className = "introduce">
            <p>자기소개</p>
            <p>모르는게 너무 많은 말하는수국입니다. 스펀지처럼 이해하려고
               노력하고 있습니다. 배움에는 끝이없다..!</p>
          </div>

          <div className = "contact">
            <p>연락처</p>
            <ul>
              <li>email : dodo55860@gmail.com</li>
              <li>website :  
                <a href="" target="_blank"> web </a></li>
              <li>phone : 010-2686-5586</li>
            </ul>
          </div>

          <div className = "interest">
            <p>관심기술</p>
            <ul>
              <li>HTML / CSS</li>
              <li>JavaScript</li>
              <li>React (학습 중)</li>
            </ul>
          </div>
        
          <div className = "gako">
            <p>각오 한 마디</p>
            <p>팀원들에게 든든한 개발자가 되고싶습니다.</p>
          </div>
        </div>

        <div className = "detail">
          <div className = "main">
            <p className = "name">정서윤</p>
            <p className = "end">Frontend</p>
            <p className = "club">디스이즈</p>
          </div>

          <div className = "introduce">
            <p>자기소개</p>
            <p>안녕하세요, 프론트엔드를 맡고 있는 07년생 26학번 컴퓨터공학과 정서윤입니다.
            아직 부족한 점이 많지만, 배우는 과정 자체를 즐기며 꾸준히 성장하고 있습니다.
            MBTI는 ESTP이고, 이번 멋사 리그에는 ‘쫄?’이라는 게임으로 참여했습니다.
            많이 배우고 경험하는 것을 목표로 열심히 해보겠습니다. 감사합니다!</p>
          </div>

          <div className = "contact">
            <p>연락처</p>
            <ul>
              <li>email : t01021124995@gmail.com</li>
              <li>github :  
                <a href = "https://github.com/dkjksd" >github.com/dkjksd</a></li>
              <li>phone : 010-3846-5638</li>
            </ul>
          </div>

          <div className = "interest">
            <p>관심기술</p>
            <ul>
              <li>TypeScript — 타입 기반 개발</li>
              <li>SSR/SSG — 서버 사이드 렌더링</li>
              <li>Utility-First CSS — 효율적인 스타일링</li>
              <li>Server State Management — 데이터 관리 최적화</li>
            </ul>
          </div>
        
          <div className = "gako">
            <p>각오 한 마디</p>
            <p>기초를 탄탄히 다지며, 맡은 역할을 끝까지 책임지는 개발자가 되겠습니다.</p>
          </div>
        </div>
        
        
      </section>
    </div>
  );
}
