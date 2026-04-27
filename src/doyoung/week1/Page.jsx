import "./Page.css";

export default function Week1Page() {
  return (
    <div className="week-page">
      <h2>1주차 과제 제출</h2>
      <header>
        <h1>자기소개 만들기</h1>
      </header>
      <section className="card">
        <article>
          <img src="https://i.pinimg.com/236x/4d/95/31/4d9531cd97ec55ed7ec35448fbe0e41d.jpg" alt="프로필 사진" width="300px"/>
          <h2>임도영</h2>
          <p className="frontend">Frontend</p>
          <p><strong>한 줄 자기소개:</strong>아기사자 14기 프론트엔드 임도영 입니다.</p>
        </article>
      </section>
      <main className="container">
        <section>
          <h2>기본 정보</h2>
          <ul>
            <li><strong>이름:</strong> 임도영</li>
            <li>
              <strong>소속 파트:</strong> 
              <span className="frontend"> Frontend</span>
              </li>
            <li><strong>동아리명:</strong> 디스이즈</li>
          </ul>
        </section>
        <section>
          <h2>자기소개</h2>
          <p>
            동아대 26학번 컴퓨터공학과, 아기사자 14기 임도영입니다.
            이번 활동을 통해 많이 공부하며, 공부한 것을 활동 및 대회 참여를 통해 활용해나가며 경험과 기술을 쌓기 위해 노력하겠습니다.
            앞으로 잘 부탁드립니다.
          </p>
        </section>

        <section>
          <h2>관심 기술</h2>
          <div className="skills">
            <div>HTML / CSS</div>
            <div>JavaScript</div>
            <div>React</div>
            <div>JAVA</div>
            <div>C / C++</div>
          </div>
        </section>

        <section>
          <h2>연락처</h2>
          <p><strong>이메일:</strong> <a href="mailto:dlaehdud342@naver.com">dlaehdud342@naver.com</a></p>
          <p><strong>사이트:</strong> <a href="https://www.google.com" target="_blank">https://www.google.com</a></p>
          <p><strong>연락처:</strong> <a href="tel:01035166306">010-3516-6306</a></p>
        </section>

        <section>
          <h2>각오 한 마디</h2>
          <p>꾸준히 노력하고 적극적인 참여를 통해 성장하는 개발자가 되겠습니다.</p>
        </section>
      </main>
    </div>
  );
}
