import { useState } from "react";
import styles from "./Page.module.css";
import { members } from "./members";

export default function Week3Page() {
  const [memberList, setMemberList] = useState(members);
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Frontend");
  const [intro, setIntro] = useState("");
  const [badge, setBadge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [comment, setComment] = useState("");
  const addMember = (e) => {
    e.preventDefault();
    const newMember = {
      name: name,
      role: role,
      intro: intro,
      badge: badge,
      email: email,
      phone: phone,
      website: website,
      comment: comment,
      image: members[0].image,
    };
    setMemberList([...memberList, newMember]);
    setName("");
    setRole("Frontend");
    setIntro("");
    setBadge("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setComment("");
    setShowForm(false);
  };
  const deleteLastMember = () => {
    setMemberList(memberList.slice(0, memberList.length - 1));
  };
  return (
    <div className={styles["week-page"]}>
      <div className={styles["weekPage"]}>
        <div className={styles["controlArea"]}>
          <button onClick={() => setShowForm(true)}>
            아기 사자 추가
          </button>
          <button onClick={deleteLastMember}>
            마지막 아기 사자 삭제
          </button>
          <strong>총 {memberList.length}명</strong>
        </div>
        {showForm && (
          <form
            className={styles["formBox"]}
            onSubmit={addMember}
          >
            <input
              required
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Frontend</option>
              <option>Backend</option>
              <option>Design</option>
            </select>
            <input
              required
              placeholder="관심 기술"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
            />
            <input
              required
              placeholder="한 줄 소개"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              required
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="url"
              required
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <input
              required
              placeholder="한 마디"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="submit">
              추가하기
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
            >
              취소
            </button>
          </form>
        )}
        <div className={styles["cardContainer"]}>
          {memberList.map((m) => (
            <div
              key={m.name}
              onClick={() => setSelectedMember(m)}
              className={`${styles["card"]} ${
                m.isMe ? styles["mainCard"] : ""
              }`}
            >
              <div className={styles["imageBox"]}>
                <img
                  className={styles["cardImage"]}
                  src={m.image}
                  alt={`${m.name} 프로필`}
                />
              </div>
              <span className={styles["badge"]}>
                {m.badge}
              </span>
              <div className={styles["cardContent"]}>
                <h3 className={styles["name"]}>
                  {m.name}
                </h3>
                <p className={styles["role"]}>
                  {m.role}
                </p>
                <p className={styles["introduce"]}>
                  {m.intro}
                </p>
              </div>
            </div>
          ))}
        </div>
        {selectedMember && (
          <div className={styles["modalBg"]}>
            <div className={styles["modalBox"]}>
              <button
                className={styles["closeBtn"]}
                onClick={() => setSelectedMember(null)}
              >
                ×
              </button>
              <div className={styles["modalTop"]}>
                <img
                  className={styles["modalImage"]}
                  src={selectedMember.image}
                  alt={selectedMember.name}
                />
                <div>
                  <h2>{selectedMember.name}</h2>
                  <h3>{selectedMember.role}</h3>
                  <p>LION TRACK</p>
                </div>
              </div>
              <div className={styles["modalContent"]}>
                <h3>자기소개</h3>
                <p>{selectedMember.intro}</p>
                <h3>관심 기술</h3>
                <span className={styles["skillTag"]}>
                  {selectedMember.badge}
                </span>
                <h3>연락처</h3>
                <p>Email : {selectedMember.email}</p>
                <p>Phone : {selectedMember.phone}</p>
                <p>Website : {selectedMember.website}</p>
                <h3>각오 한 마디</h3>
                <div className={styles["commentBox"]}>
                  "{selectedMember.comment}"
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}