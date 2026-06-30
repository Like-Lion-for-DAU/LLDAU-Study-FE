import { useState, useEffect, useRef, useMemo } from "react";
import styles from "./Page.module.css";
import { members as initialMembers } from "./members.js";
import { Link, useSearchParams } from "react-router-dom";

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

function transformUser(user, id) {
  const part = pick(PARTS);
  const badge = pick(BADGES);
  const club = pick(CLUBS);
  const motto = pick(MOTTOS);
  return {
    id,
    name: `${user.name.first} ${user.name.last}`,
    role: part,
    intro: `${user.location.country} 출신의 아기사자입니다.`,
    image: user.picture.large,
    badge,
    club,
    bio: `안녕하세요, ${user.name.first} ${user.name.last}입니다. ${user.location.city}, ${user.location.country} 출신입니다.`,
    email: user.email,
    phone: user.phone,
    website: "",
    skills: [badge],
    motto,
    isMe: false,
  };
}

async function fetchRandomUsers(count, signal) {
  const res = await fetch(
    `https://randomuser.me/api/?results=${count}&nat=us,gb,ca,au,nz`,
    { signal }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.results;
}

// 요약 카드
function SummaryCard({ member }) {
  return (
    <Link to={`/somin/week7/lions/${member.id}`}className={styles.cardLink}>
      <div className={`${styles.card} ${member.isMe ? styles.myCard : ""}`}>
        <div className={styles.profileimg}>
          {member.image && (
            <img
              src={member.image}
              alt={member.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://picsum.photos/seed/${member.id}/400/400`;
              }}
            />
          )}
        </div>

        <p className={styles.cardName}>
          {member.name}
        </p>

        <p className={styles.cardEnd}>
          {member.role} · {member.badge}
        </p>

        <div className={styles.playBtn}>
          ▶
        </div>
      </div>
    </Link>
  );
}

const EMPTY_FORM = {
  name: "", part: "", skills: "", intro: "",
  bio: "", club: "", email: "", phone: "", website: "", motto: "",
};

const TIMEOUT_MS = 5000;

