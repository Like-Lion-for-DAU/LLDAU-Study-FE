import styles from "./Page.module.css";
import { members as initialMembers, pushRandomMembers, usePageScrollDown, useFormData, randomResult, randomNewMember } from "./script.js";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function GridPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [memberList, setMemberList] = useState(state?.memberList ?? initialMembers);

  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [fetching, setFetching] = useState("ready");
  const [sortPart, setSortPart] = useState("all");
  const [sortType, setSortType] = useState("newest");
  const [sortSearch, setSortSearch] = useState("");

  const { formData, setFormData, handleInput, isFormValid, warn, warnFormat, reset } = useFormData();
  const statusResetTimerRef = useRef(null);
  const lastAction = useRef(null);
  const nextIdRef = useRef(memberList.length + 1);
  const extraToggleRef = useRef(null);

  usePageScrollDown(selected, () => setSelected(null));
  usePageScrollDown(showAdd, () => setShowAdd(false));

  useEffect(() => {
    return () => { if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current); };
  }, []);

  useEffect(() => {
    if (!showExtra) return;
    const handleClickOutside = (e) => {
      if (extraToggleRef.current && !extraToggleRef.current.contains(e.target)) {
        setShowExtra(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExtra]);

  const fetchMessage = {
    ready: "준비 완료!",
    loading: "요청 중...",
    success: "작업을 완료하였습니다!",
    error: "실패하였습니다. 잠시 후 다시 시도해주세요.",
  };

  function makeNextId() {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  }

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const skillList = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
    const newMember = {
      id: makeNextId(),
      name: formData.name,
      part: formData.part,
      intro: formData.introduce,
      club: formData.club,
      badge: skillList[0] || "신규",
      image: `https://picsum.photos/seed/${Date.now()}/200/200`,
      introduce: [formData.introduceDetail],
      contact: {
        email: formData.email,
        phone: formData.phone,
        website: { label: formData.website, url: formData.website },
      },
      skills: skillList,
      last: formData.last,
    };
    setMemberList((prev) => [...prev, newMember]);
    setShowAdd(false);
    reset();
  };

  const handleFetchRandom = async () => {
    setFetching("loading");
    lastAction.current = handleFetchRandom;
    try {
      const user = await randomResult(1);
      const newMember = { ...randomNewMember(user[0]), id: makeNextId() };
      setMemberList((prev) => [...prev, newMember]);
      setFetching("success");
      setTimeout(() => setFetching("ready"), 2000);
    } catch {
      setFetching("error");
    }
  };

  const handleFetchFiveRandom = async () => {
    setFetching("loading");
    lastAction.current = handleFetchFiveRandom;
    try {
      const users = await randomResult(5);
      const newMembers = users.map((u) => ({ ...randomNewMember(u), id: makeNextId() }));
      setMemberList((prev) => [...prev, ...newMembers]);
      setFetching("success");
      setTimeout(() => setFetching("ready"), 2000);
    } catch {
      setFetching("error");
    }
  };

  const handleRefresh = async () => {
    setFetching("loading");
    lastAction.current = handleRefresh;
    try {
      const myProfile = memberList.find((m) => m.isMe);
      const lionCount = myProfile ? memberList.length - 1 : memberList.length;
      const users = await randomResult(lionCount);
      const newMembers = users.map((u) => ({ ...randomNewMember(u), id: makeNextId() }));
      setMemberList(myProfile ? [myProfile, ...newMembers] : newMembers);
      setFetching("success");
      setTimeout(() => setFetching("ready"), 2000);
    } catch {
      setFetching("error");
    }
  };

  const handleRetry = () => {
    if (fetching === "error") {
      setFetching("ready");
      if (lastAction.current) lastAction.current();
    }
  };

  const handlePushRandom = async () => {
    const randomData = await pushRandomMembers();
    setFormData(randomData);
  };

  const displayList = memberList
    .filter((member) =>
      sortSearch === "" ||
      member.name?.includes(sortSearch) ||
      member.part?.includes(sortSearch) ||
      member.intro?.includes(sortSearch) ||
      member.skills?.some((skill) => skill?.includes(sortSearch))
    )
    .filter((member) => sortPart === "all" || member.part === sortPart)
    .sort((a, b) => {
      if (sortType === "newest") return a.id - b.id;
      if (sortType === "nameAsc") return a.name.localeCompare(b.name);
      if (sortType === "nameDesc") return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div className={styles["week-page"]}>
      <h2>7주차</h2>

      {/* 검색창 */}
      <div className={styles["searchRow"]}>
        <input
          type="search"
          placeholder="이름, 스킬, 소개로 검색"
          className={styles["searchInput"]}
          value={sortSearch}
          onChange={(e) => setSortSearch(e.target.value)}
        />
      </div>

      {/* 추가 기능 토글 버튼 */}
      <div className={styles["extraToggleRow"]} ref={extraToggleRef}>
        <button className={styles["extraToggleBtn"]} onClick={() => setShowExtra((v) => !v)}>
          {showExtra ? "추가 기능 ▲" : "추가 기능 ▼"}
        </button>
        {showExtra && (
          <div className={styles["extraPanel"]}>
            <div className={styles["actionRow"]}>
              <button className={styles["addButton"]} onClick={() => { setShowAdd(true); reset(); }}>
                아기 사자 추가
              </button>
              <button className={styles["removeButton"]} onClick={() => setMemberList((prev) => prev.slice(0, -1))}>
                마지막 아기 사자 제거
              </button>
            </div>
            <div className={styles["randomButtonsRow"]}>
              <button className={styles["randomOneButton"]} disabled={fetching === "loading"} onClick={handleFetchRandom}>
                랜덤 1명 추가
              </button>
              <button className={styles["randomFiveButton"]} disabled={fetching === "loading"} onClick={handleFetchFiveRandom}>
                랜덤 5명 추가
              </button>
              <button className={styles["refrashButton"]} disabled={fetching === "loading"} onClick={handleRefresh}>
                전체 새로고침
              </button>
              <span className={styles["refrashState"]} role="alert">{fetchMessage[fetching]}</span>
              {fetching === "error" && (
                <button onClick={handleRetry} className={styles["retryButton"]}>재시도</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 리스트 */}
      <div className={styles["bannerSection"]}>
        <div className={styles["bannerHeader"]}>
          <h3 className={styles["bannerTitle"]}>아기 사자들</h3>
          <div className={styles["viewModeToggle"]}>
            <button type="button" className={styles["viewModeBtn"]} onClick={() => navigate("/taewoo/week7")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg></button>
            <button type="button" className={`${styles["viewModeBtn"]} ${styles["viewModeBtnActive"]}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg></button>
          </div>
        </div>

        {/* 파트 / 정렬 */}
        <div className={styles["sortLabelRow"]}>
          <span className={styles["countLion"]}>총 {memberList.length}명</span>
          <select id="sortPart" className={styles["sortSelectPart"]}
            value={sortPart} onChange={(e) => setSortPart(e.target.value)}>
            <option value="all">직군</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="PM">PM</option>
            <option value="Design">Design</option>
          </select>
          <select id="sortType" className={styles["sortSelectSort"]}
            value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="newest">최신 업데이트순</option>
            <option value="nameAsc">이름 오름차순</option>
            <option value="nameDesc">이름 내림차순</option>
          </select>
        </div>

        {displayList.length === 0 ? (
          <p className={styles["noResult"]}>조건에 맞는 아기 사자가 없습니다.</p>
        ) : (
          <div className={styles["gridContainer"]}>
            {displayList.map((member) => (
              <div key={member.id} className={styles["mainProfile"]} onClick={() => setSelected(member)}>
                <p className={styles["badge"]}>
                  <span className={styles["badgeSpace"]}>{member.badge}</span>
                </p>
                <img
                  className={styles["profileImage"]}
                  src={member.image}
                  alt={`${member.name} 프로필 사진`}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://picsum.photos/seed/fallback/200/200"; }}
                />
                <p className={styles["name"]}>{member.name}</p>
                <b className={styles["redText"]}>{member.part}</b>
                <p className={styles["lineIntroduce"]}>{member.intro}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 아기 사자 추가 모달 */}
      {showAdd && (
        <div className={styles["pushLion"]} onClick={() => setShowAdd(false)}>
          <div className={styles["pushLionContent"]} onClick={(e) => e.stopPropagation()}>
            <form className={styles["pushLionGrid"]} onSubmit={handleAddSubmit}>
              <div className={styles["pushLionRow"]}>
                <div className={styles["field"]}>
                  <div className={styles["halfWidth"]}>
                    <label htmlFor="name">이름</label>
                    <input id="name" type="text" className={styles["inputName"]}
                      placeholder="예: 홍아기사자"
                      value={formData.name} onChange={handleInput("name")} />
                    {warn("name") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                  </div>
                </div>
                <div className={styles["field"]}>
                  <label htmlFor="part" className={styles["pushLabel"]}>파트</label>
                  <select id="part" size={1} className={styles["inputPart"]}
                    value={formData.part} onChange={handleInput("part")}>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="PM">PM</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              </div>

              <div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
                <label htmlFor="skills">관심기술 (쉼표로 구분)</label>
                <input id="skills" name="skills" className={styles["inputLongtype"]}
                  placeholder="예: JavaScript, React, HTML/CSS"
                  value={formData.skills} onChange={handleInput("skills")} />
                {warn("skills") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
              </div>

              <div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
                <label htmlFor="introduce" className={styles["pushLabel"]}>한 줄 소개(요약 카드)</label>
                <input id="introduce" type="text" className={styles["inputLongtype"]}
                  placeholder="예: 3주차 DOM 조작 연습 중"
                  value={formData.introduce} onChange={handleInput("introduce")} />
                {warn("introduce") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
              </div>

              <div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
                <label htmlFor="introduceDetail" className={styles["pushLabel"]}>자기소개 (상세 카드)</label>
                <div>
                  <textarea id="introduceDetail" className={styles["inputIntroduce"]}
                    placeholder="예: HTML/CSS로 구조를 만들고, JS로 데이터를 바꾸면 화면이 바뀌는 경험을 하고 있습니다."
                    value={formData.introduceDetail} onChange={handleInput("introduceDetail")} />
                  {warn("introduceDetail") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                </div>
              </div>

              <div className={styles["pushLionRow"]}>
                <div className={styles["field"]}>
                  <label htmlFor="email" className={styles["pushLabel"]}>Email</label>
                  <div className={styles["halfWidth"]}>
                    <input id="email" type="email" className={styles["inputEmail"]}
                      placeholder="예: lion@example.com"
                      value={formData.email} onChange={handleInput("email")} />
                    {warn("email") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                    {warnFormat("email") && <span className={styles["inputWarning"]}><b>!</b> '@' 가 포함되어야 합니다 <b>!</b></span>}
                  </div>
                </div>
                <div className={styles["field"]}>
                  <label htmlFor="phone" className={styles["pushLabel"]}>Phone</label>
                  <div className={styles["halfWidth"]}>
                    <input id="phone" type="tel" className={styles["inputPhone"]}
                      placeholder="예: 010-1234-5678"
                      value={formData.phone} onChange={handleInput("phone")} />
                    {warn("phone") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                    {warnFormat("phone") && <span className={styles["inputWarning"]}><b>!</b> 예시의 형식을 따라주세요 <b>!</b></span>}
                  </div>
                </div>
              </div>

              <div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
                <label htmlFor="website" className={styles["pushLabel"]}>Website</label>
                <input id="website" type="url" className={styles["inputLongtype"]}
                  placeholder="예: https://www.example.com"
                  value={formData.website} onChange={handleInput("website")} />
                {warn("website") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                {warnFormat("website") && <span className={styles["inputWarning"]}><b>!</b> http:// 또는 https:// 로 시작하는 URL이어야 합니다 <b>!</b></span>}
              </div>

              <div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
                <label htmlFor="last" className={styles["pushLabel"]}>한 마디</label>
                <input id="last" type="text" className={styles["inputLongtype"]}
                  placeholder="예: 데이터 바꾸면 화면도 바뀐다!"
                  value={formData.last} onChange={handleInput("last")} />
                {warn("last") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
              </div>

              <button type="button" className={styles["pushRandomButton"]} onClick={handlePushRandom}>
                랜덤 값 채우기
              </button>
              <button type="submit" className={styles["pushLionAddButton"]} disabled={!isFormValid}>
                추가
              </button>
              <button type="button" className={styles["pushLionCancelButton"]} onClick={() => setShowAdd(false)}>
                취소
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 자기소개 모달 */}
      {selected && (
        <div className={styles["modalOverlay"]} onClick={() => setSelected(null)}>
          <div className={styles["modalContent"]} onClick={(e) => e.stopPropagation()}>
            <p className={styles["name"]}>{selected.name}</p>
            <b className={styles["redText"]}>{selected.part}</b>
            <p className={styles["joinClub"]}>{selected.club}</p>
            <hr className={styles["modalDivider"]} />

            {!selected.contact && !selected.skills && !selected.last ? (
              <p className={styles["introduceMyself"]}>아직 준비 중입니다.</p>
            ) : (
              <>
                <h3 className={styles["introduceTitle"]}>자기소개</h3>
                {selected.introduce?.map((text, i) => (
                  <p key={`${selected.id}-intro-${i}`} className={styles["introduceMyself"]}>{text}</p>
                ))}
                {(selected.contact?.email || selected.contact?.phone || selected.contact?.website) && (
                  <>
                    <h3 className={styles["introduceTitle"]}>연락처</h3>
                    <ul>
                      {selected.contact.email && <li className={styles["listStyle"]}>Email: {selected.contact.email}</li>}
                      {selected.contact.phone && <li className={styles["listStyle"]}>Phone: {selected.contact.phone}</li>}
                      {selected.contact.website && (
                        <li className={styles["listStyle"]}>
                          Website: <a href={selected.contact.website.url}>{selected.contact.website.label}</a>
                        </li>
                      )}
                    </ul>
                  </>
                )}
                {selected.skills && (
                  <>
                    <h3 className={styles["introduceTitle"]}>관심 기술</h3>
                    <ul>
                      {selected.skills.map((skill, i) => (
                        <li key={i} className={styles["listStyle"]}>{skill}</li>
                      ))}
                    </ul>
                  </>
                )}
                {selected.last && (
                  <>
                    <h3 className={styles["introduceTitle"]}>한 마디</h3>
                    <p className={styles["introduceLast"]}>{selected.last}</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
