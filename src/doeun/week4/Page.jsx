import React, { useState } from "react";
import styles from "./Page.module.css";
import { memberspro, members } from "./memberData.js";
import defaultProfile from "./default-profile.jpg";

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
    tech: e.target.tech.value,
    summary: e.target.summary.value,
    intro: e.target.intro.value,
    email: e.target.email.value,
    phone: e.target.phone.value,
    website: e.target.website.value,
    message: e.target.message.value,
    image:
      e.target.image?.value ||
      defaultProfile,
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
  const [sortBy, setSortBy] = useState("default");
  const [filterPart, setFilterPart] = useState("전체");
  const [searchText, setSearchText] = useState("");

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

const getFilteredAndSortedMembers = () => {
  let filtered = [...memberList];

  // 파트 필터
  if (filterPart !== "전체") {
    filtered = filtered.filter((member) => member.part === filterPart);
  }

  // 검색 필터 (이름, 소개, 기술)
  if (searchText.trim()) {
    filtered = filtered.filter((member) =>
      member.name.toLowerCase().includes(searchText.toLowerCase()) ||
      member.intro.toLowerCase().includes(searchText.toLowerCase()) ||
      (member.tech && member.tech.toLowerCase().includes(searchText.toLowerCase()))
    );
  }

  // 정렬
  if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  } else if (sortBy === "part") {
    filtered.sort((a, b) => a.part.localeCompare(b.part, "ko"));
  }
  return filtered;
};

const getDetailMember = (memberName) => {
  const detailMember = members.find((m) => m.name === memberName);
  if (detailMember) {
    const proMember = memberspro.find((m) => m.name === memberName);
    return {
      ...detailMember,
      image: proMember?.image || defaultProfile,
    };
  }
  return null;
};

