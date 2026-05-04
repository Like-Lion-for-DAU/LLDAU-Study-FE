import "./Page.css";
import jGif from "../../assets/doyoung/week2/j.gif";
import idyJPG from "../../assets/doyoung/week2/idy.jpg";
import bJPG from "../../assets/doyoung/week2/b.jpg";
import jsmPNG from "../../assets/doyoung/week2/jsm.png";
import iJPEG from "../../assets/doyoung/week2/i.jpeg";
import jsyPNG from "../../assets/doyoung/week2/jsy.png";
import hPNG from "../../assets/doyoung/week2/h.png";

export default function Week2Page() {
  return (
    <div className="week-page">
      <h2>2주차</h2>
      <h2>아기사자 명단 대시보드</h2>

      <section className="cardpack">
        <div className="card">
          <img src={jGif} alt="프로필 사진" className="photo" />
          <h2>김주완</h2>
          <span>Frontend</span>
          <p>성실히 배우고 싶은 학생입니다.</p>
        </div>

        <div className="card">
          <img src={idyJPG} alt="프로필 사진" className="photo" />
          <h2>임도영</h2>
          <span>Frontend</span>
          <p className="myname">아기사자 14기 프론트엔드 임도영 입니다.</p>
        </div>

        <div className="card">
          <img src={hPNG} alt="프로필 사진" className="photo" />
          <h2>김나함</h2>
          <span>Frontend</span>
          <p>분야를 넘나들며 성장하는 개발자입니다.</p>
        </div>

        <div className="card">
          <img src={bJPG} alt="프로필 사진" className="photo" />
          <h2>백태우</h2>
          <span>Frontend</span>
          <p>I'm Empty Stack Junior</p>
        </div>

        <div className="card">
          <img src={jsmPNG} alt="프로필 사진" className="photo" />
          <h2>정소민</h2>
          <span>Frontend</span>
          <p>컴퓨터공학과 25학번 정소민입니다.</p>
        </div>

        <div className="card">
          <img src={iJPEG} alt="프로필 사진" className="photo" />
          <h2>이도은</h2>
          <span>Frontend</span>
          <p>열심히 배우는 프론트엔드 개발자입니다!</p>
        </div>

        <div className="card">
          <img src={jsyPNG} alt="프로필 사진" className="photo" />
          <h2>정서윤</h2>
          <span>Frontend</span>
          <p>열심히 배워가고있는 프론트엔드 개발자입니다!</p>
        </div>
      </section>

      <section className="detailcardpack">
        <div className="detailcard">
          <h2>김주완</h2>
          <span>Frontend</span>
          <p className="dsis">동아리명 : 디스이즈</p>
          <p>LION TRACK</p>
          <br></br>
          <h3>자기소개</h3>
          <p>컴퓨터공학과 1학년입니다.
          <br/>웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.</p>
          <br></br>
          <h3>연락처</h3>
          <ul>
            <li>Email : mmnnbbnn070910@gmail.com</li>
            <li>Phone : 010-9041-1287</li>
            <li>link : <a href="https://likelion.net/" target="_blank">
          Likelion main page</a></li>
          </ul>
          <br></br>
          <h3>관심 기술</h3>
          <ul>
            <li>HTML/CSS</li>
          <li>JavaScript</li>
          <li>React(학습 중)</li>
          </ul>
          <br></br>
          <h3>한 마디</h3>
          <p>성실히 배워서 웹개발 마스터가 되고 싶습니다.</p>
        </div>

        <div className="detailcard">
          <h2>임도영</h2>
          <span>Frontend</span>
          <p className="dsis">동아리명 : 디스이즈</p>
          <p>LION TRACK</p>
          <br></br>
          <h3>자기소개</h3>
          <p>동아대 26학번 컴퓨터공학과, 아기사자 14기 임도영입니다. 이번 활동을
            통해 많이 공부하며, 공부한 것을 활동 및 대회 참여를 통해
            활용해나가며 경험과 기술을 쌓기 위해 노력하겠습니다. 앞으로 잘
            부탁드립니다.
            </p>
          <br></br>
          <h3>연락처</h3>
          <ul>
            <li>Email : <a href="mailto:dlaehdud342@naver.com">dlaehdud342@naver.com</a></li>
            <li>Phone : <a href="tel:01035166306">010-3516-6306</a></li>
            <li>link : <a href="https://www.google.com" target="_blank">
              구글로 가기
            </a></li>
          </ul>
          <br></br>
          <h3>관심 기술</h3>
          <ul>
            <li>HTML / CSS</li>
            <li>JavaScript</li>
            <li>React</li>
            <li>JAVA</li>
            <li>C / C++</li>
          </ul>
          <br></br>
          <h3>한 마디</h3>
          <p>꾸준히 노력하고 적극적인 참여를 통해 성장하는 개발자가 되겠습니다.</p>
        </div>

        <div className="detailcard">
          <h2>김나함</h2>
          <span>Frontend</span>
          <p className="dsis">동아리명 : 디스이즈</p>
          <p>LION TRACK</p>
          <br></br>
          <h3>자기소개</h3>
          <p>동아대학교 응용생물공학과 25학번 김나함입니다.
          멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다.
          </p>
          <br></br>
          <h3>연락처</h3>
          <ul>
            <li>Email : naham9488@gmail.com</li>
            <li>Phone : </li>
            <li>인스타: kim_naham</li>
          </ul>
          <br></br>
          <h3>관심 기술</h3>
          <ul>
            <li>HTML / CSS</li>
            <li>JavaScript</li>
          </ul>
          <br></br>
          <h3>한 마디</h3>
          <p>부족한 점은 많지만 포기하지 않고 계속 노력하여 성장하는 아기사자가 되겠습니다!</p>
        </div>

        <div className="detailcard">
          <h2>백태우</h2>
          <span>Frontend</span>
          <p className="dsis">동아리명 : 디스이즈</p>
          <p>LION TRACK</p>
          <br></br>
          <h3>자기소개</h3>
          <p>AI학과이지만 Full Stack Developer를 목표로 하고있기 때문에 Frontend에서 짱 먹어보겠습니다 감사합니다.</p>
          <br></br>
          <h3>연락처</h3>
          <ul>
            <li>Email : btu0414@gmail.com</li>
            <li>Phone : 010-4564-4725</li>
            <li>link : <a href="https://www.acmicpc.net/">https://www.acmicpc.net/</a></li>
          </ul>
          <br></br>
          <h3>관심 기술</h3>
          <ul>
            <li>NLU / NLG</li>
            <li>NLP</li>
            <li>LLM</li>
          </ul>
          <br></br>
          <h3>한 마디</h3>
          <p>모두가 원하는 개발자가 되어보겠습니다.</p>
        </div>

        <div className="detailcard">
          <h2>정소민</h2>
          <span>Frontend</span>
          <p className="dsis">동아리명 : 디스이즈</p>
          <p>LION TRACK</p>
          <br></br>
          <h3>자기소개</h3>
          <p>컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다.</p>
          <br></br>
          <h3>연락처</h3>
          <ul>
            <li>Email : sominjung1116@gmail.com</li>
            <li>Phone : 010-5615-8474</li>
            <li>link : <a href = "https://www.instagram.com/__z1siim" >
              링크</a></li>
          </ul>
          <br></br>
          <h3>관심 기술</h3>
          <ul>
            <li>React</li>
            <li>ReactNative</li>
            <li>JavaScript</li>
          </ul>
          <br></br>
          <h3>한 마디</h3>
          <p>열심히 하겠습니다.</p>
        </div>

        <div className="detailcard">
          <h2>이도은</h2>
          <span>Frontend</span>
          <p className="dsis">동아리명 : 디스이즈</p>
          <p>LION TRACK</p>
          <br></br>
          <h3>자기소개</h3>
          <p>안녕하세요! 말하는 감자입니다.
            배움에는 끝이없다..!
          </p>
          <br></br>
          <h3>연락처</h3>
          <ul>
            <li>Email : dodo55860@gmail.com</li>
            <li>Phone : 010-2686-5586</li>
            <li>link : <a href = "https://www.google.com" target="_blank">구글로 이동</a></li>
          </ul>
          <br></br>
          <h3>관심 기술</h3>
          <ul>
            <li>JavaScript</li>
          </ul>
          <br></br>
          <h3>한 마디</h3>
          <p>팀원들에게 든든한 개발자가 되고싶습니다.</p>
        </div>

        <div className="detailcard">
          <h2>정서윤</h2>
          <span>Frontend</span>
          <p className="dsis">동아리명 : 디스이즈</p>
          <p>LION TRACK</p>
          <br></br>
          <h3>자기소개</h3>
          <p>안녕하세요, 프론트엔드를 맡고 있는 07년생 26학번 컴퓨터공학과 정서윤입니다.
            아직 부족한 점이 많지만, 배우는 과정 자체를 즐기며 꾸준히 성장하고 있습니다.
            MBTI는 ESTP이고, 이번 멋사 리그에는 ‘쫄?’이라는 게임으로 참여했습니다.
            많이 배우고 경험하는 것을 목표로 열심히 해보겠습니다. 감사합니다!
          </p>
          <br></br>
          <h3>연락처</h3>
          <ul>
            <li>Email : t01021124995@gmail.com</li>
            <li>Phone : 010-3846-5638</li>
            <li>link : <a
                href="https://github.com/dkjksd"
                class="contact-list__value"
                target="_blank"
                rel="noopener noreferrer"
              >
                깃헙
              </a></li>
          </ul>
          <br></br>
          <h3>관심 기술</h3>
          <ul>
            <li>TypeScript</li>
            <li>SSR/SSG</li>
            <li>Utility-First CSS</li>
            <li>Server State Management</li>
          </ul>
          <br></br>
          <h3>한 마디</h3>
          <p>기초를 탄탄히 다지며, 맡은 역할을 끝까지 책임지는 개발자가 되겠습니다.</p>
        </div>
      </section>
    </div>
  );
}
