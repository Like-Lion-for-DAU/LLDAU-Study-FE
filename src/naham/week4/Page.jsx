import { useState, useEffect, useRef } from "react";
import styles from "./Page.module.css";
import { initialLions } from "./lions";

export default function Week4Page() {
  const [lions, setLions] = useState(initialLions);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchName, setSearchName] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");

  const EMPTY_FORM = {
    name: "", part: "Frontend", skills: "",
    intro: "", bio: "", email: "", phone: "",
  };
  const [formData, setFormData] = useState(EMPTY_FORM);

  const nextIdRef = useRef(initialLions.length + 1);
  const latestRequestIdRef = useRef(0);
  const controllerRef = useRef(null);
  const lastFetchActionRef = useRef(null);
  
  const nameInputRef = useRef(null);
  const openBtnRef = useRef(null);

  const makeNextId = () => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  };

  const pickPart = (seedStr) => {
    const PARTS = ["Frontend", "Backend", "Design"];
    const seed = String(seedStr || "");
    let sum = 0;
    for (let i = 0; i < seed.length; i++) {
      sum += seed.charCodeAt(i);
    }
    return PARTS[sum % PARTS.length];
  };

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (showModal) {
      nameInputRef.current?.focus();
    } else {
      openBtnRef.current?.focus();
    }

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        handleCancel();
      }
    };

    if (showModal) window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [showModal]);

  const handleInput = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = formData.name.trim();

    if (!name) {
      setFormError("이름을 입력해주세요.");
      return;
    }
    setFormError("");

    const newLion = {
      id: makeNextId(),
      name: name,
      part: formData.part,
      skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      intro: formData.intro.trim(),
      bio: formData.bio.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      image: `https://picsum.photos/seed/manual-${nextIdRef.current}/200/200`,
      isMe: false,
    };

    setLions((prev) => [...prev, newLion]);
    setFormData(EMPTY_FORM);
    setShowModal(false);
  };

  const handleCancel = () => {
    setFormError("");
    setFormData(EMPTY_FORM);
    setShowModal(false);
  };

  const handleRemoveLast = () => {
    setLions((prev) => prev.slice(0, -1));
  };

  const fetchExternalData = async (count) => {
    lastFetchActionRef.current = () => fetchExternalData(count);
    
    setIsLoading(true);
    setErrorMessage("");

    const requestId = ++latestRequestIdRef.current;

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    let timedOut = false;
    const TIMEOUT_MS = 5000;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/users", {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("서버 응답 오류");
      
      const externalUsers = await response.json();
      
      if (requestId !== latestRequestIdRef.current) return;

      const newLions = externalUsers.slice(0, count).map((user) => {
        return {
          id: makeNextId(),
          name: user.username,
          part: pickPart(user.username),
          intro: user.company.catchPhrase,
          bio: `외부 서버에서 넘어온 데이터입니다. 소속: ${user.company.name}`,
          skills: ["API", "Fetch", "Async/Await"],
          email: user.email,
          phone: user.phone,
          image: `https://picsum.photos/seed/${user.username}/200/200`,
          isMe: false,
        };
      });

      setLions((prev) => [...newLions, ...prev]);

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === "AbortError") {
        if (timedOut) {
          setErrorMessage("불러오기 실패: 서버 응답 시간 초과 (5초)");
        }
        return;
      }
      
      setErrorMessage(`데이터를 불러오는 중 에러가 발생했습니다: ${error.message}`);
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const visibleLions = (() => {
    let list = lions.slice();

    if (filter !== "All") {
      list = list.filter((l) => l.part === filter);
    }

    const query = searchName.trim();
    if (query) {
      list = list.filter((l) => l.name?.includes(query));
    }

    if (sortOrder === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    } else {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  })();

  return (
    <div className={styles.weekPage}>
      
      {isLoading && (
        <div className={styles.loadingBanner} role="status">
          외부 서버에서 데이터를 가져오는 중입니다... 잠시만 기다려주세요.
        </div>
      )}

      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          <span>{errorMessage}</span>
          <button 
            className={styles.retryBtn} 
            onClick={() => lastFetchActionRef.current?.()}
          >
            재시도
          </button>
        </div>
      )}

      <div className={styles.controls}>
        <button ref={openBtnRef} onClick={() => setShowModal(true)}>
          수동으로 추가
        </button>
        <button className={styles.fetchBtn} onClick={() => fetchExternalData(1)} disabled={isLoading}>
          랜덤 1명 불러오기 (서버)
        </button>
        <button className={styles.fetchBtn} onClick={() => fetchExternalData(5)} disabled={isLoading}>
          랜덤 5명 불러오기 (서버)
        </button>
        <button className={styles.removeBtn} onClick={handleRemoveLast}>
          마지막 삭제
        </button>
        
        <input
          type="search"
          placeholder="이름으로 검색"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className={styles.searchInput}
        />

        <select className={styles.filterSelect} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">전체 파트 보기</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Design">Design</option>
        </select>

        <select className={styles.filterSelect} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="latest">최신추가순</option>
          <option value="name">이름순</option>
        </select>

        <span className={styles.totalCount}>총 {visibleLions.length}명</span>
      </div>

      {visibleLions.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>해당하는 아기사자가 없습니다.</h2>
          <p>새로운 아기사자를 추가하거나 검색 조건을 변경해보세요!</p>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {visibleLions.map((lion) => (
            <div key={lion.id} className={`${styles.summaryCard} ${lion.isMe ? styles.myCard : ""}`}>
              <span className={styles.badge}>
                {lion.skills?.[0] || "Skill"}
              </span>
              <img
                src={lion.image}
                alt={`${lion.name} 프로필`}
                onError={(e) => { e.target.src = "https://picsum.photos/id/64/400/300"; }}
              />
              <h3>{lion.name}</h3>
              <span className={styles.cardPart}>{lion.part}</span>
              <p className={styles.cardIntro}>{lion.intro}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCancel}>
          <form className={styles.modalContent} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
          
            {formError && <p className={styles.formError}>{formError}</p>}
            
            <label htmlFor="name">이름</label>
            <input ref={nameInputRef} id="name" value={formData.name} onChange={handleInput("name")} required />

            <label htmlFor="part">파트</label>
            <select id="part" value={formData.part} onChange={handleInput("part")} required>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Design">Design</option>
            </select>

            <label htmlFor="skills">관심 기술 (쉼표로 구분)</label>
            <input id="skills" value={formData.skills} onChange={handleInput("skills")} required />

            <label htmlFor="intro">한 줄 소개</label>
            <input id="intro" value={formData.intro} onChange={handleInput("intro")} required />

            <label htmlFor="bio">자기소개</label>
            <textarea id="bio" value={formData.bio} onChange={handleInput("bio")} required />

            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={formData.email} onChange={handleInput("email")} required />

            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" value={formData.phone} onChange={handleInput("phone")} required />

            <button type="submit">추가하기</button>
            <button type="button" onClick={handleCancel}>취소</button>
          </form>
        </div>
      )}
    </div>
  );
}