const handleFillRandomData = async () => {
  try {
    setLoading(true);
    setError("");
    const res = await fetch(
      "https://randomuser.me/api/?results=1&nat=us,gb,ca,au,nz"
    );
    if (!res.ok) {
      throw new Error("API 요청 실패");
    }
    const data = await res.json();
    const user = data.results[0];
    setFormData({
      name: `${user.name.first} ${user.name.last}`,
      part: ["Frontend", "Backend", "Design"][
        Math.floor(Math.random() * 3)
      ],
      tech: ["React", "Node.js", "Figma"][
        Math.floor(Math.random() * 3)
      ],
      summary: `${user.location.country}에서 온 아기사자입니다!`,
      intro: `안녕하세요. ${user.name.first}입니다. 다양한 프로젝트를 경험하며 성장하고 있습니다.`,
      email: user.email,
      phone: user.phone,
      website: `https://github.com/${user.login.username}`,
      message: "열심히 배우고 성장하겠습니다!",
      image: user.picture.large,
    });

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
        {!loading && !error && !success && (
          <span className={styles.readyText}>
            준비완료
          </span>
        )}

        {loading && (
          <span className={styles.loadingText}>
            불러오는 중...
          </span>
        )}

        {success && !loading && (
          <span className={styles.successText}>
            완료!
          </span>
        )}

        {error && (
          <span className={styles.errorBox}>
            <span>{error}</span>
            <button
              className={styles.retryBtn}
              onClick={refreshMembers}
            >
              재시도
            </button>
          </span>
        )}
      </div>

      {/* 필터 & 정렬 & 검색 */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>파트</label>
          <select
            className={styles.filterSelect}
            value={filterPart}
            onChange={(e) => setFilterPart(e.target.value)}
          >
            <option value="전체">전체</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>정렬</label>
          <select
            className={styles.filterSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">기본순</option>
            <option value="name">이름순</option>
            <option value="part">파트순</option>
          </select>
        </div>

        <div className={styles.searchGroup}>
          <label className={styles.filterLabel}>검색</label>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="이름, 소개, 기술 검색"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
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
        <button
          className={styles.closeModalBtn}
          onClick={() => setShowForm(false)}
          aria-label="Close"
        >
          ✕
        </button>
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
                value={formData.name}
                onChange={handleInputChange}
                placeholder="이름"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>파트</label>

              <select
                name="part"
                value={formData.part}
                onChange={handleInputChange}
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Design">Design</option>
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
              value={formData.tech}
              onChange={handleInputChange}
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
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
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
              value={formData.intro}
              onChange={handleInputChange}
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
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="이메일"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Phone</label>

              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="전화번호"
                required
              />
            </div>
          </div>

          {/* 웹사이트 */}
          <div className={styles.inputGroup}>
            <label>Website</label>

            <input
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              required
            />
          </div>

          {/* 한 마디 */}
          <div className={styles.inputGroup}>
            <label>한 마디</label>

            <input
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="데이터가 바뀌면 UI도 바뀐다!"
              required
            />
          </div>

          {/* 버튼 */}
          <div className={styles.modalButtons}>
            <button
              type="button"
              className={styles.randomBtn}
              onClick={handleFillRandomData} // 클릭 이벤트 넣기
            >
              랜덤 값 채우기
            </button>

            <button
              type="submit"
              className={styles.submitBtn}
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
          getFilteredAndSortedMembers().map((member) => (
            <div
              key={member.id}
              className={`${styles.week4card} ${
                member.isMe
                  ? styles.myCard
                  : ""
              }`}
              onClick={() => {
                const detailMember = getDetailMember(member.name);
                setSelectedMember(detailMember);
              }}
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
                  className={`${styles.week4part} ${
                    styles[`part${member.part}`]
                  }`}
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
      {selectedMember && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedMember(null)}
        >
          <div
            className={styles.profileModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeModalBtn}
              onClick={() => setSelectedMember(null)}
              aria-label="Close"
            >
              ✕
            </button>

            {/* 고정 영역: 프로필 이미지, 이름, 역할 */}
            <div className={styles.profileHeader}>
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className={styles.profileImage}
              />
              <h2 className={styles.profileName}>{selectedMember.name}</h2>
              <p className={`${styles.profileRole} ${
                styles[`part${selectedMember.part?.charAt(0).toUpperCase() + selectedMember.part?.slice(1)}`]
              }`}>
                {selectedMember.part?.toUpperCase()} · {selectedMember.track}
              </p>
            </div>

            {/* 스크롤 영역: 섹션들 */}
            <div className={styles.profileContent}>

              {/* 자기소개 섹션 */}
              {selectedMember.intro && (
                <div className={styles.profileSection}>
                  <h3 className={styles.sectionTitle}>자기소개</h3>
                  <p className={styles.sectionText}>{selectedMember.intro}</p>
                </div>
              )}

              {/* 연락처 섹션 */}
              {(selectedMember.email || selectedMember.phone || selectedMember.link) && (
                <div className={styles.profileSection}>
                  <h3 className={styles.sectionTitle}>연락처</h3>
                  <div className={styles.contactList}>
                    {selectedMember.email && (
                      <div className={styles.contactItem}>
                        <span className={styles.contactLabel}>Email:</span>
                        <a href={`mailto:${selectedMember.email}`} className={styles.contactValue}>
                          {selectedMember.email}
                        </a>
                      </div>
                    )}
                    {selectedMember.phone && (
                      <div className={styles.contactItem}>
                        <span className={styles.contactLabel}>Phone:</span>
                        <a href={`tel:${selectedMember.phone}`} className={styles.contactValue}>
                          {selectedMember.phone}
                        </a>
                      </div>
                    )}
                    {selectedMember.link && (
                      <div className={styles.contactItem}>
                        <span className={styles.contactLabel}>Link:</span>
                        <a href={selectedMember.link} target="_blank" rel="noopener noreferrer" className={styles.contactValue}>
                          {selectedMember.link}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 관심 기술 섹션 */}
              {selectedMember.skills && selectedMember.skills.length > 0 && (
                <div className={styles.profileSection}>
                  <h3 className={styles.sectionTitle}>관심 기술</h3>
                  <div className={styles.skillsList}>
                    {selectedMember.skills.map((skill, idx) => (
                      <span key={idx} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 한마디 섹션 */}
              {selectedMember.word && (
                <div className={styles.profileSection}>
                  <h3 className={styles.sectionTitle}>한마디</h3>
                  <p className={styles.wordText}>{selectedMember.word}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}