import { useState, useRef, useEffect } from "react";
import styles from "./Page.module.css";
import { initialLions } from "./lions";

const PARTS = ["Frontend", "Backend", "Design"];
const TIMEOUT_MS = 5000;

function parseSkills(input) {
  return String(input || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickPart(seedStr) {
  const seed = String(seedStr || "");
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return PARTS[sum % PARTS.length];
}

function skillsByPart(part) {
  if (part === "Backend") return ["Node.js", "Spring", "Database"];
  if (part === "Design") return ["Figma", "Typography", "Design System"];
  return ["JavaScript", "React", "HTML/CSS"];
}

function randomUserToLion(user, id) {
  const first = user?.name?.first || "Baby";
  const last = user?.name?.last || "Lion";
  const name = `${first} ${last}`;

  const uuid = user?.login?.uuid || String(id);
  const part = pickPart(uuid);

  const skills = skillsByPart(part);

  const city = user?.location?.city || "어딘가";
  const country = user?.location?.country || "지구";
  const oneLineIntro = `${part} · ${country} ${city}에서 합류했어요!`;

  const description = [
    "4주차 미션에서 fetch로 데이터를 불러와 상태(lions)를 업데이트하는 연습을 하고 있습니다.",
    "비동기(async/await)로 받아온 데이터를 map으로 변환해 UI에 반영하는 흐름을 이해하려고 합니다.",
    '목표는 "데이터가 바뀌면 UI를 다시 그리는 구조"를 자연스럽게 체득하는 것입니다.',
  ].join(" ");

  const email = user?.email || "";
  const phone = user?.phone || "";
  const username = user?.login?.username || `lion${id}`;
  const website = `https://example.com/${username}`;

  const imgSrc =
    user?.picture?.large || `https://picsum.photos/seed/${id}/200/200`;

  return {
    id,
    name,
    part,
    skills,
    oneLineIntro,
    description,
    oneWord: "데이터가 바뀌면 UI도 바뀐다!",
    imgSrc,
    organization: "LION TRACK",
    isMe: false,
    contacts: { email, phone, website },
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
  const [lions, setLions] = useState(initialLions);
  const [partFilter, setPartFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState("준비 완료");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLion, setSelectedLion] = useState(null);

  const nextIdRef = useRef(
    initialLions.length === 0
      ? 1
      : Math.max(...initialLions.map((l) => l.id)) + 1
  );
  const latestRequestIdRef = useRef(0);
  const latestControllerRef = useRef(null);
  const lastFetchActionRef = useRef(null);
  const statusResetTimerRef = useRef(null);

  const nameInputRef = useRef(null);
  const formRef = useRef(null);
  const addBtnRef = useRef(null);

  // 필터링/정렬/검색
  const visibleLions = (() => {
    let list = lions.slice();
    if (partFilter !== "ALL") {
      list = list.filter((l) => l.part === partFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((l) =>
        String(l.name || "").toLowerCase().includes(query)
      );
    }
    if (sortBy === "name") {
      list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    } else {
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  })();

  // 폼 ESC 키
  useEffect(() => {
    if (!showForm) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowForm(false);
        addBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showForm]);

  // 상세 모달 ESC 키 + 스크롤 lock
  useEffect(() => {
    if (!selectedLion) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedLion(null);
    };
    window.addEventListener("keydown", handleEsc);
    const original = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.documentElement.style.overflow = original;
    };
  }, [selectedLion]);

  // 폼 열릴 때 이름 input에 포커스
  useEffect(() => {
    if (showForm) {
      nameInputRef.current?.focus();
    }
  }, [showForm]);

  // unmount 정리
  useEffect(() => {
    return () => {
      if (statusResetTimerRef.current) {
        window.clearTimeout(statusResetTimerRef.current);
      }
      if (latestControllerRef.current) {
        try {
          latestControllerRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  function makeNextId() {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  }

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
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      try {
        controller.abort();
      } catch (_) {}
    }, TIMEOUT_MS);

    const ctx = {
      signal: controller.signal,
      isLatest: () => requestId === latestRequestIdRef.current,
    };

    setErrorMessage("");
    setIsLoading(true);
    setStatusMessage("불러오는 중...");

    try {
      await actionFn(ctx);
      if (!ctx.isLatest()) return;

      window.clearTimeout(timeoutId);
      setIsLoading(false);
      setStatusMessage("완료!");

      if (statusResetTimerRef.current) {
        window.clearTimeout(statusResetTimerRef.current);
      }
      statusResetTimerRef.current = window.setTimeout(() => {
        if (ctx.isLatest()) setStatusMessage("준비 완료");
      }, 900);
    } catch (err) {
      if (!ctx.isLatest()) return;
      window.clearTimeout(timeoutId);

      if (err?.name === "AbortError" && timedOut) {
        setIsLoading(false);
        setStatusMessage("실패");
        setErrorMessage("불러오기 실패: 시간 초과");
        return;
      }
      if (err?.name === "AbortError") return;

      setIsLoading(false);
      setStatusMessage("실패");
      setErrorMessage(`불러오기 실패: ${err?.message || "알 수 없는 오류"}`);
      console.error(err);
    }
  }

  async function appendRandom(count, ctx) {
    const users = await fetchRandomUsers(count, ctx.signal);
    if (!ctx.isLatest()) return;

    const newLions = users.map((u) => randomUserToLion(u, makeNextId()));
    setLions((prev) => [...prev, ...newLions]);
  }

  async function refreshAll(ctx) {
    const me = lions.find((l) => l.isMe === true) || null;
    const fetchCount = me ? Math.max(0, lions.length - 1) : lions.length;

    const users = await fetchRandomUsers(fetchCount, ctx.signal);
    if (!ctx.isLatest()) return;

    const newOnes = users.map((u) => randomUserToLion(u, makeNextId()));
    const nextList = me ? [me, ...newOnes] : newOnes;

    setLions(nextList);
  }

  async function fillFormWithRandomUser(ctx) {
    const users = await fetchRandomUsers(1, ctx.signal);
    if (!ctx.isLatest()) return;

    const user = users[0];
    if (!user) throw new Error("랜덤 유저를 불러오지 못했습니다.");

    const tempLion = randomUserToLion(user, makeNextId());

    const formEl = formRef.current;
    if (!formEl) return;

    formEl.querySelector("#lionName").value = tempLion.name;
    formEl.querySelector("#lionPart").value = tempLion.part;
    formEl.querySelector("#lionSkills").value = (tempLion.skills || []).join(
      ", "
    );
    formEl.querySelector("#lionOneLineIntro").value = tempLion.oneLineIntro;
    formEl.querySelector("#lionDescription").value = tempLion.description;
    formEl.querySelector("#lionEmail").value = tempLion.contacts.email;
    formEl.querySelector("#lionPhone").value = tempLion.contacts.phone;
    formEl.querySelector("#lionWebsite").value = tempLion.contacts.website;
    formEl.querySelector("#lionOneWord").value = tempLion.oneWord;
  }

  const handleAppendOne = () => runFetchAction((ctx) => appendRandom(1, ctx));
  const handleAppendFive = () => runFetchAction((ctx) => appendRandom(5, ctx));
  const handleRefreshAll = () => runFetchAction((ctx) => refreshAll(ctx));

  const handleRetry = () => {
    if (typeof lastFetchActionRef.current === "function") {
      runFetchAction(lastFetchActionRef.current);
    }
  };

  const handleFillRandom = () => {
    runFetchAction(async (ctx) => {
      if (!showForm) setShowForm(true);
      await fillFormWithRandomUser(ctx);
    });
  };

  const handleToggleForm = () => setShowForm((prev) => !prev);
  const handleCancelForm = () => {
    setShowForm(false);
    formRef.current?.reset();
    addBtnRef.current?.focus();
  };

  const handleAddLion = (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);

    const name = String(fd.get("name") || "").trim();
    const part = String(fd.get("part") || "Frontend").trim();
    const skills = parseSkills(fd.get("skills"));
    const oneLineIntro = String(fd.get("oneLineIntro") || "").trim();
    const description = String(fd.get("description") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const website = String(fd.get("website") || "").trim();
    const oneWord = String(fd.get("oneWord") || "").trim();

    if (
      !name ||
      !part ||
      skills.length === 0 ||
      !oneLineIntro ||
      !description ||
      !email ||
      !phone ||
      !website ||
      !oneWord
    )
      return;

    const id = makeNextId();
    const newLion = {
      id,
      name,
      part,
      skills,
      oneLineIntro,
      description,
      oneWord,
      imgSrc: `https://picsum.photos/seed/${id}/200/200`,
      organization: "LION TRACK",
      isMe: false,
      contacts: { email, phone, website },
    };

    setLions((prev) => [...prev, newLion]);
    setShowForm(false);
    formEl.reset();
  };

  const handleRemoveLion = () => {
    if (lions.length === 0) return;
    setLions((prev) => prev.slice(0, -1));
  };

  const isTrulyEmpty = lions.length === 0;
  const isFilterEmpty = lions.length > 0 && visibleLions.length === 0;
  const showEmpty = isTrulyEmpty || isFilterEmpty;
  const emptyMessage = isTrulyEmpty
    ? "아직 등록된 아기사자가 없습니다."
    : "조건에 맞는 아기사자가 없습니다.";

  return (
    <main className={styles["container"]}>
      <section className={styles["controls"]} aria-label="명단 조작">
        <div className={styles["controls-row"]}>
          <button
            ref={addBtnRef}
            type="button"
            className={styles["control-btn"]}
            onClick={handleToggleForm}
          >
            아기 사자 추가
          </button>
          <button
            type="button"
            className={styles["control-btn"]}
            onClick={handleRemoveLion}
          >
            마지막 아기 사자 삭제
          </button>
          <p className={styles["lion-count"]}>총 {lions.length}명</p>
        </div>

        <div
          className={`${styles["controls-row"]} ${styles["controls-row--secondary"]}`}
          aria-label="외부 데이터 불러오기"
        >
          <button
            type="button"
            className={styles["control-btn"]}
            onClick={handleAppendOne}
            disabled={isLoading}
          >
            랜덤 1명 추가
          </button>
          <button
            type="button"
            className={styles["control-btn"]}
            onClick={handleAppendFive}
            disabled={isLoading}
          >
            랜덤 5명 추가
          </button>
          <button
            type="button"
            className={styles["control-btn"]}
            onClick={handleRefreshAll}
            disabled={isLoading}
          >
            전체 새로고침
          </button>

          <p
            className={styles["fetch-status"]}
            role="status"
            aria-live="polite"
          >
            {errorMessage || statusMessage}
          </p>

          {errorMessage && (
            <button
              type="button"
              className={`${styles["control-btn"]} ${styles["retry-btn"]}`}
              onClick={handleRetry}
            >
              재시도
            </button>
          )}
        </div>

        <div
          className={`${styles["controls-row"]} ${styles["controls-row--secondary"]}`}
          aria-label="보기 옵션"
        >
          <label className={styles["control-label"]} htmlFor="partFilter">
            파트
          </label>
          <select
            className={styles["control-input"]}
            id="partFilter"
            value={partFilter}
            onChange={(e) => setPartFilter(e.target.value)}
          >
            <option value="ALL">전체</option>
            {PARTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <label className={styles["control-label"]} htmlFor="sortSelect">
            정렬
          </label>
          <select
            className={styles["control-input"]}
            id="sortSelect"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">최신추가순</option>
            <option value="name">이름순</option>
          </select>

          <label className={styles["control-label"]} htmlFor="nameSearch">
            검색
          </label>
          <input
            className={styles["control-input"]}
            id="nameSearch"
            type="search"
            placeholder="이름으로 검색"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {showForm && (
        <div
          className={styles["modal-overlay"]}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lion-form-title"
          onClick={handleCancelForm}
        >
          <section
            className={styles["lion-form-section"]}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles["form-header"]}>
              <h2 id="lion-form-title" className={styles["form-title"]}>
                아기 사자 추가
              </h2>
              <button
                type="button"
                className={styles["modal-close"]}
                aria-label="닫기"
                onClick={handleCancelForm}
              >
                ×
              </button>
            </header>
            <form
              ref={formRef}
              className={styles["lion-form"]}
              autoComplete="off"
              onSubmit={handleAddLion}
            >
            <div className={styles["form-row"]}>
              <label className={styles["form-label"]} htmlFor="lionName">
                이름
              </label>
              <input
                ref={nameInputRef}
                className={styles["form-input"]}
                id="lionName"
                name="name"
                type="text"
                placeholder="예: 홍아기사자"
                required
              />
            </div>

            <div className={styles["form-row"]}>
              <label className={styles["form-label"]} htmlFor="lionPart">
                파트
              </label>
              <select
                className={styles["form-input"]}
                id="lionPart"
                name="part"
                required
                defaultValue="Frontend"
              >
                {PARTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`${styles["form-row"]} ${styles["form-row--full"]}`}
            >
              <label className={styles["form-label"]} htmlFor="lionSkills">
                관심 기술 (쉼표로 구분)
              </label>
              <input
                className={styles["form-input"]}
                id="lionSkills"
                name="skills"
                type="text"
                placeholder="예: JavaScript, React, HTML/CSS"
                required
              />
            </div>

            <div
              className={`${styles["form-row"]} ${styles["form-row--full"]}`}
            >
              <label
                className={styles["form-label"]}
                htmlFor="lionOneLineIntro"
              >
                한 줄 소개 (요약 카드)
              </label>
              <input
                className={styles["form-input"]}
                id="lionOneLineIntro"
                name="oneLineIntro"
                type="text"
                placeholder="예: 4주차 fetch 연습 중!"
                required
              />
            </div>

            <div
              className={`${styles["form-row"]} ${styles["form-row--full"]}`}
            >
              <label
                className={styles["form-label"]}
                htmlFor="lionDescription"
              >
                자기소개 (상세 카드)
              </label>
              <textarea
                className={styles["form-input"]}
                id="lionDescription"
                name="description"
                rows={4}
                placeholder="예: 비동기/데이터 흐름을 학습하며 UI를 다시 그리는 구조를 연습하고 있습니다."
                required
              />
            </div>

            <div className={styles["form-row"]}>
              <label className={styles["form-label"]} htmlFor="lionEmail">
                Email
              </label>
              <input
                className={styles["form-input"]}
                id="lionEmail"
                name="email"
                type="email"
                placeholder="예: lion@example.com"
                required
              />
            </div>

            <div className={styles["form-row"]}>
              <label className={styles["form-label"]} htmlFor="lionPhone">
                Phone
              </label>
              <input
                className={styles["form-input"]}
                id="lionPhone"
                name="phone"
                type="tel"
                placeholder="예: 010-1234-5678"
                required
              />
            </div>

            <div
              className={`${styles["form-row"]} ${styles["form-row--full"]}`}
            >
              <label className={styles["form-label"]} htmlFor="lionWebsite">
                Website
              </label>
              <input
                className={styles["form-input"]}
                id="lionWebsite"
                name="website"
                type="url"
                placeholder="예: https://example.com"
                required
              />
            </div>

            <div
              className={`${styles["form-row"]} ${styles["form-row--full"]}`}
            >
              <label className={styles["form-label"]} htmlFor="lionOneWord">
                한 마디
              </label>
              <input
                className={styles["form-input"]}
                id="lionOneWord"
                name="oneWord"
                type="text"
                placeholder="예: 데이터가 바뀌면 UI도 바뀐다!"
                required
              />
            </div>

            <div className={styles["form-actions"]}>
              <button
                type="button"
                className={styles["control-btn"]}
                onClick={handleFillRandom}
                disabled={isLoading}
              >
                랜덤 값 채우기
              </button>
              <button type="submit" className={styles["control-btn"]}>
                추가하기
              </button>
              <button
                type="button"
                className={styles["control-btn"]}
                onClick={handleCancelForm}
              >
                취소
              </button>
            </div>
          </form>
          </section>
        </div>
      )}

      <section className={styles["profile-card-grid"]}>
        {showEmpty ? (
          <p className={styles["empty-state"]} role="status">
            {emptyMessage}
          </p>
        ) : (
          visibleLions.map((lion) => (
            <article
              key={lion.id}
              className={`${styles["profile-card"]} ${
                lion.isMe ? styles["is-me"] : ""
              }`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedLion(lion)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedLion(lion);
                }
              }}
            >
              <figure className={styles["profile-image"]}>
                <span className={styles["profile-badge"]}>
                  {lion.skills[0] || "JavaScript"}
                </span>
                <img src={lion.imgSrc} alt={`${lion.name} 프로필 이미지`} />
              </figure>
              <section className={styles["profile-content"]}>
                <h2 className={styles["name"]}>{lion.name}</h2>
                <p className={styles["part"]}>{lion.part}</p>
                <p className={styles["introduction"]}>{lion.oneLineIntro}</p>
              </section>
            </article>
          ))
        )}
      </section>

      {selectedLion && (
        <div
          className={styles["modal-overlay"]}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lion-detail-name"
          onClick={() => setSelectedLion(null)}
        >
          <section
            className={styles["profile-detail"]}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles["modal-close"]}
              aria-label="닫기"
              onClick={() => setSelectedLion(null)}
            >
              ×
            </button>

            <header className={styles["detail-header"]}>
              <h1 id="lion-detail-name" className={styles["detail-name"]}>
                {selectedLion.name}
              </h1>
              <span className={styles["detail-part"]}>{selectedLion.part}</span>
              <p className={styles["detail-organization"]}>
                {selectedLion.organization}
              </p>
            </header>

            <section className={styles["detail-section"]}>
              <h3>자기소개</h3>
              <p>{selectedLion.description || "새로 추가된 아기 사자입니다."}</p>
            </section>

            <section className={styles["detail-section"]}>
              <h3>연락처</h3>
              <ul className={styles["contact-list"]}>
                <li>Email: {selectedLion.contacts?.email || ""}</li>
                <li>Phone: {selectedLion.contacts?.phone || ""}</li>
                {selectedLion.contacts?.website && (
                  <li>
                    <a
                      href={selectedLion.contacts.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedLion.contacts.website}
                    </a>
                  </li>
                )}
              </ul>
            </section>

            <section className={styles["detail-section"]}>
              <h3>관심 기술</h3>
              <ul className={styles["skill-list"]}>
                {(selectedLion.skills || []).map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </section>

            <section className={styles["detail-section"]}>
              <h3>한 마디</h3>
              <p>{selectedLion.oneWord}</p>
            </section>
          </section>
        </div>
      )}
    </main>
  );
}
