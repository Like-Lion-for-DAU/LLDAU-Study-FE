import React, { useState, useEffect, useRef} from "react";
import styles from "./Page.module.css";
import { members as initialMembers } from "./members.js";


// API
const PARTS = ["Frontend", "Backend", "Design"];
const BADGES = ["React", "Node.js", "JavaScript", "TypeScript", "HTML/CSS", "Python", "Next.js"];
const CLUBS = ["멋쟁이사자처럼", "디스이즈", "LION TRACK", "DAU_DSIS"];
const MOTTOS = [
  "열심히 배워서 성장하는 개발자가 되겠습니다.",
  "기초를 탄탄히 다지며 꾸준히 노력하겠습니다.",
  "팀원들에게 든든한 개발자가 되고 싶습니다.",
  "모두가 원하는 개발자가 되어보겠습니다.",
];

//랜덤요소 출력 함수
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function transformUser(user, idx) {
  const id = Date.now() + idx;
  const part = pick(PARTS);
  const badge = pick(BADGES);
  return {
    id,
    name: `${user.name.first} ${user.name.last}`,
    role: part,
    intro: `${user.location.country} 출신의 아기사자입니다.`,
    image: user.picture.large,
    badge,
    club: pick(CLUBS),
    bio: `안녕하세요, ${user.name.first} ${user.name.last}입니다. ${user.location.city}, ${user.location.country} 출신입니다.`,
    email: user.email,
    phone: user.phone,
    website: "",
    skills: [badge],
    motto: pick(MOTTOS),
    isMe: false,
  };
}

