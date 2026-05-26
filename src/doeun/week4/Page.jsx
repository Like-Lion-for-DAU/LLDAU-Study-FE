import React, { useState } from "react";
import styles from "./Page.module.css";
import { memberspro } from "./memberData.js";
import defaultProfile from "./default-profile.jpg"

// 랜덤 유저 API 데이터 가져오기
const initData = async (number) => {
  const res = await fetch(
    `https://randomuser.me/api/?results=${number}&nat=us,gb,ca,au,nz`
  );

  if (!res.ok) {
    throw new Error("API 요청 실패");
  }

  const data = await res.json();

  return data.results.map((user, idx) => ({
    id: Date.now() + idx,

    name: `${user.name.first} ${user.name.last}`,

    part: ["Frontend", "Backend", "Design"][
      Math.floor(Math.random() * 3)
    ],

    intro: "새로 합류한 아기 사자입니다!",

    image: user.picture.large,

    tech: ["React", "Node", "Figma"][
      Math.floor(Math.random() * 3)
    ],

    isMe: false,
  }));
};

// 마지막 멤버 삭제
const removeLastMember = (list) => {
  return list.slice(0, -1);
};

// 새 멤버 생성
const createNewMember = (e) => {
  return {
    id: Date.now(),

    name: e.target.name.value,

    part: e.target.part.value,

    intro: e.target.intro.value,

    image:
      e.target.image?.value ||
      defaultProfile, // 기본 이미지

    tech: e.target.tech.value,

    isMe: false,
  };
};

export default function Week4Page() {
  const initialFormState = {
  name: "", part: "Frontend", tech: "", summary: "", intro: "", email: "", phone: "", website: "", message: "", image: ""
  };

  // 컴포넌트 내부
  const [formData, setFormData] = useState(initialFormState);

  const [memberList, setMemberList] = useState(memberspro);

  const [showForm, setShowForm] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);

  // 로딩 / 에러 상태
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  // 직접 추가
  const handleSubmit = (e) => {
    e.preventDefault();

    const newMember = createNewMember(e);

    setMemberList((prev) => [
      ...prev,
      newMember,
    ]);

    setShowForm(false);

    e.target.reset();
  };

  // 마지막 삭제
  const handleDeleteLast = () => {
    setMemberList(removeLastMember(memberList));
  };

  // 입력값이 변경될 때 상태를 업데이트하는 함수
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

