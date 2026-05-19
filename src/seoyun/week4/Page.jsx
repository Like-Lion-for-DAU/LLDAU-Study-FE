import { useEffect, useRef, useState } from "react";
import styles from "./Page.module.css";
import {
  initialMembers,
  PARTS,
  SKILLS_BY_PART,
  ABOUT_PRESETS,
  QUOTE_PRESETS,
  DEFAULT_IMAGES,
} from "./lions";

const TIMEOUT_MS = 5000;

const EMPTY_FORM = {
  name: "",
  part: "",
  skills: "",
  intro: "",
  about: "",
  email: "",
  phone: "",
  website: "",
  quote: "",
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleSkills(part) {
  const pool = SKILLS_BY_PART[part] || [];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
}

function mapApiUser(user, id) {
  const part = pickRandom(PARTS);
  const skills = shuffleSkills(part);
  const name = `${user.name.first} ${user.name.last}`;
  const country = user.location?.country || "";
  const city = user.location?.city || "";

  return {
    id,
    name,
    part,
    intro: `${part} · ${country} ${city}에서 합류했어요!`,
    about: `안녕하세요, ${name}입니다. ${country} ${city} 출신으로 ${part} 분야에서 활동 중입니다.`,
    skills,
    badge: skills[0] || "",
    email: user.email || "",
    phone: user.phone || "",
    website: `https://github.com/${user.login?.username || "lion"}`,
    image: user.picture?.large || `https://picsum.photos/seed/${id}/200/200`,
    club: "LION TRACK",
    isMine: false,
  };
}

async function fetchRandomUsers(count, signal) {
  const url = `https://randomuser.me/api/?results=${count}&nat=us,gb,ca,au,nz`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

export default function Week4Page() {
  const [members, setMembers] = useState(initialMembers);
  const [filterPart, setFilterPart] = useState("전체");
  const [sortOrder, setSortOrder] = useState("최신추가순");
  const [searchName, setSearchName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFilling, setIsFilling] = useState(false);

  const nextIdRef = useRef(
    initialMembers.length === 0
      ? 1
      : Math.max(...initialMembers.map((m) => m.id)) + 1
  );
  const latestRequestIdRef = useRef(0);
  const latestControllerRef = useRef(null);
  const lastFetchActionRef = useRef(null);
  const statusResetTimerRef = useRef(null);
  const nameInputRef = useRef(null);
  const addBtnRef = useRef(null);

  useEffect(() => {
    return () => {
      if (statusResetTimerRef.current) {
        clearTimeout(statusResetTimerRef.current);
      }
      if (latestControllerRef.current) {
        try {
          latestControllerRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  useEffect(() => {
    if (showForm) {
      nameInputRef.current?.focus();
    }
  }, [showForm]);

  useEffect(() => {
    if (!showForm) return;
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setShowForm(false);
        addBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showForm]);

  function makeNextId() {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  }

  const visibleMembers = (() => {
    let list = members.slice();

    if (filterPart !== "전체") {
      list = list.filter((m) => m.part === filterPart);
    }

    const query = searchName.trim();
    if (query) {
      list = list.filter((m) => m.name?.includes(query));
    }

    if (sortOrder === "이름순") {
      list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    } else {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  })();

  async function runFetchAction(actionFn) {
    const requestId = ++latestRequestIdRef.current;
    lastFetchActionRef.current = actionFn;

    if (latestControllerRef.current) {
      try {
        latestControllerRef.current.abort();
      } catch (_) {}
    }
    const controller = new AbortController();
    latestControllerRef.current = controller;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      try {
        controller.abort();
      } catch (_) {}
    }, TIMEOUT_MS);

    setErrorMessage("");
    setFetchStatus("loading");

    try {
      await actionFn({
        signal: controller.signal,
        isLatest: () => requestId === latestRequestIdRef.current,
      });

      if (requestId !== latestRequestIdRef.current) return;
      clearTimeout(timeoutId);
      setFetchStatus("success");

      if (statusResetTimerRef.current) {
        clearTimeout(statusResetTimerRef.current);
      }
      statusResetTimerRef.current = setTimeout(() => {
        if (requestId === latestRequestIdRef.current) {
          setFetchStatus("idle");
        }
      }, 2000);
    } catch (err) {
      if (requestId !== latestRequestIdRef.current) return;
      clearTimeout(timeoutId);

      if (err?.name === "AbortError" && timedOut) {
        setFetchStatus("error");
        setErrorMessage("불러오기 실패: 시간 초과");
        return;
      }
      if (err?.name === "AbortError") return;

      console.error(err);
      setFetchStatus("error");
      setErrorMessage(`불러오기 실패: ${err?.message || "알 수 없는 오류"}`);
    }
  }

  const handleFetchAdd = (count) =>
    runFetchAction(async (ctx) => {
      const users = await fetchRandomUsers(count, ctx.signal);
      if (!ctx.isLatest()) return;
      const newOnes = users.map((u) => mapApiUser(u, makeNextId()));
      setMembers((prev) => [...prev, ...newOnes]);
    });

  const handleFetchRefresh = () =>
    runFetchAction(async (ctx) => {
      const mineMembers = members.filter((m) => m.isMine);
      const fetchCount = members.length - mineMembers.length;
      if (fetchCount === 0) return;

      const users = await fetchRandomUsers(fetchCount, ctx.signal);
      if (!ctx.isLatest()) return;
      const newOnes = users.map((u) => mapApiUser(u, makeNextId()));
      setMembers([...mineMembers, ...newOnes]);
    });

  const handleRetry = () => {
    if (typeof lastFetchActionRef.current === "function") {
      runFetchAction(lastFetchActionRef.current);
    }
  };

  const handleDeleteLast = () => {
    setMembers((prev) => prev.slice(0, -1));
  };

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData(EMPTY_FORM);
    addBtnRef.current?.focus();
  };

  const handleInput = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = formData.name.trim();
    const part = formData.part;
    const skillArr = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const intro = formData.intro.trim();
    const about = formData.about.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const website = formData.website.trim();
    const quote = formData.quote.trim();

    if (
      !name ||
      !part ||
      skillArr.length === 0 ||
      !intro ||
      !about ||
      !email ||
      !phone ||
      !quote
    ) {
      return;
    }

    const id = makeNextId();
    const newMember = {
      id,
      name,
      part,
      intro,
      about,
      quote,
      skills: skillArr,
      badge: skillArr[0] || "",
      email,
      phone,
      website,
      image: DEFAULT_IMAGES[members.length % DEFAULT_IMAGES.length],
      club: "LION TRACK",
      isMine: false,
    };

    setMembers((prev) => [...prev, newMember]);
    setFormData(EMPTY_FORM);
    setShowForm(false);
  };

  const handleFillRandom = async () => {
    if (isFilling) return;
    setIsFilling(true);

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      try {
        controller.abort();
      } catch (_) {}
    }, TIMEOUT_MS);

    try {
      const users = await fetchRandomUsers(1, controller.signal);
      clearTimeout(timeoutId);
      const user = users[0];
      if (!user) throw new Error("랜덤 유저를 불러오지 못했습니다.");

      const part = pickRandom(PARTS);
      const skills = shuffleSkills(part);
      const country = user.location?.country || "";
      const city = user.location?.city || "";

      setFormData({
        name: `${user.name.first} ${user.name.last}`,
        part,
        skills: skills.join(", "),
        intro: `${part} · ${country} ${city}에서 합류했어요!`,
        about: pickRandom(ABOUT_PRESETS),
        email: user.email || "",
        phone: user.phone || "",
        website: `https://example.com/${user.login?.username || "lion"}`,
        quote: pickRandom(QUOTE_PRESETS),
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err?.name === "AbortError" && timedOut) {
        alert("랜덤 값 채우기 실패: 시간 초과");
      } else if (err?.name !== "AbortError") {
        alert(`랜덤 값 채우기 실패: ${err?.message || "알 수 없는 오류"}`);
      }
    } finally {
      setIsFilling(false);
    }
  };

  const statusText =
    fetchStatus === "loading"
      ? "불러오는 중..."
      : fetchStatus === "success"
      ? "완료!"
      : fetchStatus === "error"
      ? errorMessage
      : "준비 완료";

  const isLoading = fetchStatus === "loading";

  return (
    <main className={styles["container"]}>
      <div className={styles["controls"]}>
        <button
          ref={addBtnRef}
          type="button"
          className={styles["btn"]}
          onClick={handleToggleForm}
        >
          아기 사자 추가
        </button>
        <button
          type="button"
          className={styles["btn"]}
          onClick={handleDeleteLast}
        >
          마지막 아기 사자 삭제
        </button>
        <span className={styles["total-count"]}>총 {members.length}명</span>
      </div>

      <div className={styles["controls"]}>
        <button
          type="button"
          className={`${styles["btn"]} ${styles["btn-fetch"]}`}
          onClick={() => handleFetchAdd(1)}
          disabled={isLoading}
        >
          랜덤 1명 추가
        </button>
        <button
          type="button"
          className={`${styles["btn"]} ${styles["btn-fetch"]}`}
          onClick={() => handleFetchAdd(5)}
          disabled={isLoading}
        >
          랜덤 5명 추가
        </button>
        <button
          type="button"
          className={`${styles["btn"]} ${styles["btn-fetch"]}`}
          onClick={handleFetchRefresh}
          disabled={isLoading}
        >
          전체 새로고침
        </button>
        <span
          className={styles["fetch-status"]}
          data-state={fetchStatus === "idle" ? "" : fetchStatus}
          role="status"
          aria-live="polite"
        >
          {statusText}
        </span>
        {fetchStatus === "error" && (
          <button
            type="button"
            className={`${styles["btn"]} ${styles["btn-retry"]}`}
            onClick={handleRetry}
          >
            재시도
          </button>
        )}
      </div>

      <div className={styles["view-options"]}>
        <label className={styles["view-option"]}>
          <span>파트</span>
          <select
            value={filterPart}
            onChange={(e) => setFilterPart(e.target.value)}
          >
            <option value="전체">전체</option>
            {PARTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className={styles["view-option"]}>
          <span>정렬</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="최신추가순">최신추가순</option>
            <option value="이름순">이름순</option>
          </select>
        </label>
        <label className={styles["view-option"]}>
          <span>검색</span>
          <input
            type="search"
            placeholder="이름으로 검색"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </label>
      </div>

      {showForm && (
        <div className={styles["form-wrapper"]}>
          <form className={styles["add-form"]} onSubmit={handleSubmit}>
            <div className={styles["form-grid"]}>
              <div className={styles["form-group"]}>
                <label htmlFor="f-name">이름</label>
                <input
                  ref={nameInputRef}
                  id="f-name"
                  type="text"
                  placeholder="예: 홍아기사자"
                  value={formData.name}
                  onChange={handleInput("name")}
                  required
                />
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="f-part">파트</label>
                <select
                  id="f-part"
                  value={formData.part}
                  onChange={handleInput("part")}
                  required
                >
                  <option value="">선택하세요</option>
                  {PARTS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={`${styles["form-group"]} ${styles["form-full"]}`}
              >
                <label htmlFor="f-skills">관심 기술 (쉼표로 구분)</label>
                <input
                  id="f-skills"
                  type="text"
                  placeholder="예: JavaScript, React, HTML/CSS"
                  value={formData.skills}
                  onChange={handleInput("skills")}
                  required
                />
              </div>

              <div
                className={`${styles["form-group"]} ${styles["form-full"]}`}
              >
                <label htmlFor="f-intro">한 줄 소개 (요약 카드)</label>
                <input
                  id="f-intro"
                  type="text"
                  placeholder="예: 3주차 DOM 조작 연습 중!"
                  value={formData.intro}
                  onChange={handleInput("intro")}
                  required
                />
              </div>

              <div
                className={`${styles["form-group"]} ${styles["form-full"]}`}
              >
                <label htmlFor="f-about">자기소개 (상세 카드)</label>
                <textarea
                  id="f-about"
                  rows={5}
                  placeholder="예: HTML/CSS로 구조를 만들고, JS로 데이터를 바꾸면 화면이 바뀌는 경험을 하고 있습니다."
                  value={formData.about}
                  onChange={handleInput("about")}
                  required
                />
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="f-email">Email</label>
                <input
                  id="f-email"
                  type="email"
                  placeholder="예: lion@example.com"
                  value={formData.email}
                  onChange={handleInput("email")}
                  required
                />
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="f-phone">Phone</label>
                <input
                  id="f-phone"
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  value={formData.phone}
                  onChange={handleInput("phone")}
                  required
                />
              </div>

              <div
                className={`${styles["form-group"]} ${styles["form-full"]}`}
              >
                <label htmlFor="f-website">Website</label>
                <input
                  id="f-website"
                  type="url"
                  placeholder="예: https://example.com"
                  value={formData.website}
                  onChange={handleInput("website")}
                />
              </div>

              <div
                className={`${styles["form-group"]} ${styles["form-full"]}`}
              >
                <label htmlFor="f-quote">한 마디</label>
                <input
                  id="f-quote"
                  type="text"
                  placeholder="예: 데이터 바꾸면 화면도 바뀐다!"
                  value={formData.quote}
                  onChange={handleInput("quote")}
                  required
                />
              </div>
            </div>

            <div className={styles["form-actions"]}>
              <button
                type="button"
                className={styles["btn"]}
                onClick={handleFillRandom}
                disabled={isFilling}
              >
                {isFilling ? "불러오는 중..." : "랜덤 값 채우기"}
              </button>
              <button
                type="submit"
                className={`${styles["btn"]} ${styles["btn-primary"]}`}
              >
                추가하기
              </button>
              <button
                type="button"
                className={styles["btn"]}
                onClick={handleCloseForm}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <section className={styles["summary-section"]}>
        <ul className={styles["card-grid"]}>
          {visibleMembers.length === 0 ? (
            <li className={styles["empty-state"]}>
              표시할 아기 사자가 없습니다.
              <br />
              (필터/검색 조건을 확인해 주세요)
            </li>
          ) : (
            visibleMembers.map((m) => {
              const partClass = m.part?.toLowerCase() || "";
              return (
                <li
                  key={m.id}
                  className={`${styles["summary-card"]} ${
                    m.isMine ? styles["summary-card--mine"] : ""
                  }`}
                >
                  <div className={styles["card-image-wrap"]}>
                    <img
                      src={m.image}
                      alt={`${m.name} 프로필 이미지`}
                      className={styles["card-image"]}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://picsum.photos/seed/${m.id}/400/280`;
                      }}
                    />
                    <span className={styles["badge"]}>{m.badge}</span>
                  </div>
                  <div className={styles["card-body"]}>
                    <h2 className={styles["card-name"]}>{m.name}</h2>
                    <p
                      className={`${styles["card-part"]} ${
                        styles[`card-part--${partClass}`] || ""
                      }`}
                    >
                      {m.part}
                    </p>
                    <p className={styles["card-intro"]}>{m.intro}</p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>

      <section className={styles["detail-section"]}>
        <h2 className={styles["section-title"]}>상세 자기소개</h2>
        <ol className={styles["detail-list"]}>
          {visibleMembers.length === 0 ? (
            <li className={styles["empty-state"]}>
              표시할 아기 사자가 없습니다.
            </li>
          ) : (
            visibleMembers.map((m) => {
              const partClass = m.part?.toLowerCase() || "";
              return (
                <li key={m.id} className={styles["detail-card"]}>
                  <header className={styles["detail-header"]}>
                    <h3 className={styles["detail-name"]}>{m.name}</h3>
                    <p
                      className={`${styles["detail-part"]} ${
                        styles[`detail-part--${partClass}`] || ""
                      }`}
                    >
                      {m.part}
                    </p>
                    <p className={styles["detail-club"]}>{m.club}</p>
                  </header>

                  <section className={styles["detail-section-inner"]}>
                    <h4>자기소개</h4>
                    <p>{m.about}</p>
                  </section>

                  <section className={styles["detail-section-inner"]}>
                    <h4>관심 기술</h4>
                    <ul className={styles["skill-list"]}>
                      {(m.skills || []).map((s, i) => (
                        <li key={`${m.id}-skill-${i}`}>{s}</li>
                      ))}
                    </ul>
                  </section>

                  <section className={styles["detail-section-inner"]}>
                    <h4>연락처</h4>
                    <address>
                      <ul className={styles["contact-list"]}>
                        {m.email && (
                          <li>
                            이메일: <a href={`mailto:${m.email}`}>{m.email}</a>
                          </li>
                        )}
                        {m.phone && <li>전화번호: {m.phone}</li>}
                        {m.website && (
                          <li>
                            웹사이트:{" "}
                            <a
                              href={m.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {m.website}
                            </a>
                          </li>
                        )}
                      </ul>
                    </address>
                  </section>

                  <section className={styles["detail-section-inner"]}>
                    <h4>한 마디</h4>
                    <blockquote>{m.quote}</blockquote>
                  </section>
                </li>
              );
            })
          )}
        </ol>
      </section>
    </main>
  );
}
