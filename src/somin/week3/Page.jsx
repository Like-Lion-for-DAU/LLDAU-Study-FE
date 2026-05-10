import React, { useState } from "react";
import styles from "./Page.module.css";
import { members as initialMembers } from "./members.js";

// 요약 카드
function SummaryCard({ member }) {
  return (
    <div className={styles.card}>
      <div className={styles.profileimg}>
        {member.image && <img src={member.image} alt={member.name} />}
        <span className={styles.badge}>{member.badge || "New"}</span>
      </div>
      <p className={styles.name}>{member.name}</p>
      <p className={styles.end}>{member.role}</p>
      <p>{member.intro}</p>
    </div>
  );
}

// 상세 카드
function DetailCard({ member }) {
  return (
    <div className={styles.detail}>
      <div className={styles.main}>
        <p className={styles.name}>{member.name}</p>
        <p className={styles.end}>{member.role}</p>
        <p className={styles.club}>{member.club}</p>
      </div>
      <div className={styles.introduce}>
        <p>자기소개</p>
        <p>{member.bio}</p>
      </div>
      <div className={styles.contact}>
        <p>연락처</p>
        <ul>
          <li>email : {member.email}</li>
          <li>phone : {member.phone}</li>
          {member.website && (
            <li>
              website : <a href={member.website}>{member.website}</a>
            </li>
          )}
        </ul>
      </div>
      <div className={styles.interest}>
        <p>관심기술</p>
        <ul>
          {member.skills &&
            member.skills.map((skill, idx) => <li key={idx}>{skill}</li>)}
        </ul>
      </div>
      <div className={styles.gako}>
        <p>각오 한 마디</p>
        <p>{member.motto}</p>
      </div>
    </div>
  );
}

// 메인 페이지
export default function Week3Page() {
  const [membersList, setMembersList] = useState(initialMembers || []);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const toggleForm = () => setIsFormOpen(!isFormOpen);

  const deleteLast = () => {
    if (membersList.length === 0) return;
    const newList = [...membersList];
    newList.pop();
    setMembersList(newList);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const skillsRaw = formData.get("skills").split(",");
    const skills = skillsRaw.map((s) => s.trim()).filter((s) => s !== "");

    const newMember = {
      name: formData.get("name").trim(),
      role: formData.get("part"),
      intro: formData.get("intro").trim(),
      badge: skills[0] || "",
      club: formData.get("club").trim(),
      bio: formData.get("bio").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      website: formData.get("website").trim(),
      skills: skills,
      motto: formData.get("motto").trim(),
    };

    if (!newMember.name || !newMember.role) {
      alert("이름과 파트는 필수 항목입니다.");
      return;
    }

    setMembersList([...membersList, newMember]);
    setIsFormOpen(false);
    e.target.reset();
  };

  return (
    <div className={styles.weekPage}>
      <div className={styles.controlBar}>
        <div className={styles.controlBarInner}>
          <span className={styles.totalCount}>
            총 <span>{membersList.length}</span>명
          </span>
          <div className={styles.controlBtns}>
            <button onClick={toggleForm} className={`${styles.btn} ${styles.btnPrimary}`}>
              아기사자 추가
            </button>
            <button onClick={deleteLast} className={`${styles.btn} ${styles.btnDanger}`}>
              마지막 아기사자 삭제
            </button>
          </div>
        </div>
      </div>

      {isFormOpen && (
          <form className={styles.formSection} style={{ display: "block" }} onSubmit={handleSubmit}>
            <div className={styles.formInner}>
              <h2 className={styles.formTitle}>새 아기사자 추가</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>이름 <span className={styles.required}>*</span></label>
                <input name="name" type="text" placeholder="홍길동" required />
              </div>

              <div className={styles.formGroup}>
                <label>파트 <span className={styles.required}>*</span></label>
                <select name="part" required>
                  <option value=""> 선택하세요 </option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>관심 기술 <span className={styles.required}>*</span> <small>(쉼표로 구분)</small></label>
                <input name="skills" type="text" placeholder="ex: React, JavaScript" required />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>한 줄 소개 <span className={styles.required}>*</span></label>
                <input name="intro" type="text" placeholder="요약 카드용 짧은 소개" required />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>자기소개 <span className={styles.required}>*</span></label>
                <textarea name="bio" rows={3} placeholder="상세 카드용 자기소개" required />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>동아리명 <span className={styles.required}>*</span></label>
                <input name="club" type="text" placeholder="ex : 디스이즈" required />
              </div>

              <div className={styles.formGroup}>
                <label>이메일 <span className={styles.required}>*</span></label>
                <input name="email" type="email" placeholder="example@email.com" required />
              </div>

              <div className={styles.formGroup}>
                <label>전화번호 <span className={styles.required}>*</span></label>
                <input name="phone" type="text" placeholder="010-0000-0000" required />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>웹사이트 <small>(선택)</small></label>
                <input name="website" type="text" placeholder="ex : https://github.com/..." />
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>한 마디 <span className={styles.required}>*</span></label>
                <input name="motto" type="text" placeholder="각오 한 마디" required />
              </div>

              <div className={`${styles.formActions} ${styles.formGroupFull}`}>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  추가하기
                </button>
                <button
                  type="button"
                  onClick={toggleForm}
                  className={`${styles.btn} ${styles.btnGhost}`}
                >
                  취소
                </button>
              </div>
            </div>
            </div>
          </form>
      )}

      <section className={styles.cardSection}>
        <div className={styles.cardIntro}>
          {membersList.map((member, index) => (
            <SummaryCard key={index} member={member} />
          ))}
        </div>
      </section>

      <section className={styles.cardSection}>
        <div className={styles.cardDetail}>
          {membersList.map((member, index) => (
            <DetailCard key={index} member={member} />
          ))}
        </div>
      </section>
    </div>
  );
}