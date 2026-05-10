import React, { useState } from 'react';
import styles from "./Page.module.css";
import { memberspro } from '../../doeun/week2/member.js';

export default function Week3Page() {
  const [memberList, setMemberList] = useState(memberspro);

  return (
    <div className={styles["week-page"]}>
      <div className={styles.week3controls}>
        <button className={styles.week3btn}>아기 사자 추가</button>
        <button className={styles.week3btn}>마지막 아기 사자 삭제</button>
        <span className={styles.week3countText}>
          총 <span className={styles.week3countNumber}>{memberList?.length || 0}명</span>
        </span>
      </div>

      <div className={styles.week3CardGrid}> 
        {memberList && memberList.map((member, index) => (
          <div key={`${member.name}-${index}`} className={styles.week3card}>
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
        ))}
      </div>
    </div>
  );
}