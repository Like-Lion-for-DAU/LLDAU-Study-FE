import styles from "./Page.module.css";
import { members as initialMembers, pushRandomMembers, usePageScrollDown, useFormData, randomResult, randomNewMember} from "./script.js";
import { useState, useEffect, useRef } from "react";

export default function Week6Page() {
  const [memberList, setMemberList] = useState(initialMembers);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const { formData, setFormData, handleInput, isFormValid, warn, warnFormat, reset } = useFormData();
  const [fetching, setFetching] = useState("ready");
  const [sortPart, setSortPart] = useState("all");
  const [sortType, setSortType] = useState("newest");
  const [sortSearch, setSortSearch] = useState("");
  const [bannerIdx, setBannerIdx] = useState(0);
  const [viewMode, setViewMode] = useState("card");   // "card" | "list"
  const [showExtra, setShowExtra] = useState(false);

  const statusResetTimerRef = useRef(null);
  const lastAction = useRef(null);
  const nextIdRef = useRef(initialMembers.length + 1);
  const touchStartX = useRef(null);
  const viewportRef = useRef(null);

  // 드래그 관련
  const dragStartX = useRef(null);
  const dragDelta = useRef(0);
  const isDragging = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);

  usePageScrollDown(selected, () => setSelected(null));
  usePageScrollDown(showAdd, () => setShowAdd(false));

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

  useEffect(() => {
    return () => {
      if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    };
  }, []);

  // 뷰포트 너비 측정 + 리사이즈/CSS 변경/모드 전환 시 모두 자동 갱신
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const updateWidth = () => setViewportWidth(node.offsetWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, [viewMode]);

  // bannerIdx가 범위 벗어나지 않도록
  useEffect(() => {
    if (displayList.length > 0 && bannerIdx >= displayList.length) {
      setBannerIdx(displayList.length - 1);
    }
  }, [memberList, sortPart, sortSearch]);

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

  const displayList = memberList
    .filter((member) =>
      sortSearch === "" ||
      member.name?.includes(sortSearch) ||
      member.part?.includes(sortSearch) ||
      member.intro?.includes(sortSearch) ||
      member.club?.includes(sortSearch) ||
      member.introduce?.some((text) => text?.includes(sortSearch)) ||
      member.contact?.email?.includes(sortSearch) ||
      member.contact?.phone?.includes(sortSearch) ||
      member.contact?.website?.label?.includes(sortSearch) ||
      member.skills?.some((skill) => skill?.includes(sortSearch)) ||
      member.last?.includes(sortSearch)
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
  };

  // 무한 루프 이전/다음
  const goPrev = () => {
    if (displayList.length === 0) return;
    setBannerIdx((i) => (i - 1 + displayList.length) % displayList.length);
  };
  const goNext = () => {
    if (displayList.length === 0) return;
    setBannerIdx((i) => (i + 1) % displayList.length);
  };

  // 슬라이드 애니메이션 설정
  const SNAP_MS = 300;
  const GAP = 10;

  // 슬라이드 → 데이터 교체 → 위치 instant 리셋 (3단계)
  const snapToNext = (delta) => {
    if (snapping) return;
    const direction = delta < 0 ? -1 : 1;
    const cardWidth = viewportWidth * 0.6;   // bannerCardCenter가 60%
    setSnapping(true);
    setDragOffset(direction * (cardWidth + GAP));

    setTimeout(() => {
      delta < 0 ? goNext() : goPrev();
      setSnapping(false);
      setDragOffset(0);
    }, SNAP_MS);
  };

  // 작은 드래그는 원위치로 복귀만
  const snapBack = () => {
    setSnapping(true);
    setDragOffset(0);
    setTimeout(() => setSnapping(false), SNAP_MS);
  };

  // 터치 스와이프
  const handleTouchStart = (e) => {
    if (snapping) return;
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    setDragOffset(delta);
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      snapToNext(delta);
    } else {
      snapBack();
    }
    touchStartX.current = null;
  };

  // 마우스 드래그
  const handleMouseDown = (e) => {
    if (snapping) return;
    dragStartX.current = e.clientX;
    dragDelta.current = 0;
    isDragging.current = false;
    setDragOffset(0);

    const handleMouseMove = (e) => {
      const delta = e.clientX - dragStartX.current;
      dragDelta.current = delta;
      isDragging.current = Math.abs(delta) > 5;
      setDragOffset(delta);
    };

    const handleMouseUp = () => {
      const delta = dragDelta.current;
      if (Math.abs(delta) > 60) {
        snapToNext(delta);
      } else {
        snapBack();
      }
      dragStartX.current = null;
      dragDelta.current = 0;
      setTimeout(() => { isDragging.current = false; }, 0);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const currentMember = displayList[bannerIdx] ?? null;

  // 앞뒤 멤버 (무한 루프) — 5장 구조
  const prevMember = displayList.length > 1
    ? displayList[(bannerIdx - 1 + displayList.length) % displayList.length]
    : null;
  const nextMember = displayList.length > 1
    ? displayList[(bannerIdx + 1) % displayList.length]
    : null;
  const prevPrevMember = displayList.length > 1
    ? displayList[(bannerIdx - 2 + displayList.length) % displayList.length]
    : null;
  const nextNextMember = displayList.length > 1
    ? displayList[(bannerIdx + 2) % displayList.length]
    : null;

  // 트랙 기본 오프셋: 5장 구조에서 3번째 카드(current)를 뷰포트 가운데에 고정
  // 앞에 카드 2장(pp + p) + gap 2개가 있으므로
  // baseOffset = 0.2vw - 2×(0.6vw + gap) = 0.2vw - 1.2vw - 2×gap = -(vw + 2×gap)
  const baseOffset = -(viewportWidth + 2 * GAP);

  return (
    <div className={styles["week-page"]}>
      <h2>6주차</h2>

      {/* ── 검색창 ── */}
      <div className={styles["searchRow"]}>
        <input
          type="search"
          id="searchInput"
          placeholder="이름, 스킬, 소개로 검색"
          className={styles["searchInput"]}
          value={sortSearch}
          onChange={(e) => { setSortSearch(e.target.value); setBannerIdx(0); }}
        />
      </div>

      {/* ── 추가 기능 토글 버튼 ── */}
      <div className={styles["extraToggleRow"]}>
        <button
          className={styles["extraToggleBtn"]}
          onClick={() => setShowExtra((v) => !v)}
        >
          {showExtra ? "추가 기능 ▲" : "추가 기능 ▼"}
        </button>
      </div>

      {/* ── 추가 기능 패널 ── */}
      {showExtra && (
        <div className={styles["extraPanel"]}>
          {/* 추가 / 제거 버튼 */}
          <div className={styles["actionRow"]}>
            <button className={styles["addButton"]} onClick={() => { setShowAdd(true); reset(); }}>
              아기 사자 추가
            </button>
            <button className={styles["removeButton"]} onClick={() => setMemberList((prev) => prev.slice(0, -1))}>
              마지막 아기 사자 제거
            </button>
          </div>

          {/* 랜덤 추가 / 전체 새로고침 */}
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

      {/* ── 파트 / 정렬 ── */}
      <div className={styles["sortLabelRow"]}>
        <label className={styles["sortLabel"]} htmlFor="sortPart">파트</label>
        <select name="sortPart" id="sortPart" className={styles["sortSelect"]}
          value={sortPart} onChange={(e) => { setSortPart(e.target.value); setBannerIdx(0); }}>
          <option value="all">전체</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="PM">PM</option>
          <option value="Design">Design</option>
        </select>
        <label className={styles["sortLabel"]} htmlFor="sortType">정렬</label>
        <select name="sortType" id="sortType" className={styles["sortSelect"]}
          value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="newest">최신 업데이트순</option>
          <option value="nameAsc">이름 오름차순</option>
          <option value="nameDesc">이름 내림차순</option>
        </select>
        <span className={styles["countLion"]}>총 {memberList.length}명</span>
      </div>

      {/* ── 배너 슬라이더 ── */}
      {displayList.length === 0 ? (
        <p className={styles["noResult"]}>조건에 맞는 아기 사자가 없습니다.</p>
      ) : (
        <div className={styles["bannerSection"]}>
          {/* 슬라이더 헤더 (보기 모드 토글) */}
          <div className={styles["bannerHeader"]}>
            <h3 className={styles["bannerTitle"]}>아기 사자들</h3>
            <div className={styles["viewModeToggle"]}>
              <button
                type="button"
                className={`${styles["viewModeBtn"]} ${viewMode === "card" ? styles["viewModeBtnActive"] : ""}`}
                onClick={() => setViewMode("card")}
                aria-label="카드로 보기"
                title="카드로 보기"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                type="button"
                className={`${styles["viewModeBtn"]} ${viewMode === "list" ? styles["viewModeBtnActive"] : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="리스트로 보기"
                title="리스트로 보기"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* 카드 모드: 슬라이더 뷰포트 */}
          {viewMode === "card" && (
          <>
          <div
            ref={viewportRef}
            className={styles["bannerViewport"]}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
          >
            <div
              className={styles["bannerTrack"]}
              style={{
                transform: `translateX(${baseOffset + dragOffset}px)`,
                transition: snapping ? `transform ${SNAP_MS}ms ease` : "none",
              }}
            >
            {/* pp: 왼쪽 두번째 카드 */}
            {prevPrevMember && (
              <div
                className={`${styles["bannerCard"]} ${styles["bannerCardSide"]}`}
                onClick={() => { if (!isDragging.current) goPrev(); }}
              >
                <img
                  className={styles["bannerBg"]}
                  src={prevPrevMember.image}
                  alt={prevPrevMember.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://picsum.photos/seed/fallback/400/300"; }}
                />
                <div className={styles["bannerOverlay"]} />
              </div>
            )}

            {/* prev: 왼쪽 이전 카드 */}
            {prevMember && (
              <div
                className={`${styles["bannerCard"]} ${styles["bannerCardSide"]} ${styles["bannerCardLeft"]}`}
                onClick={() => { if (!isDragging.current) goPrev(); }}
              >
                <img
                  className={styles["bannerBg"]}
                  src={prevMember.image}
                  alt={prevMember.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://picsum.photos/seed/fallback/400/300"; }}
                />
                <div className={styles["bannerOverlay"]} />
              </div>
            )}

            {/* 중앙 현재 카드 */}
            <div
              className={`${styles["bannerCard"]} ${styles["bannerCardCenter"]}`}
              onClick={() => { if (!isDragging.current) setSelected(currentMember); }}
            >
              <img
                className={styles["bannerBg"]}
                src={currentMember.image}
                alt={currentMember.name}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://picsum.photos/seed/fallback/400/300"; }}
              />
              <div className={styles["bannerOverlay"]} />
              <span className={styles["bannerBadge"]}>{currentMember.badge}</span>
              <div className={styles["bannerInfo"]}>
                <h3 className={styles["bannerName"]}>{currentMember.name}</h3>
                <b className={styles["bannerPart"]}>{currentMember.part}</b>
                <p className={styles["bannerIntro"]}>{currentMember.intro}</p>
              </div>
            </div>

            {/* next: 오른쪽 다음 카드 */}
            {nextMember && (
              <div
                className={`${styles["bannerCard"]} ${styles["bannerCardSide"]} ${styles["bannerCardRight"]}`}
                onClick={() => { if (!isDragging.current) goNext(); }}
              >
                <img
                  className={styles["bannerBg"]}
                  src={nextMember.image}
                  alt={nextMember.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://picsum.photos/seed/fallback/400/300"; }}
                />
                <div className={styles["bannerOverlay"]} />
              </div>
            )}

            {/* nn: 오른쪽 두번째 카드 */}
            {nextNextMember && (
              <div
                className={`${styles["bannerCard"]} ${styles["bannerCardSide"]}`}
                onClick={() => { if (!isDragging.current) goNext(); }}
              >
                <img
                  className={styles["bannerBg"]}
                  src={nextNextMember.image}
                  alt={nextNextMember.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://picsum.photos/seed/fallback/400/300"; }}
                />
                <div className={styles["bannerOverlay"]} />
              </div>
            )}
            </div> {/* bannerTrack 닫기 */}
          </div>

          {/* 인디케이터 도트 */}
          <div className={styles["bannerDots"]}>
            {displayList.map((_, i) => (
              <span
                key={i}
                className={`${styles["bannerDot"]} ${i === bannerIdx ? styles["bannerDotActive"] : ""}`}
                onClick={() => setBannerIdx(i)}
              />
            ))}
          </div>
          </>
          )}

          {/* 리스트 모드 */}
          {viewMode === "list" && (
            <ul className={styles["listContainer"]}>
              {displayList.map((member) => (
                <li
                  key={member.id}
                  className={styles["listItem"]}
                  onClick={() => setSelected(member)}
                >
                  <img
                    className={styles["listImage"]}
                    src={member.image}
                    alt={`${member.name} 프로필 사진`}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://picsum.photos/seed/fallback/120/120"; }}
                  />
                  <div className={styles["listInfo"]}>
                    <h3 className={styles["listName"]}>{member.name}</h3>
                    <span className={styles["listPart"]}>{member.part}</span>
                    <p className={styles["listIntro"]}>{member.intro}</p>
                  </div>
                  <span className={styles["listBadge"]}>{member.badge}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── 아기 사자 추가 모달 ── */}
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

      {/* ── 자기소개 모달 ── */}
      {selected && (
        <div className={styles["modalOverlay"]} onClick={() => setSelected(null)}>
          <div className={styles["modalContent"]} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["name"]}>{selected.name}</h2>
            <br/>
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