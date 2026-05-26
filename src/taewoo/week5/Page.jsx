import styles from "./Page.module.css";
import { members as initialMembers, pushRandomMembers, usePageScrollDown, useFormData, randomResult, randomNewMember} from "./script.js";
import { useState, useEffect, useRef, use } from "react";

export default function Week5Page() {
  const [memberList, setMemberList] = useState(initialMembers);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const { formData, setFormData, handleInput, isFormValid, warn, warnFormat, reset } = useFormData();
  const [fetching, setFetching] = useState("ready");
  const [sortPart, setSortPart] = useState("all");
  const [sortType, setSortType] = useState("newest");
  const [sortSearch, setSortSearch] = useState("");

  const TIMEOUT_MS = 2000;
  const statusResetTimerRef = useRef(null)


  usePageScrollDown(selected, () => setSelected(null));
  usePageScrollDown(showAdd, () => setShowAdd(false));

  const fetchMessage = {
    ready: "준비 완료!",
    loading: "요청 중...",
    success: "작업을 완료하였습니다!",
    error: "실패하였습니다. 잠시 후 다시 시도해주세요.",
  }

  const lastAction = useRef(null);

  const nextIdRef = useRef(initialMembers.length + 1);

  function makeNextId() {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  }

  const resetStatusLater = () => {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    statusResetTimerRef.current = setTimeout(() => setFetching("ready"), 2000)
  };

  useEffect(() => {
    return () => {
      if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    };
  }, []);

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
  }

  const handleFetchRandom = async () => {
    setFetching("loading");
    lastAction.current = handleFetchRandom;
    try {
      const user = await randomResult(1);
      const newMember = {...randomNewMember(user[0]), id: makeNextId() };
      setMemberList((prev) => [...prev, newMember]);
      setFetching("success");

      setTimeout(() => setFetching("ready"), 2000);
    } catch{
      setFetching("error");
    }
    return user[0];
  };

  const handleFetchFiveRandom = async () => {
    setFetching("loading");
    lastAction.current = handleFetchFiveRandom;
    try {
      const users = await randomResult(5);
      const newMembers = users.map((u) => ({...randomNewMember(u), id: makeNextId() }));
      setMemberList((prev) => [...prev, ...newMembers]);
      setFetching("success");
      setTimeout(() => setFetching("ready"), 2000);
    } catch {
      setFetching("error");
    }
    return users[0];
  }

  const handleRefresh = async () => {
    setFetching("loading");
    lastAction.current = handleRefresh;
    try {
      const myProfile = memberList.find((m) => m.isMe);
      const baseList = myProfile ? [myProfile] : [];

      const lionCount = myProfile ? memberList.length-1 : memberList.length;
      const users = await randomResult(lionCount);
      const newMembers = users.map((u) => ({...randomNewMember(u), id: makeNextId()}));
      setMemberList([myProfile, ...newMembers]);
      setFetching("success");
      setTimeout(() => setFetching("ready"), 2000);
    } catch {
      setFetching("error");
    }
    return users[0];
  }

  const handleRetry = () => {
    if (fetching === "error") {
      setFetching("ready");
      if (lastAction.current) {
        lastAction.current();
      }
    }
  };

  const displayList = memberList
    .filter((member) => sortSearch === ""
      || (member.name?.includes(sortSearch)
      || member.part?.includes(sortSearch)
      || member.intro?.includes(sortSearch)
      || member.club?.includes(sortSearch)
      || member.introduce?.some((text) => text?.includes(sortSearch))
      || member.contact?.email?.includes(sortSearch)
      || member.contact?.phone?.includes(sortSearch)
      || member.contact?.website?.label?.includes(sortSearch)
      || member.skills?.some((skill) => skill?.includes(sortSearch))
      || member.last?.includes(sortSearch))
      )
    .filter((member) => sortPart === "all" || member.part === sortPart)
    .sort((a, b) => {
      if (sortType === "newest") return a.id - b.id;
      if (sortType === "nameAsc") return a.name.localeCompare(b.name);
      if (sortType === "nameDesc") return b.name.localeCompare(a.name);
      return 0;
    });

  const handlePushRandom = async () => {
    const randomData = await pushRandomMembers();
    setFormData(randomData);
    return randomData;
  };

  async function fetchTimeout() {
    const controller = new AbortController();
    let checkOut = false;
    const timeoutId = setTimeout(() => {
      checkOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      if (error.name === "AbortError" && checkOut) {
        throw new Error("시간 초과");
      } 
      throw error;
    }
  }

  return (
    <div className={styles["week-page"]}>
      <h2>5주차</h2>
      <div>
        <button className={styles["addButton"]}
        // 모달 열 때 입력값 초기화
        onClick={() => { setShowAdd(true); reset(); }}>
          아기 사자 추가
        </button>

        <button className={styles["removeButton"]}
        onClick={() => setMemberList((prev) => prev.slice(0, -1))}>
          마지막 아기 사자 제거
        </button>
        <span className={styles["countLion"]}>총 {memberList.length}명</span>
      </div>

      <div className={styles["randomButtonsRow"]}>
        <button className={styles["randomOneButton"]}
        disabled={fetching === "loading"}
        onClick={handleFetchRandom}>
        랜덤 1명 추가</button>
        <button className={styles["randomFiveButton"]}
        disabled={fetching === "loading"}
        onClick={handleFetchFiveRandom}>랜덤 5명 추가</button>
        <button className={styles["refrashButton"]}
        disabled={fetching === "loading"}
        onClick={handleRefresh}>전체 새로고침</button>
        <span className={styles["refrashState"]} role="alert">
          {fetchMessage[fetching]}
        </span>
        {fetching === "error" && <button onClick={handleRetry} className={styles["retryButton"]}>
          재시도
        </button>}
      </div>

      <div className={styles["sortLabelRow"]}>
        <label className={styles["firstSortLabel"]} htmlForfor="sortPart">파트</label>
        <select name="sortPart" id="sortPart" className={styles["sortSelect"]}
        value={sortPart} onChange={(e) => setSortPart(e.target.value)}>
          <option value="all">전체</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="PM">PM</option>
          <option value="Design">Design</option>
        </select>
        <label className={styles["sortLabel"]} htmlForfor="sortType">정렬</label>
        <select name="sortType" id="sortType" className={styles["sortSelect"]}
        value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="newest">최신 업데이트순</option>
          <option value="nameAsc">이름 오름차순</option>
          <option value="nameDesc">이름 내림차순</option>
        </select>
        <label className={styles["sortLabel"]} htmlForfor="searchInput">검색</label>
        <input type="search" id="searchInput" 
        placeholder="이름으로 검색" className={styles["sortSelect"]}
        value={sortSearch} onChange={(e) => setSortSearch(e.target.value)}/>
      </div>

      <div className={styles["gridContainer"]}>
        {memberList.length === 0 ? (
          <p className={styles["noResult"]}>남은 아기사자가 없습니다 ㅜㅜ</p>
        ) : displayList.length === 0 ? (
          <p className={styles["noResult"]}>조건에 맞는 아기 사자가 없습니다.</p>
        ) : (
          displayList.map((member) => (
            <div key={member.id} onClick={() => setSelected(member)} className={styles["mainProfile"]}>
              <p className={styles["badge"]}>
                <span className={styles["badgeSpace"]}>{member.badge}</span>
              </p>
              <img className={styles["profileImage"]} src={member.image} alt={`${member.name} 프로필 사진`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://picsum.photos/seed/fallback/200/200";
              }}/>
              <h2 className={styles["name"]}>{member.name}</h2>
              <b className={styles["blueRule"]}>{member.part}</b>
              <p className={styles["lineIntroduce"]}>{member.intro}</p>
            </div>
          ))
        )}
      </div>

      {/* 아기 사자 추가 모달 */}
      {showAdd && (
        <div className={styles["pushLion"]} onClick={() => setShowAdd(false)}>
          <div className={styles["pushLionContent"]}
          onClick={(e) => e.stopPropagation()}>
            <form className={styles["pushLionGrid"]} onSubmit={handleAddSubmit}>
              <div className={styles["pushLionRow"]}>
                <div className={styles["field"]}>
                  <div className={styles["halfWidth"]}>
                    <label htmlFor="name">이름</label>
                    <input id="name" type="text" className={styles["inputName"]}
                    placeholder="예: 홍아기사자"
                    value={formData.name} onChange={handleInput("name")}/>
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
                value={formData.skills} onChange={handleInput("skills")}/>
                {warn("skills") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}

              </div>

              <div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
                <label htmlFor="introduce" className={styles["pushLabel"]} >한 줄 소개(요약 카드)</label>
                <input id="introduce" type="text" className={styles["inputLongtype"]}
                placeholder="예: 3주차 DOM 조작 연습 중"
                value={formData.introduce} onChange={handleInput("introduce")}/>
                {warn("introduce") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
              </div>

              <div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
                <label htmlFor="introduceDetail" className={styles["pushLabel"]}>자기소개 (상세 카드)</label>
                <div style={styles}>
                  <textarea id="introduceDetail" className={styles["inputIntroduce"]}
                  placeholder="예: HTML/CSS로 구조를 만들고, JS로 데이터를 바꾸면 화면이 바뀌는 경험을 하고 있습니다."
                  value={formData.introduceDetail} onChange={handleInput("introduceDetail")}/>
                  {warn("introduceDetail") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                </div>
              </div>

              <div className={styles["pushLionRow"]}>
                <div className={styles["field"]}>
                  <label htmlFor="email" className={styles["pushLabel"]}>Email</label>
                  <div className={styles["halfWidth"]}>
                    <input id="email" type="email" className={styles["inputEmail"]}
                    placeholder="예: lion@example.com"
                    value={formData.email} onChange={handleInput("email")}/>
                    {warn("email") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                    {warnFormat("email") && <span className={styles["inputWarning"]}><b>!</b> '@' 가 포함되어야 합니다 <b>!</b></span>}
                  </div>
                </div>
                <div className={styles["field"]}>
                  <label htmlFor="phone" className={styles["pushLabel"]}>Phone</label>
                  <div className={styles["halfWidth"]}>
                    <input id="phone" type="phone" className={styles["inputPhone"]}
                    placeholder="예: 010-1234-5678"
                    value={formData.phone} onChange={handleInput("phone")}/>
                    {warn("phone") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                    {warnFormat("phone") && <span className={styles["inputWarning"]}><b>!</b> 예시의 형식을 따라주세요 <b>!</b></span>}
                  </div>
                </div>
              </div>

              <div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
                <label htmlFor="website" className={styles["pushLabel"]}>Website</label>
                  <input id="website" type="website" className={styles["inputLongtype"]}
                  placeholder="예: https://www.example.com"
                  value={formData.website} onChange={handleInput("website")}/>
                  {warn("website") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                  {warnFormat("website") && <span className={styles["inputWarning"]}><b>!</b> http:// 또는 https:// 로 시작하는 URL이어야 합니다 <b>!</b></span>}
              </div>

              <div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
                <label htmlFor="last" className={styles["pushLabel"]}>한 마디</label>
                  <input id="last" type="text" className={styles["inputLongtype"]}
                  placeholder="예: 데이터 바꾸면 화면도 바뀐다!"
                  value={formData.last} onChange={handleInput("last")}/>
                  {warn("last") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
              </div>
              {/*모든 입력란이 채워져야 활성화 */}
              <button type="button" className={styles["pushRandomButton"]}
              onClick={handlePushRandom}>랜덤 값 채우기</button>
              <button type="submit" className={styles["pushLionAddButton"]}
              disabled={!isFormValid}>추가</button>
              <button type="button" className={styles["pushLionCancelButton"]}
              onClick={() => setShowAdd(false)}>취소</button>
            </form>
          </div>
        </div>
      )}

      {/* 자기소개 모달 */}
      {selected && (
        <div className={styles["modalOverlay"]}
        onClick={() => setSelected(null)}>
          <div className={styles["modalContent"]}
          onClick={(e) => e.stopPropagation()}>

            <h2 className={styles["name"]}>{selected.name}</h2>
            <b className={styles["blueRule"]}>{selected.part}</b>
            <p className={styles["joinClub"]}>{selected.club}</p>

            <hr className={styles["modalDivider"]} />

            {!selected.contact && !selected.skills && !selected.last ? (
              <p className={styles["introduceMyself"]}>아직 준비 중입니다.</p>
            ) : (
              <>

            <h3 className={styles["introduceTitle"]}>자기소개</h3>
            {selected.introduce.map((text, i) => (
              <p key={`${selected.id}-intro-${i}`} className={styles["introduceMyself"]}>{text}</p>
            ))}

            {(selected.contact.email || selected.contact.phone || selected.contact.website) && (
              <>
                <h3 className={styles["introduceTitle"]}>연락처</h3>
                <ul>
                  {selected.contact.email && <li className={styles["listStyle"]}>Email: {selected.contact.email}</li>}
                  {selected.contact.phone && <li className={styles["listStyle"]}>Phone: {selected.contact.phone}</li>}
                  {selected.contact.website && (
                    <li className={styles["listStyle"]}>Website: <a href={selected.contact.website.url}>{selected.contact.website.label}</a></li>
                  )}
                </ul>
              </>
            )}

            {selected.skills && (
              <>
                <h3 className={styles["introduceTitle"]}>관심 기술</h3>
                <ul>
                  {selected.skills.map((skill) => (
                    <li key={skill.id} className={styles["listStyle"]}>{skill}</li>
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