// 메인 페이지
export default function Week7Page({ membersList, setMembersList,}) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [searchParams, setSearchParams] =
    useSearchParams();
  const partFilter =
    searchParams.get("part") || "ALL";
  const sortOrder =
    searchParams.get("sort") || "latest";
  const searchQuery =
    searchParams.get("q") || "";

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [formError, setFormError] = useState(""); 
  const [isFilling, setIsFilling] = useState(false);
  const [fillError, setFillError] = useState("");
  const fillControllerRef = useRef(null);

  const [asyncStatus, setAsyncStatus] = useState("idle");
  const [asyncMsg, setAsyncMsg] = useState("준비 완료");
  const lastActionRef = useRef(null);

  const latestControllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);
  const statusResetTimerRef = useRef(null);
  const focusResetTimerRef = useRef(null);

  const nextIdRef = useRef(
    membersList.length === 0
      ? 1
      : Math.max(...membersList.map((m) => m.id)) + 1
  );

  function makeNextId() {
    return nextIdRef.current++;
  }


  // 보기 옵션
  const visibleMembers = useMemo(() => {
    let list = [...membersList];

    if (partFilter !== "ALL") {
      list = list.filter((m) => m.role === partFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();

      list = list.filter((m) =>
        m.name.toLowerCase().includes(q)
      );
    }

    if (sortOrder === "latest") {
      list.sort((a, b) => b.id - a.id);
    } else if (sortOrder === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }

    return list;
  }, [membersList, partFilter, searchQuery, sortOrder]);

  const updateParams = ({
    part = partFilter,
    sort = sortOrder,
    q = searchQuery,
  }) => {
    const params = {};
    if (part !== "ALL") {
      params.part = part;
    }
    if (sort !== "latest") {
      params.sort = sort;
    }
    if (q.trim()) params.q = q.trim();  
      setSearchParams(params);
    };

  // ESC 닫기
  useEffect(() => {
    if (!isFormOpen) return;
    const onEsc = (e) => { if (e.key === "Escape") setIsFormOpen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isFormOpen]);

  useEffect(() => {
    return () => {
      if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
      if (focusResetTimerRef.current) clearTimeout(focusResetTimerRef.current);
      if (latestControllerRef.current) latestControllerRef.current.abort();
      if (fillControllerRef.current) fillControllerRef.current.abort(); 
    };
  }, []);

  const scheduleStatusReset = () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    statusResetTimerRef.current = setTimeout(() => {
      setAsyncStatus("idle");
      setAsyncMsg("준비 완료");
    }, 1500);
  };

  const runFetchAction = async (actionFn) => {
    const requestId = ++latestRequestIdRef.current;

    if (latestControllerRef.current) latestControllerRef.current.abort();
    const controller = new AbortController();
    latestControllerRef.current = controller;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    setAsyncStatus("loading");
    setAsyncMsg("불러오는 중...");

    try {
      await actionFn({
        signal: controller.signal,
        isLatest: () => requestId === latestRequestIdRef.current,
      });
      clearTimeout(timeoutId);

      if (requestId !== latestRequestIdRef.current) return;

      setAsyncStatus("success");
      setAsyncMsg("완료!");
      scheduleStatusReset();
    } catch (err) {
      clearTimeout(timeoutId);
      if (requestId !== latestRequestIdRef.current) return;

      if (err.name === "AbortError") {
        if (timedOut) {
          setAsyncStatus("fail");
          setAsyncMsg("불러오기 실패: 시간 초과");
        }
        return;
      }
      setAsyncStatus("fail");
      setAsyncMsg(`불러오기 실패: ${err.message}`);
    }
  };

  const deleteLast = () => {
    setMembersList((prev) => (prev.length === 0 ? prev : prev.slice(0, -1)));
  };

  const handleAddRandom = (count) => {
    lastActionRef.current = () => handleAddRandom(count);
    runFetchAction(async (ctx) => {
      const users = await fetchRandomUsers(count, ctx.signal);
      if (!ctx.isLatest()) return;
      const newMembers = users.map((u) => transformUser(u, makeNextId()));
      setMembersList((prev) => [...prev, ...newMembers]);
    });
  };

  const handleRefreshAll = () => {
    const myCards = membersList.filter((m) => m.isMe);
    const fetchCount = membersList.length - myCards.length;

    if (fetchCount <= 0) {
      setAsyncStatus("idle");
      setAsyncMsg("새로고침할 랜덤 멤버가 없습니다.");
      scheduleStatusReset();  
      return;
    }

    lastActionRef.current = handleRefreshAll;
    runFetchAction(async (ctx) => {
      const users = await fetchRandomUsers(fetchCount, ctx.signal);
      if (!ctx.isLatest()) return;
      const newMembers = users.map((u) => transformUser(u, makeNextId()));
      setMembersList([...myCards, ...newMembers]);
    }); 
  };

  const handleRetry = () => {
    if (lastActionRef.current) lastActionRef.current();
  };

  const handleRandomFill = async () => {
    if (fillControllerRef.current) fillControllerRef.current.abort();
    const controller = new AbortController();
    fillControllerRef.current = controller;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    setIsFilling(true);
    setFillError("");

    try {
      const [raw] = await fetchRandomUsers(1, controller.signal);
      clearTimeout(timeoutId);
      setFormData({
        name: `${raw.name.first} ${raw.name.last}`,
        part: pick(PARTS),
        skills: pick(BADGES),
        intro: `${raw.location.country} 출신의 아기사자입니다.`,
        bio: `안녕하세요, ${raw.name.first} ${raw.name.last}입니다. ${raw.location.city}, ${raw.location.country} 출신입니다.`,
        club: pick(CLUBS),
        email: raw.email,
        phone: raw.phone,
        website: "",
        motto: pick(MOTTOS),
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError" && timedOut) {
        setFillError("시간 초과");
        return;
      }
      if (err.name === "AbortError") return;
      setFillError(err.message);
    } finally {
      setIsFilling(false);
    }
  };


  const handleInput = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const skills = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
    const id = makeNextId();
    const newMember = {
      id,
      name: formData.name.trim(),
      role: formData.part,
      intro: formData.intro.trim(),
      badge: skills[0] || "New",
      club: formData.club.trim(),
      bio: formData.bio.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      website: formData.website.trim(),
      skills,
      motto: formData.motto.trim(),
      image: `https://picsum.photos/seed/${id}/200/200`,
      isMe: false,
    };
    if (!newMember.name || !newMember.role) {
      setFormError("이름과 파트는 필수 항목입니다.");
      return;
    }
    setFormError("");
    setMembersList((prev) => [...prev, newMember]);
    setFormData(EMPTY_FORM);
    setIsFormOpen(false);
  };

  const isLoading = asyncStatus === "loading";

  return (
    <div className={styles.weekPage}>
      <div className={styles.weekPageInner}>
      <div className={styles.controlBar}>
        <div className={styles.controlBarInner}>
          <span className={styles.totalCount}>
            총 <span>{membersList.length}</span>명
          </span>
          <div className={styles.controlBtns}>
            <button
              onClick={() => {
                setFormData(EMPTY_FORM);
                setIsFormOpen((v) => !v);
              }}
              className={styles.btn}
            >
              아기사자 추가
            </button>
            <button onClick={deleteLast} className={styles.btn}>
              마지막 삭제
            </button>
          </div>
        </div>

        <div className={styles.fetchBar}>
          <div className={styles.fetchBtns}>
            <button onClick={() => handleAddRandom(1)} disabled={isLoading} className={styles.btn}>
              랜덤 1명 추가
            </button>
            <button onClick={() => handleAddRandom(5)} disabled={isLoading} className={styles.btn}>
              랜덤 5명 추가
            </button>
            <button onClick={handleRefreshAll} disabled={isLoading} className={styles.btn}>
              전체 새로고침
            </button>
          </div>
          <div className={`${styles.asyncStatus} ${styles[`status_${asyncStatus}`]}`}>
            {asyncStatus === "loading" && <span className={styles.spinner} />}
            <span>{asyncMsg}</span>
            {asyncStatus === "fail" && (
              <button onClick={handleRetry} className={styles.btn}>
                재시도
              </button>
            )}
          </div>
        </div>

        <div className={styles.viewOptions}>
          <select value={partFilter} onChange={(e) => updateParams({ part: e.target.value,})}className={styles.viewSelect}>
            <option value="ALL">전체 파트</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
          </select>
          <select value={sortOrder} onChange={(e) => updateParams({sort: e.target.value,})}className={styles.viewSelect}>
            <option value="latest">최신추가순</option>
            <option value="name">이름순</option>
          </select>
          <div className={styles.searchWrap}>
            <input
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => updateParams({q: e.target.value,})}
              className={styles.viewSearch}
            />
          </div>
        </div>
      </div>
      {isFormOpen && (
      <div className={styles.modalOverlay} onClick={() => setIsFormOpen(false)}>
        <div className={styles.formSection} onClick={(e) => e.stopPropagation()}>
          <div className={styles.formInner}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>새 아기사자 추가</h2>
              <button type="button" onClick={handleRandomFill} disabled = {isFilling} className={styles.btn}>
                  {isFilling ? "불러오는 중..." : "랜덤 값 채우기"}
              </button>
            </div>
            {fillError && ( <p className={styles.formError}>{fillError}</p>)}
            <form onSubmit={handleSubmit}>
                {formError && (<p className={styles.formError}>{formError}</p>)}
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>이름 <span className={styles.required}>*</span></label>
                  <input
                    name="name" type="text" placeholder="홍길동" required
                    value={formData.name} onChange={handleInput("name")}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>파트 <span className={styles.required}>*</span></label>
                  <select
                    name="part" required
                    value={formData.part} onChange={handleInput("part")}
                  >
                    <option value="" disabled>선택하세요</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label>관심 기술 <span className={styles.required}>*</span> <small>(쉼표로 구분)</small></label>
                  <input
                    name="skills" type="text" placeholder="ex: React, JavaScript" required
                    value={formData.skills} onChange={handleInput("skills")}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label>한 줄 소개 <span className={styles.required}>*</span></label>
                  <input
                    name="intro" type="text" placeholder="요약 카드용 짧은 소개" required
                    value={formData.intro} onChange={handleInput("intro")}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label>자기소개 <span className={styles.required}>*</span></label>
                  <textarea
                    name="bio" rows={3} placeholder="상세 카드용 자기소개" required
                    value={formData.bio} onChange={handleInput("bio")}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label>동아리명 <span className={styles.required}>*</span></label>
                  <input
                    name="club" type="text" placeholder="ex: 디스이즈" required
                    value={formData.club} onChange={handleInput("club")}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>이메일 <span className={styles.required}>*</span></label>
                  <input
                    name="email" type="email" placeholder="example@email.com" required
                    value={formData.email} onChange={handleInput("email")}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>전화번호 <span className={styles.required}>*</span></label>
                  <input
                    name="phone" type="tel" placeholder="010-0000-0000" required
                    value={formData.phone} onChange={handleInput("phone")}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label>웹사이트 <small>(선택)</small></label>
                  <input
                    name="website" type="url" placeholder="https://github.com/..."
                    value={formData.website} onChange={handleInput("website")}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                  <label>각오 한 마디 <span className={styles.required}>*</span></label>
                  <input
                    name="motto" type="text" placeholder="각오 한 마디" required
                    value={formData.motto} onChange={handleInput("motto")}
                  />
                </div>
                <div className={`${styles.formActions} ${styles.formGroupFull}`}>
                  <button type="submit" className={styles.btn}>추가하기</button>
                  <button type="button" onClick={() => setIsFormOpen(false)} className={styles.btn}>취소</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      <section className={styles.cardSection}>
        {visibleMembers.length === 0 ? (
          <p className={styles.emptyMsg}>표시할 아기 사자가 없습니다.</p>
        ) : (
          <div className={styles.cardIntro}>
            {visibleMembers.map((member) => (
              <SummaryCard
                key={member.id} 
                member={member}
              />
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
};