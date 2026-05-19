import "./Page.module.css";
import nahamprofile from "./nhprofile.png";
import juwanprofile from "./jwprofile.gif";
import doyoungprofile from "./dyprofile.png";
import taewooprofile from "./twprofile.png";
import sominprofile from "./smprofile.png";
import doeunprofile from "./deprofile.jpg";
import seoyunprofile from "./syprofile.png";

export default function Week2Page() {
  return (
    <main className="container">
        
        <section className="summary-section">
            <div className="card-grid">
                
              
                <article className="summary-card me">
                    <div className="image-wrapper">
                        
                        <span class="badge">Frontend</span>
                    </div>
                    <img src={nahamprofile} alt="김나함 프로필 사진"></img>
                    <div class="card-content">
                        <h2>김나함</h2>
                        <p className="part">프론트엔드 파트</p>
                        <p className="intro">분야를 넘나들며 성장하는 개발자입니다.</p>
                    </div>
                </article>

                
                <article className="summary-card">
                    <div className="image-wrapper">
                        <span className="badge">Frontend</span>
                    </div>
                    <img src={doyoungprofile} alt="임도영 프로필 사진"></img>
                    <div className="card-content">
                        <h2>임도영</h2>
                        <p className="part">프론트엔드 파트</p>
                        <p className="intro">아기사자 14기 프론트엔드 임도영입니다.</p>
                    </div>
                </article>

                
                <article className="summary-card">
                    <div className="image-wrapper">
                        <span className="badge">Frontend</span>
                    </div>
                    <img src={juwanprofile} alt="김주완 프로필 사진"></img>
                    <div className="card-content">
                        <h2>김주완</h2>
                        <p className="part">프론트엔드 파트</p>
                        <p className="intro">성실히 배우고 싶은 학생입니다.</p>
                    </div>
                </article>

              <article className="summary-card">
                    <div className="image-wrapper">
                        <span className="badge">Frontend</span>
                    </div>
                    <img src={taewooprofile} alt="백태우 프로필 사진"></img>
                    <div className="card-content">
                        <h2>백태우</h2>
                        <p className="part">프론트엔드 파트</p>
                        <p className="intro">I'm Empty Stack Junior</p>
                    </div>
                </article>
              
              <article className="summary-card">
                    <div className="image-wrapper">
                        <span className="badge">Frontend</span>
                    </div>
                    <img src={sominprofile} alt="정소민 프로필 사진"></img>
                    <div className="card-content">
                        <h2>정소민</h2>
                        <p className="part">프론트엔드 파트</p>
                        <p className="intro">컴퓨터공학과 25학번 정소민입니다.</p>
                    </div>
                </article>
              
              <article className="summary-card">
                    <div className="image-wrapper">
                        <span className="badge">Frontend</span>
                    </div>
                    <img src={doeunprofile} alt="이도은 프로필 사진"></img>
                    <div className="card-content">
                        <h2>이도은</h2>
                        <p className="part">프론트엔드 파트</p>
                        <p className="intro">열심히 배우는 프론트엔드 개발자입니다.</p>
                    </div>
                </article>
              
              <article className="summary-card">
                    <div className="image-wrapper">
                        <span className="badge">Frontend</span>
                    </div>
                    <img src={seoyunprofile} alt="정서윤 프로필 사진"></img>
                    <div className="card-content">
                        <h2>정서윤</h2>
                        <p className="part">프론트엔드 파트</p>
                        <p className="intro">열심히 배워가고있는 프론트엔드 개발자입니다.</p>
                    </div>
                </article>
              
             
            </div>
        </section>

        <section className="detail-section">
            
            
            <article className="detail-card">
                <h2>김주완</h2>
                <p className="affiliation">멋쟁이사자처럼 14기 / 프론트엔드 파트</p>
                <div className="bio">
                    <p>컴퓨터공학과 1학년입니다. <br/>웹 개발을 배우며, 코드 하나하나 다 이해하려고 노력하고 있습니다.</p>
                </div>
                
                <ul className="skills">
                    <li>HTML / CSS</li>
                    <li>JavaScript</li>
                    <li>React(학습 중)</li>
                   
                </ul>
                <p className="contact">이메일: mmnnbbnn070910@gmail.com | 연락처: 010-9041-1287</p>
            </article>

            
            <article className="detail-card">
                <h2>임도영</h2>
                <p className="affiliation">멋쟁이사자처럼 14기 / 프론트엔드 파트</p>
                <div className="bio">
                    <p>동아대 26학번 컴퓨터공학과, 아기사자 14기 임도영입니다.<br/>
                    이번 활동을 통해 많이 공부하며, 공부한 것을 활동 및 대회 참여를 통해 활용해나가며
                    경험과 기술을 쌓기 위해 노력하겠습니다. <br/>앞으로 잘 부탁드립니다.
                    </p>
                </div>
                <ul className="skills">
                    <li>HTML/CSS</li>
                    <li>JavaScript</li>
                    <li>JAVA</li>
                    <li>C/C++</li>
                </ul>
                <p className="contact">이메일: dlaehdud342@naver.com | 연락처: 010-3516-6306</p>
            </article>

            
            <article className="detail-card">
                <h2>김나함</h2>
                <p className="affiliation">멋쟁이사자처럼 14기 / 프론트엔드 파트</p>
                <div className="bio">
                    <p>동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다.</p>
                </div>
                <ul className="skills">
                    <li>JavaScript</li>
                    <li>HTML / CSS</li>
                   
                </ul>
                <p className="contact">이메일: naham9488@gmail.com | 연락처: 010-3626-9488</p>
            </article>

            <article className="detail-card">
                <h2>백태우</h2>
                <p className="affiliation">멋쟁이사자처럼 14기 / 프론트엔드 파트</p>
                <div className="bio">
                    <p>AI학과이지만 Full Stack Developer를 목표로 하고있기 때문에 Frontend에서 짱 먹어보겠습니다 감사합니다.</p>
                </div>
                <ul className="skills">
                    <li>NLU / NLG</li>
                    <li>NLP</li>
                    <li>LLM</li>
                </ul>
                <p className="contact">이메일: btu0414@gmail.com | 연락처: 010-4564-4725</p>
                
            </article>

          <article className="detail-card">
                <h2>정소민</h2>
                <p className="affiliation">멋쟁이사자처럼 14기 / 프론트엔드 파트</p>
                <div className="bio">
                    <p>컴퓨터공학과 25학번 정소민입니다. 프론트엔드를 맡고 있습니다.</p>
                </div>
                
                <ul className="skills">
                    <li>React</li>
                    <li>ReactNative</li>
                    <li>JavaScript</li>
                   
                </ul>
                <p className="contact">이메일: sominjung1116@gmail.com | 연락처: 010-5615-8474</p>
                
            </article>
          <article className="detail-card">
                <h2>이도은</h2>
                <p className="affiliation">멋쟁이사자처럼 14기 / 프론트엔드 파트</p>
                <div className="bio">
                    <p>모르는게 너무 많은 말하는 수국입니다. 스펀지처럼 이해하려고 노력하고 있습니다.
                    배움에는 끝이없다..!
                    </p>
                </div>
                
                <ul className="skills">
                    <li>HTML/CSS</li>
                    <li>JavaScript</li>
                  <li>React (공부 중)</li>
                   
                </ul>
                <p className="contact">이메일: dodo55860@gmail.com | 연락처: 010-2686-5586</p>
                
      </article>
       <article className="detail-card">
                <h2>정서윤</h2>
                <p className="affiliation">멋쟁이사자처럼 14기 / 프론트엔드 파트</p>
                <div className="bio">
                    <p>안녕하세요, 프론트엔드를 맡고 있는 07년생 26학번 컴퓨터공학과 정서윤입니다
                        아직 부족한 점이 많지만, 배우는 과정 자체를 즐기며 꾸준히 성장하고 있습니다.
                        MBTI는 ESTP이고, 이번 멋사 리그에는 '쫄?'이라는 게임으로 참여했습니다.
                        많이 배우고 경험하는 것을 목표로 열심히 해보겠습니다. 감사합니다!
                    </p>
                </div>
                
                <ul className="skills">
                    <li>TypeScript - 타입 기반 개발</li>
                    <li>SSR/SSG - 서버 사이드 렌더링</li>
                    <li>Utility-First CSS - 효율적인 스타일링</li>
                    <li>Server State Management - 데이터 관리 최적화</li>
                   
                </ul>
                <p className="contact">이메일: t01021124995@gmail.com | 연락처: 010-3846-5638</p>
                
            </article>
       </section>
    </main>
  );
}
