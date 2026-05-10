import { useState, useRef, useEffect } from "react";
import styles from "./Page.module.css";
import { initialLions } from "./lions";

const PARTS = ["Frontend", "Backend", "Design"];

function parseSkills(input) {
  return String(input || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Week3Page() {
  const [lions, setLions] = useState(initialLions);
  const [partFilter, setPartFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [selectedLion, setSelectedLion] = useState(null);
  const nameInputRef = useRef(null);
  const addBtnRef = useRef(null);

  const visibleLions = lions.filter(
    (lion) => partFilter === "ALL" || lion.part === partFilter
  );

  const isTrulyEmpty = lions.length === 0;
  const isFilterEmpty = lions.length > 0 && visibleLions.length === 0;
  const showEmpty = isTrulyEmpty || isFilterEmpty;
  const emptyMessage = isTrulyEmpty
    ? "아직 등록된 아기사자가 없습니다."
    : "조건에 맞는 아기사자가 없습니다.";

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

  // 폼이 열리면 이름 input에 포커스
  useEffect(() => {
    if (showForm) {
      nameInputRef.current?.focus();
    }
  }, [showForm]);

  // 모달 ESC 키 + body scroll lock
  useEffect(() => {
    if (!selectedLion) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedLion(null);
    };
    window.addEventListener("keydown", handleEsc);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = original;
    };
  }, [selectedLion]);

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
  };

  const handleCancelForm = (formEl) => {
    setShowForm(false);
    formEl?.reset();
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
    ) {
      return;
    }

    const nextId =
      lions.length === 0 ? 1 : Math.max(...lions.map((l) => l.id)) + 1;

    const newLion = {
      id: nextId,
      name,
      part,
      skills,
      oneLineIntro,
      description,
      oneWord,
      imgSrc: `https://picsum.photos/seed/${nextId}/200/200`,
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

  return (
    <main className={styles["container"]}>
      <section className={styles["controls"]} aria-label="명단 조작">
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
        <select
          className={styles["control-select"]}
          aria-label="파트 필터"
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
      </section>

      {showForm && (
        <section className={styles["lion-form-section"]}>
          <form
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
                placeholder="예: 3주차 DOM 조작 연습 중!"
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
                placeholder="예: HTML/CSS로 구조를 만들고, JS로 데이터를 바꾸면 화면이 바뀌는 경험을 하고 있습니다."
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
                placeholder="예: 데이터 바꾸면 화면도 바뀐다!"
                required
              />
            </div>

            <div className={styles["form-actions"]}>
              <button type="submit" className={styles["control-btn"]}>
                추가하기
              </button>
              <button
                type="button"
                className={styles["control-btn"]}
                onClick={(e) => handleCancelForm(e.currentTarget.form)}
              >
                취소
              </button>
            </div>
          </form>
        </section>
      )}

      <section className={styles["profile-card-grid"]}>
        {showEmpty ? (
          <p className={styles["empty-state"]} role="status">
            {emptyMessage}
          </p>
        ) : (
          visibleLions.map((lion) => (
            <button
              key={lion.id}
              type="button"
              className={`${styles["profile-card"]} ${
                lion.isMe ? styles["is-me"] : ""
              }`}
              onClick={() => setSelectedLion(lion)}
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
            </button>
          ))
        )}
      </section>

      {selectedLion && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => setSelectedLion(null)}
        >
          <div
            className={styles["modal"]}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              type="button"
              className={styles["modal-close"]}
              onClick={() => setSelectedLion(null)}
              aria-label="닫기"
            >
              ×
            </button>

            <header className={styles["modal-header"]}>
              <figure className={styles["modal-image"]}>
                <span className={styles["profile-badge"]}>
                  {selectedLion.skills[0] || "JavaScript"}
                </span>
                <img
                  src={selectedLion.imgSrc}
                  alt={`${selectedLion.name} 프로필 이미지`}
                />
              </figure>
              <div className={styles["modal-name-area"]}>
                <h2 id="modal-title" className={styles["modal-name"]}>
                  {selectedLion.name}
                </h2>
                <span className={styles["modal-part"]}>{selectedLion.part}</span>
                <p className={styles["modal-organization"]}>
                  {selectedLion.organization}
                </p>
              </div>
            </header>

            <div className={styles["modal-body"]}>
              <section className={styles["modal-section"]}>
                <h3>자기소개</h3>
                <p>
                  {selectedLion.description || "새로 추가된 아기 사자입니다."}
                </p>
              </section>

              <section className={styles["modal-section"]}>
                <h3>관심 기술</h3>
                <div className={styles["skill-badges"]}>
                  {(selectedLion.skills || []).map((skill) => (
                    <span key={skill} className={styles["skill-badge"]}>
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              <section className={styles["modal-section"]}>
                <h3>연락처</h3>
                <ul className={styles["contact-list"]}>
                  <li>
                    <span className={styles["contact-label"]}>Email</span>
                    <a href={`mailto:${selectedLion.contacts?.email}`}>
                      {selectedLion.contacts?.email}
                    </a>
                  </li>
                  <li>
                    <span className={styles["contact-label"]}>Phone</span>
                    <a
                      href={`tel:${(selectedLion.contacts?.phone || "").replace(/-/g, "")}`}
                    >
                      {selectedLion.contacts?.phone}
                    </a>
                  </li>
                  {selectedLion.contacts?.website && (
                    <li>
                      <span className={styles["contact-label"]}>Website</span>
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

              <section className={styles["modal-section"]}>
                <h3>한 마디</h3>
                <p className={styles["modal-motto"]}>
                  "{selectedLion.oneWord}"
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
