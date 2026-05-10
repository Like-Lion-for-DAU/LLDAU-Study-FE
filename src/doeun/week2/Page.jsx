import { useState } from "react";
import styles from "./Page.module.css";
import { memberspro, members } from "./member.js";
import noprofile from "./default-profile.jpg";

function MemberCard({ member, onClick }) {
  return (
    <div
      className={`${styles.week2SummaryCard} ${
        member.isMe ? styles.myCard : ""
      }`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.week2CardImageWrap}>
        <img
          src={member.image || noprofile}
          alt={member.name}
          className={styles.week2CardImage}
          onError={(e) => {
            e.target.src = noprofile;
          }}
        />

        <span className={styles.week2CardBadge}>
          {member.tech}
        </span>

        {member.isMe && (
          <span className={styles.week2MyBadge}>나</span>
        )}
      </div>

      <div className={styles.week2CardBody}>
        <h3 className={styles.week2CardName}>{member.name}</h3>
        <p className={styles.week2CardPart}>{member.part}</p>
        <p className={styles.week2CardIntro}>{member.intro}</p>
      </div>
    </div>
  );
}

export default function Week2Page() {
  const [selectedMember, setSelectedMember] = useState(null);

  const handleCardClick = (member) => {
    const detail = members.find((m) => m.name === member.name);
    setSelectedMember(detail);
  };

  return (
    <div className={styles.weekPage}>
      {/* 카드 영역 */}
      <div className={styles.week2CardGrid}>
        {memberspro.map((member) => (
          <MemberCard
            key={member.name}
            member={member}
            onClick={() => handleCardClick(member)}
          />
        ))}
      </div>

      {/* 모달 */}
      {selectedMember && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedMember(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selectedMember.name}</h2>

            <p><b>파트:</b> {selectedMember.part}</p>
            <p><b>트랙:</b> {selectedMember.track}</p>

            <p><b>소개:</b> {selectedMember.intro}</p>

            <p><b>Email:</b> {selectedMember.email || "없음"}</p>
            <p><b>Phone:</b> {selectedMember.phone || "없음"}</p>

            <p>
              <b>Link:</b>{" "}
              {selectedMember.link ? (
                <a href={selectedMember.link} target="_blank" rel="noreferrer">
                  {selectedMember.link}
                </a>
              ) : (
                "없음"
              )}
            </p>

            <div>
              <b>Skills:</b>
              <ul>
                {Array.isArray(selectedMember.skills) ? (
                  selectedMember.skills.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))
                ) : selectedMember.skills ? (
                  <li>{selectedMember.skills}</li>
                ) : (
                  <li>없음</li>
                )}
              </ul>
            </div>

            <p><b>한마디:</b> {selectedMember.word || "없음"}</p>
          </div>
        </div>
      )}
    </div>
  );
}