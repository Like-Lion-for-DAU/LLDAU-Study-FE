import "./Page.css";

export default function Week2Page() {
  return (
    <html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>아기 사자 자기소개</title>
    
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <main class="container">
        
        <!-- 1. 요약 카드 목록 영역 -->
        <section class="summary-section">
            <div class="card-grid">
                
              
                <article class="summary-card me">
                    <div class="image-wrapper">
                        
                        <img src="profile.jpg" alt="내 프로필 사진">
                        <span class="badge">Frontend</span>
                    </div>
                    <div class="card-content">
                        <h2>김나함</h2>
                        <p class="part">프론트엔드 파트</p>
                        <p class="intro">안녕하세요! 멋쟁이사자처럼 아기사자 14기 프론트엔드 김나함입니다.</p>
                    </div>
                </article>

                
                <article class="summary-card">
                    <div class="image-wrapper">
                        <img src="profile2.jpg" alt="동료 사진">
                        <span class="badge">Frontend</span>
                    </div>
                    <div class="card-content">
                        <h2>이멋사</h2>
                        <p class="part">프론트엔드 파트</p>
                        <p class="intro">HTML, CSS, Javascript에 관심이 있습니다.</p>
                    </div>
                </article>

                
                <article class="summary-card">
                    <div class="image-wrapper">
                        <img src="profile3.jpg" alt="동료 사진">
                        <span class="badge">Frontend</span>
                    </div>
                    <div class="card-content">
                        <h2>박멋사</h2>
                        <p class="part">프론트 엔드 파트</p>
                        <p class="intro">사용자를 생각하는 웹을 구현하는 것에 관심있습니다.</p>
                    </div>
                </article>

              <article class="summary-card">
                    <div class="image-wrapper">
                        <img src="profile3.jpg" alt="동료 사진">
                        <span class="badge">Backend</span>
                    </div>
                    <div class="card-content">
                        <h2>김멋사</h2>
                        <p class="part">백엔드 파트</p>
                        <p class="intro">서버 개발에 관심이 많습니다.</p>
                    </div>
                </article>
              
              <article class="summary-card">
                    <div class="image-wrapper">
                        <img src="profile3.jpg" alt="동료 사진">
                        <span class="badge">Backend</span>
                    </div>
                    <div class="card-content">
                        <h2>윤멋사</h2>
                        <p class="part">백엔드 파트</p>
                        <p class="intro">웹 개발에 관심이 있습니다.</p>
                    </div>
                </article>
              
              <article class="summary-card">
                    <div class="image-wrapper">
                        <img src="profile3.jpg" alt="동료 사진">
                        <span class="badge">Backend</span>
                    </div>
                    <div class="card-content">
                        <h2>서멋사</h2>
                        <p class="part">백엔드 파트</p>
                        <p class="intro">노력하는 백엔드 개발자 입니다.</p>
                    </div>
                </article>
              
              <article class="summary-card">
                    <div class="image-wrapper">
                        <img src="profile3.jpg" alt="동료 사진">
                        <span class="badge">Backend</span>
                    </div>
                    <div class="card-content">
                        <h2>나멋사</h2>
                        <p class="part">백엔드 파트</p>
                        <p class="intro">백엔드를 비롯한 다양한 분야에 관심이 있습니다.</p>
                    </div>
                </article>
              
              <article class="summary-card">
                    <div class="image-wrapper">
                        <img src="profile3.jpg" alt="동료 사진">
                        <span class="badge">기획</span>
                    </div>
                    <div class="card-content">
                        <h2>김영희</h2>
                        <p class="part">기획 파트</p>
                        <p class="intro">사용자를 중심으로 하는 기획에 관심이 있습니다.</p>
                    </div>
                </article>
              
              <article class="summary-card">
                    <div class="image-wrapper">
                        <img src="profile3.jpg" alt="동료 사진">
                        <span class="badge">기획</span>
                    </div>
                    <div class="card-content">
                        <h2>김철수</h2>
                        <p class="part">기획 파트</p>
                        <p class="intro">실용적인 웹을 기획하는 것에 관심 있습니다.</p>
                    </div>
              </article>
             
            </div>
        </section>

        <hr class="divider">

        <!-- 2. 상세 자기소개 목록 영역 -->
        <section class="detail-section">
            
            
            <article class="detail-card">
                <h2>김나함</h2>
                <p class="affiliation">멋쟁이사자처럼 14기 / 프론트엔드 파트</p>
                <div class="bio">
                    <p>안녕하세요. 저는 응용생물공학 전공이지만 다양한 분야를 탐색하고 공부하는 것을 좋아합니다.이번 활동을 계기로 프론트엔드 분야에 대해 많이 배우고 알아가는 시간이 되었으면 좋겠습니다.</p>
                </div>
                
                <ul class="skills">
                    <li>HTML / CSS</li>
                    <li>JavaScript</li>
                   
                </ul>
                <p class="contact">이메일: naham9488@gmail.com | 연락처: 010-3626-9488</p>
                <blockquote class="quote">"포기하지 않고 끝까지 해내겠습니다!"</blockquote>
            </article>

            
            <article class="detail-card">
                <h2>이멋사</h2>
                <p class="affiliation">멋쟁이사자처럼 14기 / 프론트엔드 파트</p>
                <div class="bio">
                    <p>획기적인 디자인의 웹을 구현해보고 싶습니다.</p>
                </div>
                <ul class="skills">
                    <li>JavaScript</li>
                  <li>HTML / CSS</li>
                </ul>
                <p class="contact">이메일: lee@likelion.org</p>
                
            </article>

            
            <article class="detail-card">
                <h2>박멋사</h2>
                <p class="affiliation">멋쟁이사자처럼 14기 / 프론트엔드 파트</p>
                <div class="bio">
                    <p>사용자를 생각하는 웹을 구현하고 싶습니다.</p>
                </div>
                <ul class="skills">
                    <li>JavaScript</li>
                    <li>HTML / CSS</li>
                   
                </ul>
                <p class="contact">이메일: park@likelion.org</p>
                <blockquote class="quote">"사용자 경험을 최우선으로!"</blockquote>
            </article>
            <article class="detail-card">
                <h2>김멋사</h2>
                <p class="affiliation">멋쟁이사자처럼 14기 / 백엔드 파트</p>
                <div class="bio">
                    <p>안정적인 서버를 만들고 싶습니다.</p>
                </div>
                <ul class="skills">
                    <li>JavaScript</li>
                  <li>Python</li>
                  <li>Django</li>
                </ul>
                <p class="contact">이메일: kim@likelion.org</p>
                
            </article>
          <article class="detail-card">
                <h2>윤멋사</h2>
                <p class="affiliation">멋쟁이사자처럼 14기 / 백엔드 파트</p>
                <div class="bio">
                    <p>안녕하세요. 저는 사용자를 생각하는 웹 서버 개발에 관심이 많은 백엔드 개발자입니다.</p>
                </div>
                
                <ul class="skills">
                    <li>JavaScript</li>
                    <li>Python</li>
                   
                </ul>
                <p class="contact">이메일: dbs@gmail.com </p>
                
            </article>
          </article>
          <article class="detail-card">
                <h2>서멋사</h2>
                <p class="affiliation">멋쟁이사자처럼 14기 / 백엔드 파트</p>
                <div class="bio">
                    <p>안녕하세요. 저는 성장하기 위해 노력하는 백엔드 개발자입니다.</p>
                </div>
                
                <ul class="skills">
                    <li>JavaScript</li>
                    <li>Python</li>
                  <li>Django (공부 중)</li>
                   
                </ul>
                <p class="contact">이메일: tj@gmail.com </p>
                
      </article>
       <article class="detail-card">
                <h2>나멋사</h2>
                <p class="affiliation">멋쟁이사자처럼 14기 / 백엔드 파트</p>
                <div class="bio">
                    <p>안녕하세요. 저는 백엔드 개발자이지만 백엔드 외에도 다양한 관심사를 가지고 있는 개발자입니다.</p>
                </div>
                
                <ul class="skills">
                    <li>JavaScript</li>
                    <li>Python</li>
                   
                </ul>
                <p class="contact">이메일: na@gmail.com </p>
                
            </article>
       <article class="detail-card">
                <h2>김영희</h2>
                <p class="affiliation">멋쟁이사자처럼 14기 / 기획 파트</p>
                <div class="bio">
                    <p>안녕하세요. 저는 사용자를 생각하는 기획을 하고 싶습니다.</p>
                </div>
                
                <ul class="skills">
                    <li>React</li>
                  <li>Figma</li>
                  <li>Notion</li>
                   
                </ul>
                <p class="contact">이메일: dudgml@gmail.com </p>
                
            </article>
        <article class="detail-card">
                <h2>김철수</h2>
                <p class="affiliation">멋쟁이사자처럼 14기 / 기획 파트</p>
                <div class="bio">
                    <p>안녕하세요. 저는 실용적인 웹을 기획하고 싶습니다.</p>
                </div>
                
                <ul class="skills">
                    <li>React</li>
                  <li>Figma</li>
                  <li>Notion</li>
                   
                </ul>
                <p class="contact">이메일: cjftn@gmail.com </p>
                
            </article>
        </section>
    </main>
</body>
</html>
  );
}
