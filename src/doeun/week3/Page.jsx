import React, { useState, useEffect } from 'react';
import styles from "./Page.module.css";
import { memberspro } from '../week2/member.js';
import { createNewMember, removeLastMember } from './memberadd.js';

export default function Week3Page() {
  const [memberList, setMemberList] = useState(memberspro);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMember = createNewMember(e);
    // setMemberList([...memberList, newMember]);
    setMemberList((prev) => [...prev, newMember]);
    setShowForm(false);
  };

  const handleDeleteLast = () => {
    setMemberList(removeLastMember(memberList));
  };

  return (
    <div className={styles["week-page"]}>
      <div className={styles.week3controls}>
        <button className={styles.week3btn} onClick={() => setShowForm(!showForm)}>
          아기 사자 추가
        </button>
        <button className={styles.week3btn} onClick={handleDeleteLast}>
          마지막 아기 사자 삭제
        </button>
        <span className={styles.countText}>
          총 <span className={styles.countNumber}>{memberList.length}명</span>
        </span>
      </div>

      {showForm && (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>이름</label>
              {/* form태그!! required: 빈 값일 때 "이 입력란을 작성하세요"라고 뜸 */}
              <input name="name" type="text" placeholder="예: 홍아기사자" required />
            </div>
            <div className={styles.formGroup}>
              <label>파트</label>
              <select name="part" required>
                <option value="">선택해주세요</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Design">Design</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>관심 기술 (쉼표로 구분)</label>
            <input name="tech" type="text" placeholder="예: JavaScript, React, HTML/CSS" required />
          </div>

          <div className={styles.formGroup}>
            <label>한 줄 소개 (요약 카드)</label>
            <input name="intro" type="text" placeholder="예: 3주차 DOM 조작 연습 중!" required/>
          </div>

          <div className={styles.formGroup}>
            <label>자기소개 (상세 카드)</label>
            <textarea name="description" placeholder="예: HTML/CSS로 구조를 만들고, JS로 데이터를 바꾸면..." required/>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Email</label>
              {/* form태그!! type="email": @가 없는 경우 자동으로 에러 메시지가 뜸 */}
              <input name="email" type="email" placeholder="예: lion@example.com" required/>
            </div>
            <div className={styles.formGroup}>
              <label>Phone</label>
              <input name="phone" type="text" placeholder="예: 010-1234-5678" required />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Website</label>
            <input name="website" type="url" placeholder="예: https://example.com" required/>
          </div>

          <div className={styles.formGroup}>
            <label>한 마디</label>
            <input name="comment" type="text" placeholder="예: 데이터 바꾸면 화면도 바뀐다!" required/>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn}>추가하기</button>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>취소</button>
          </div>
        </form>
      )}

      <div className={styles.week3CardGrid}> 
        {memberList.length === 0 ? (
          <p className={styles.emptyMessage}>
            등록된 아기 사자가 없습니다.
          </p>
        ) : (
        memberList.map((member) => (
          <div
          key={member.id}
          className={`${styles.week3card} ${
            member.isMe ? styles.myCard : ""
          }`}
          onClick={() => setSelectedMember(member)}
        >
            <div className={styles.week3imageWrapper}>
              <img 
                src={member.image} 
                alt={member.name} 
                className={styles.week3image} 
              />
              <span className={styles.week3tag}>{member.tech}</span>
            </div>
            <div className={styles.week3info}>
              <h3 className={styles.week3name}>{member.name}</h3>
              <span className={styles.week3part}>{member.part}</span>
              <p className={styles.week3description}>{member.intro}</p>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
}