// 랜덤 값 채우기 클릭 시
const handleFillRandomData = async () => {
  try {
    setLoading(true);
    const [randomUser] = await initData(1); // 방법 1의 수정된 initData 활용
    setFormData(randomUser); // 받아온 정보를 통째로 폼 state에 주입!
    setSuccess(true);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // 랜덤 1명 추가
  const addRandomMember = async () => {
    try {
      setLoading(true);

      setError("");

      setSuccess(false);

      const newMembers = await initData(1);

      setMemberList((prev) => [
        ...prev,
        ...newMembers,
      ]);

      setSuccess(true);
    } catch (error) {
      setError(
        `불러오기 실패: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // 랜덤 5명 추가
  const addRandomFiveMembers = async () => {
    try {
      setLoading(true);

      setError("");

      setSuccess(false);

      const newMembers = await initData(5);

      setMemberList((prev) => [
        ...prev,
        ...newMembers,
      ]);

      setSuccess(true);
    } catch (error) {
      setError(
        `불러오기 실패: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // 전체 새로고침
  const refreshMembers = async () => {
    try {
      setLoading(true);

      setError("");

      setSuccess(false);

      // 기본 멤버로 초기화
      setMemberList(memberspro);

      setSuccess(true);
    } catch (error) {
      setError(
        `새로고침 실패: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["week-page"]}>
      {/* 상단 버튼 */}
      <div className={styles.week4controls}>
        <button
          className={styles.week4btn}
          onClick={() => setShowForm(true)}
        >
          아기 사자 추가
        </button>

        <button
          className={styles.week4btn}
          onClick={handleDeleteLast}
        >
          마지막 아기 사자 삭제
        </button>

        <span className={styles.countText}>
          총{" "}
          <span className={styles.countNumber}>
            {memberList.length}명
          </span>
        </span>
      </div>

      {/* 랜덤 버튼 */}
      <div className={styles.week4controls}>
        <button
          className={styles.week4btn}
          onClick={addRandomMember}
        >
          랜덤 1명 추가
        </button>

        <button
          className={styles.week4btn}
          onClick={addRandomFiveMembers}
        >
          랜덤 5명 추가
        </button>

        <button
          className={styles.week4btn}
          onClick={refreshMembers}
        >
          전체 새로고침
        </button>

        {/* 상태 표시 */}
        {loading && (
          <p className={styles.loadingText}>
            불러오는 중...
          </p>
        )}

        {!loading && !error && !success && (
          <p className={styles.readyText}>
            준비완료
          </p>
        )}

        {success && !loading && (
          <p className={styles.successText}>
            완료!
          </p>
        )}

        {error && (
          <div className={styles.errorBox}>
          <p>{error}</p>

          <button
            className={styles.retryBtn}
            onClick={refreshMembers}
          >
            재시도
          </button>
        </div>
        )}
      </div>

      {/* 전체 화면 모달 */}
      {showForm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowForm(false)}
        >
        <div
          className={styles.bigModal}
          onClick={(e) => e.stopPropagation()}
        >
        <form
          className={styles.bigForm}
          onSubmit={handleSubmit}
        >
          {/* 이름 / 파트 */}
          <div className={styles.row2}>
            <div className={styles.inputGroup}>
              <label>이름</label>

              <input
                type="text"
                name="name"
                placeholder="이름"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>파트</label>

              <select name="part">
                <option value="Frontend">
                  Frontend
                </option>

                <option value="Backend">
                  Backend
                </option>

                <option value="Design">
                  Design
                </option>
              </select>
            </div>
          </div>

          {/* 관심 기술 */}
          <div className={styles.inputGroup}>
            <label>
              관심 기술 (쉼표로 구분)
            </label>

            <input
              type="text"
              name="tech"
              placeholder="JavaScript, React, HTML/CSS"
              required
            />
          </div>

          {/* 한 줄 소개 */}
          <div className={styles.inputGroup}>
            <label>
              한 줄 소개 (요약 카드)
            </label>

            <input
              type="text"
              name="summary"
              placeholder="Frontend에서 합류했어요!"
              required
            />
          </div>

          {/* 자기소개 */}
          <div className={styles.inputGroup}>
            <label>
              자기소개 (상세 카드)
            </label>

            <textarea
              name="intro"
              rows="6"
              placeholder="자기소개 입력"
              required
            />
          </div>

          {/* 이메일 / 전화 */}
          <div className={styles.row2}>
            <div className={styles.inputGroup}>
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="이메일"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Phone</label>

              <input
                type="text"
                name="phone"
                placeholder="전화번호"
                required
              />
            </div>
          </div>

          {/* 웹사이트 */}
          <div className={styles.inputGroup}>
            <label>Website</label>

            <input
              type="text"
              name="website"
              placeholder="https://example.com"
              required
            />
          </div>

          {/* 한 마디 */}
          <div className={styles.inputGroup}>
            <label>한 마디</label>

            <input
              type="text"
              name="message"
              placeholder="데이터가 바뀌면 UI도 바뀐다!"
              required
            />
          </div>

          {/* 버튼 */}
          <div className={styles.modalButtons}>
            <button
              type="button"
              className={styles.randomBtn}
            >
              랜덤 값 채우기
            </button>

            <button
              type="submit"
              className={styles.submitBtn}
              onClick={handleFillRandomData} // 클릭 이벤트 넣기
            >
              추가하기
            </button>

            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() =>
                setShowForm(false)
              }
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
    )}
      {/* 카드 영역 */}
      <div className={styles.week4CardGrid}>
        {memberList.length === 0 ? (
          <p className={styles.emptyMessage}>
            등록된 아기 사자가 없습니다.
          </p>
        ) : (
          memberList.map((member) => (
            <div
              key={member.id}
              className={`${styles.week4card} ${
                member.isMe
                  ? styles.myCard
                  : ""
              }`}
              onClick={() =>
                setSelectedMember(member)
              }
            >
              <div
                className={
                  styles.week4imageWrapper
                }
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className={
                    styles.week4image
                  }
                />

                <span
                  className={
                    styles.week4tag
                  }
                >
                  {member.tech}
                </span>
              </div>

              <div
                className={styles.week4info}
              >
                <h3
                  className={
                    styles.week4name
                  }
                >
                  {member.name}
                </h3>

                <span
                  className={
                    styles.week4part
                  }
                >
                  {member.part}
                </span>

                <p
                  className={
                    styles.week4description
                  }
                >
                  {member.intro}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}