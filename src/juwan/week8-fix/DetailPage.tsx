import { Link, useLocation, useParams } from "react-router-dom";
import styles from "./Page.module.css";
import type { MemberItem } from "./types";

// week8 리뷰 2-5: useParams의 반환은 사실 Partial<{...}>라 memberId가 string | undefined이다.
// destructure 후 항상 undefined 가능성을 의식하고 처리해야 한다.

interface DetailPageProps {
  memberList: MemberItem[];
}

export default function DetailPage({ memberList }: DetailPageProps) {
  // useParams의 제네릭은 Record<string, string | undefined>를 만족하는 모양이어야 한다.
  // 인라인 객체 타입으로 적으면 자동으로 그 제약을 통과.
  const { memberId } = useParams<{ memberId: string }>();
  // memberId는 실제 타입이 string | undefined
  const location = useLocation();

  const selectedMember = memberList.find((member) => member.id === memberId);

  // 목록으로 돌아갈 때 query string(필터/정렬/검색)을 유지한다 - 주완 원본의 좋은 디테일
  const backToListPath = {
    pathname: "..",
    search: location.search,
  };

  return (
    <div className={styles.weekPage}>
      <Link className={styles.backButton} to={backToListPath}>
        ← 목록으로
      </Link>

      {selectedMember ? (
        <section className={styles.detailPageCard}>
          <div className={styles.detailTitleBar}>
            {selectedMember.isMe ? "MY_PROFILE.EXE" : "MEMBER_DETAIL.EXE"}
          </div>

          <div className={styles.detailPageBody}>
            <img
              className={styles.detailImage}
              src={selectedMember.image}
              alt={`${selectedMember.name} 프로필`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://picsum.photos/seed/${selectedMember.id}/400/300`;
              }}
            />

            <div className={styles.detailInfo}>
              <h1 className={styles.detailName}>{selectedMember.name}</h1>
              <p className={styles.detailRole}>{selectedMember.role}</p>
              <p className={styles.detailClub}>{selectedMember.club}</p>

              <h2 className={styles.detailSubTitle}>자기소개</h2>
              <p className={styles.detailText}>{selectedMember.description}</p>

              <h2 className={styles.detailSubTitle}>연락처</h2>
              <ul className={styles.detailList}>
                <li>Email : {selectedMember.email}</li>
                <li>Phone : {selectedMember.phone}</li>
                {selectedMember.website && (
                  <li>
                    <a
                      href={selectedMember.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {selectedMember.website}
                    </a>
                  </li>
                )}
              </ul>

              <h2 className={styles.detailSubTitle}>관심 기술</h2>
              <ul className={styles.detailList}>
                <li>{selectedMember.badge}</li>
              </ul>

              <h2 className={styles.detailSubTitle}>한 마디</h2>
              <p className={styles.detailText}>{selectedMember.comment}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.detailPageCard}>
          <div className={styles.detailTitleBar}>ERROR.EXE</div>
          <div className={styles.detailPageBody}>
            <p className={styles.emptyText}>
              해당 아기 사자를 찾을 수 없습니다.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
