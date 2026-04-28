import "./Page.css";

export default function Week1Page() {
  return (
    <!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>자기소개</title>
  <style>
    body {
      font-family: sans-serif;
      margin: 0;
      background-color: #f5f5f5;
    }

    .container {
      width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    /* 카드 영역 */
    .card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 20px;
    }


    /* 상세 영역 */
    .detail {
      background: white;
      padding: 20px;
      border-radius: 12px;
    }

    .section {
      margin-bottom: 20px;
    }

    .section h3 {
      margin-bottom: 10px;
    }
  </style>
</head>

<body>
  <div class="container">

    <!-- 1. 자기소개 카드 -->
    <div class="card">
      <h2>김나함</h2>
      <p>Frontend</p>
      <p>분야를 넘나들며 성장하는 개발자입니다.</p>
    </div>

    <!-- 2. 상세 정보 -->
    <div class="detail">

      <div class="section">
        <h3>기본 정보</h3>
        <p>이름: 김나함</p>
        <p>파트: Frontend</p>
        <p>동아리 및 활동: 멋쟁이사자처럼 아기사자 14기, 자기개발 동아리</p>
      </div>

      <div class="section">
        <h3>자기소개</h3>
        <p>
          동아대학교 응용생물공학과 25학번 김나함입니다.
          멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다.
        </p>
      </div>

      <div class="section">
        <h3>관심 기술</h3>
        <ul>
          <li>HTML / CSS</li>
          <li>JavaScript</li>
        </ul>
      </div>

      <div class="section">
        <h3>연락처</h3>
        <p>이메일: naham9488@gmail.com</p>
        <p>전화번호: 010-3626-9488</p>
        <p>인스타: kim_naham</p>
      </div>

      <div class="section">
        <h3>각오</h3>
        <p>부족한 점은 많지만 포기하지 않고 계속 노력하여 성장하는 아기사자가 되겠습니다!</p>
      </div>

    </div>

  </div>
</body>
</html>
    
  );
}
