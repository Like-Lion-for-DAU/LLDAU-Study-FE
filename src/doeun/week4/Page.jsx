import styles from "./Page.module.css";
import { memberspro } from "./memberData.js";

export default function Week4Page() {
  return (
    <div className={styles["week-page"]}>
      {/* 상단 버튼 */}
      <div className={styles.topButtons}>
        <button>아기사자 추가</button>
        <button>마지막 아기사자 삭제</button>
        <span className={styles.total}>총 9명</span>
      </div>

      <div className={styles.subButtons}>
        <button>랜덤 1명 추가</button>
        <button>랜덤 5명 추가</button>
        <button>전체 새로고침</button>
        <span className={styles.ready}>준비 완료</span>
      </div>

      {/* 필터 영역 */}
      <div className={styles.filterSection}>
        <div className={styles.filterBox}>
          <label>파트</label>
          <select>
            <option>전체</option>
            <option>Frontend</option>
            <option>Backend</option>
            <option>Design</option>
          </select>
        </div>

        <div className={styles.filterBox}>
          <label>정렬</label>
          <select>
            <option>최신추가순</option>
            <option>이름순</option>
          </select>
        </div>

        <div className={styles.filterBox}>
          <label>검색</label>
          <input type="text" placeholder="이름으로 검색" />
        </div>
      </div>

      {/* 카드 영역 */}
      <div className={styles.cardGrid}>
        {memberspro.map((member) => (
          <div key={member.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img src={member.image} alt={member.name} />

              <div className={styles.tag}>
                {member.tag}
              </div>
            </div>

            <div className={styles.cardContent}>
              <h3>{member.name}</h3>

              <p className={styles.part}>
                {member.part}
              </p>

              <p className={styles.intro}>
                {member.intro}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}