async function fetchRandomUsers(count) {
  const res = await fetch(
    `https://randomuser.me/api/?results=${count}&nat=us,gb,ca,au,nz`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.results.map((u, i) => transformUser(u, i));
}

// 요약 카드

function SummaryCard({ member, onClick }) {
  return (
    <div
      className={`${styles.card} ${member.isMe ? styles.myCard : ""}`}
      onClick={onClick}
    >
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

function DetailCard({ member, detailRef, focused }) {
  return (
    <div
      className={`${styles.detail} ${focused ? styles.focused : ""}`}
      ref={detailRef}
    >
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
          {member.website && member.website.trim() && (
            <li>
              website :{" "}
              <a href={member.website} target="_blank" rel="noopener noreferrer">
                {member.website}
              </a>
            </li>
          )}
        </ul>
      </div>
      <div className={styles.interest}>
        <p>관심기술</p>
        <ul>
          {member.skills?.map((skill, idx) => (
            <li key={idx}>{skill}</li>
          ))}
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
export default function Week4Page() {
  const [membersList, setMembersList] = useState(initialMembers || []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [partFilter, setPartFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedName, setFocusedName] = useState(null);

  // 비동기 상태
  const [asyncStatus, setAsyncStatus] = useState("idle");
  const [asyncMsg, setAsyncMsg] = useState("준비 완료");
  const lastActionRef = useRef(null);

  const detailRefs = useRef({});
  const formRef = useRef(null);

  // 보기 옵션
  let visibleMembers = [...membersList];
  if (partFilter !== "ALL") {
    visibleMembers = visibleMembers.filter(
      (m) => m.role === partFilter
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    visibleMembers = visibleMembers.filter((m) =>
      m.name.toLowerCase().includes(q)
    );
  }

  if (sortOrder === "name") {
    visibleMembers.sort((a, b) =>
      a.name.localeCompare(b.name, "ko")
    );
  }

  // ESC 닫기
  useEffect(() => {
    if (!isFormOpen) return;
    const onEsc = (e) => { if (e.key === "Escape") setIsFormOpen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isFormOpen]);

  // 상세로 스크롤
  const handleCardClick = (name) => {
    detailRefs.current[name]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setFocusedName(name);
    setTimeout(() => setFocusedName(null), 900);
  };

  //  마지막 삭제
  const deleteLast = () => {
    setMembersList((prev) => (prev.length === 0 ? prev : prev.slice(0, -1)));
  };

  // 비동기 실행
  const handleAddRandom = async (count) => {
    lastActionRef.current = () => handleAddRandom(count);

    setAsyncStatus("loading");
    setAsyncMsg("불러오는 중...");

    try {
      const newMembers = await fetchRandomUsers(count);

      setMembersList((prev) => [...prev, ...newMembers]);

      setAsyncStatus("success");
      setAsyncMsg("완료!");

      setTimeout(() => {
        setAsyncStatus("idle");
        setAsyncMsg("준비 완료");
      }, 1500);

    } 
    catch (err) {
      setAsyncStatus("fail");
      setAsyncMsg(`불러오기 실패: ${err.message}`);
    }
  };

  const handleRefreshAll = async () => {
    lastActionRef.current = handleRefreshAll;
    setAsyncStatus("loading");
    setAsyncMsg("불러오는 중...");

    try {
      const currentCount = membersList.length;
      const myCards = membersList.filter((m) => m.isMe);
      const fetchCount = Math.max(
        currentCount - myCards.length,
        1
      );

      const newMembers = await fetchRandomUsers(fetchCount);

      setMembersList([...myCards, ...newMembers]);

      setAsyncStatus("success");
      setAsyncMsg("완료!");

      setTimeout(() => {
        setAsyncStatus("idle");
        setAsyncMsg("준비 완료");
      }, 1500);

    } catch (err) {
      setAsyncStatus("fail");
      setAsyncMsg(`불러오기 실패: ${err.message}`);
    }
  };

  // 재시도
  const handleRetry = () => {
    if (lastActionRef.current) {
      lastActionRef.current();
    }
  };

  // 폼 랜덤 채우기
  const handleRandomFill = async () => {
    try {
      const [u] = await fetchRandomUsers(1);
      const f = formRef.current;
      if (!f) return;
      f.querySelector('[name="name"]').value = u.name;
      f.querySelector('[name="part"]').value = u.role;
      f.querySelector('[name="skills"]').value = u.skills.join(", ");
      f.querySelector('[name="intro"]').value = u.intro;
      f.querySelector('[name="bio"]').value = u.bio;
      f.querySelector('[name="club"]').value = u.club;
      f.querySelector('[name="email"]').value = u.email;
      f.querySelector('[name="phone"]').value = u.phone;
      f.querySelector('[name="motto"]').value = u.motto;
    } catch (e) {
      alert("랜덤 값 불러오기 실패: " + e.message);
    }
  };

  // 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const skills = fd.get("skills").split(",").map((s) => s.trim()).filter(Boolean);
    const nextId = Date.now();
    const newMember = {
      id: nextId,
      name: fd.get("name").trim(),
      role: fd.get("part"),
      intro: fd.get("intro").trim(),
      badge: skills[0] || "New",
      club: fd.get("club").trim(),
      bio: fd.get("bio").trim(),
      email: fd.get("email").trim(),
      phone: fd.get("phone").trim(),
      website: fd.get("website").trim(),
      skills,
      motto: fd.get("motto").trim(),
      image: `https://picsum.photos/seed/${nextId}/200/200`,
      isMe: false,
    };
    if (!newMember.name || !newMember.role) {
      alert("이름과 파트는 필수 항목입니다.");
      return;
    }
    setMembersList((prev) => [...prev, newMember]);
    setIsFormOpen(false);
    e.target.reset();
  };

  const isLoading = asyncStatus === "loading";

  return (
    <div className={styles.weekPage}>
      <div className={styles.controlBar}>
        <div className={styles.controlBarInner}>
          <span className={styles.totalCount}>
            총 <span>{membersList.length}</span>명
          </span>
          <div className={styles.controlBtns}>
            <button onClick={() => setIsFormOpen((v) => !v)} className={`${styles.btn} `}>
              아기사자 추가
            </button>
            <button onClick={deleteLast} className={`${styles.btn}`}>
              마지막 삭제
            </button>
          </div>
        </div>

        <div className={styles.fetchBar}>
          <div className={styles.fetchBtns}>
            <button onClick={() => handleAddRandom(1)} disabled={isLoading} className={`${styles.btn} `}>
              랜덤 1명 추가
            </button>
            <button onClick={() => handleAddRandom(5)} disabled={isLoading} className={`${styles.btn}`}>
              랜덤 5명 추가
            </button>
            <button onClick={handleRefreshAll} disabled={isLoading} className={`${styles.btn} `}>
              전체 새로고침
            </button>
          </div>
          <div className={`${styles.asyncStatus} ${styles[`status_${asyncStatus}`]}`}>
            {asyncStatus === "loading" && <span className={styles.spinner} />}
            <span>{asyncMsg}</span>
            {asyncStatus === "fail" && (
              <button onClick={handleRetry} className={`${styles.btn}`}>
                재시도
              </button>
            )}
          </div>
        </div>

        <div className={styles.viewOptions}>
          <select value={partFilter} onChange={(e) => setPartFilter(e.target.value)} className={styles.viewSelect}>
            <option value="ALL">전체 파트</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={styles.viewSelect}>
            <option value="latest">최신추가순</option>
            <option value="name">이름순</option>
          </select>
          <div className={styles.searchWrap}>
            <input
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.viewSearch}
            />
          </div>
        </div>
      </div>

      {isFormOpen && (
        <form className={styles.formSection} onSubmit={handleSubmit} ref={formRef}>
          <div className={styles.formInner}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>새 아기사자 추가</h2>
              <button
                type="button"
                onClick={handleRandomFill}
                className={`${styles.btn} ${styles.btnRandom}`}
              >
                랜덤 값 채우기
              </button>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>이름 <span className={styles.required}>*</span></label>
                <input name="name" type="text" placeholder="홍길동" required />
              </div>
              <div className={styles.formGroup}>
                <label>파트 <span className={styles.required}>*</span></label>
                <select name="part" required defaultValue="">
                  <option value="" disabled>선택하세요</option>
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
                <input name="club" type="text" placeholder="ex: 디스이즈" required />
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
                <input name="website" type="text" placeholder="https://github.com/..." />
              </div>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label>각오 한 마디 <span className={styles.required}>*</span></label>
                <input name="motto" type="text" placeholder="각오 한 마디" required />
              </div>
              <div className={`${styles.formActions} ${styles.formGroupFull}`}>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>추가하기</button>
                <button type="button" onClick={() => setIsFormOpen(false)} className={`${styles.btn} ${styles.btnGhost}`}>취소</button>
              </div>
            </div>
          </div>
        </form>
      )}

    
      <section className={styles.cardSection}>
        {visibleMembers.length === 0 ? (
          <p className={styles.emptyMsg}> 표시할 아기 사자가 없습니다.</p>
        ) : (
          <div className={styles.cardIntro}>
            {visibleMembers.map((member) => (
              <SummaryCard
                key={member.id ?? member.name}
                member={member}
                onClick={() => handleCardClick(member.name)}
              />
            ))}
          </div>
        )}
      </section>

      <section className={styles.cardSection}>
        <div className={styles.cardDetail}>
          {visibleMembers.map((member) => (
            <DetailCard
              key={member.id ?? member.name}
              member={member}
              detailRef={(el) => { if (el) detailRefs.current[member.name] = el; }}
              focused={focusedName === member.name}
            />
          ))}
        </div>
      </section>
    </div>
  );
}