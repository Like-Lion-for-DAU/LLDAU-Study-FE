import nhProfile from "./nhprofile.png";
import dyProfile from "./dyprofile.png";
import jwProfile from "./jwprofile.gif";
import twProfile from "./twprofile.png";
import smProfile from "./smprofile.png";
import deProfile from "./deprofile.jpg";
import syProfile from "./syprofile.png";

export const initialLions = [
  {
    id: 1,
    name: "김나함", part: "Frontend", intro: "분야를 넘나들며 성장하는 개발자입니다.",
    bio: "동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다.",
    skills: "JavaScript, HTML / CSS", email: "naham9488@gmail.com", phone: "010-3626-9488",
    image: nhProfile, isMe: true,
  },
  {
    id: 2,
    name: "임도영", part: "Frontend", intro: "아기사자 14기 프론트엔드 임도영입니다.",
    bio: "동아대 26학번 컴퓨터공학과 임도영입니다.", skills: "HTML/CSS, JavaScript, JAVA, C/C++",
    email: "dlaehdud342@naver.com", phone: "010-3516-6306", image: dyProfile,
  },
  {
    id: 3,
    name: "김주완", part: "Frontend", intro: "성실히 배우고 싶은 학생입니다.",
    bio: "컴퓨터공학과 1학년입니다. 코드 하나하나 다 이해하려고 노력하고 있습니다.",
    skills: "HTML / CSS, JavaScript,React(학습 중)", email: "mmnnbbnn070910@gmail.com",
    phone: "010-9041-1287", image: jwProfile,
  },
  {
    id: 4,
    name: "백태우", part: "Frontend", intro: "I'm Empty Stack Junior",
    bio: "AI학과이지만 Full Stack Developer를 목표로 하고 있습니다.",
    skills: "NLU / NLG, NLP, LLM", email: "btu0414@gmail.com", phone: "010-4564-4725",
    image: twProfile,
  },
  {
    id: 5,
    name: "정소민", part: "Frontend", intro: "컴퓨터공학과 25학번 정소민입니다.",
    bio: "프론트엔드를 맡고 있는 정소민입니다.", skills: "React, ReactNative, JavaScript",
    email: "sominjung1116@gmail.com", phone: "010-5615-8474", image: smProfile,
  },
  {
    id: 6,
    name: "이도은", part: "Frontend", intro: "열심히 배우는 프론트엔드 개발자입니다.",
    bio: "모르는 게 너무 많은 말하는 수국입니다. 스펀지처럼 이해하려고 노력하고 있습니다.",
    skills: "HTML/CSS, JavaScript, React (공부 중)", email: "dodo55860@gmail.com",
    phone: "010-2686-5586", image: deProfile,
  },
  {
    id: 7,
    name: "정서윤", part: "Frontend", intro: "열심히 배워가고 있는 프론트엔드 개발자입니다.",
    bio: "07년생 26학번 컴퓨터공학과 정서윤입니다. 배우는 과정 자체를 즐깁니다.",
    skills: "TypeScript, SSR/SSG, Utility-First CSS", email: "t01021124995@gmail.com",
    phone: "010-3846-5638", image: syProfile,
  },
];

import { useState, useEffect, useRef } from "react";
import styles from "./Page.module.css";
import { initialLions } from "./lions";

export default function Week4Page() {
  const [lions, setLions] = useState(initialLions);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const nextIdRef = useRef(initialLions.length + 1);
  const latestRequestIdRef = useRef(0);
  const controllerRef = useRef(null);
  const lastFetchActionRef = useRef(null);
  
  const formRef = useRef(null);
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


  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    
    const name = String(fd.get("name") || "").trim();
    if (!name) return alert("이름을 입력해주세요.");

    const newLion = {
      id: makeNextId(),
      name: name,
      part: fd.get("part"),
      skills: String(fd.get("skills") || "").trim(),
      intro: String(fd.get("intro") || "").trim(),
      bio: String(fd.get("bio") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      
      image: `https://picsum.photos/seed/manual-${nextIdRef.current}/200/200`,
    };

    setLions((prev) => [...prev, newLion]);
    
    formRef.current?.reset();
    setShowModal(false);
  };

  const handleCancel = () => {
    formRef.current?.reset();
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
          skills: "API, Fetch, Async/Await",
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

  const filteredLions = filter === "All"
    ? lions
    : lions.filter((lion) => lion.part === filter);

  return (
    <div className={styles.weekPage}>
      
      
      {isLoading && (
        <div className={styles.loadingBanner} role="status">
          ⏳ 외부 서버에서 데이터를 가져오는 중입니다... 잠시만 기다려주세요.
        </div>
      )}

      
      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          <span>🚨 {errorMessage}</span>
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
        
        <button 
          className={styles.fetchBtn}
          onClick={() => fetchExternalData(1)} 
          disabled={isLoading} 
        >
          랜덤 1명 불러오기 (서버)
        </button>
        
        <button 
          className={styles.fetchBtn}
          onClick={() => fetchExternalData(5)} 
          disabled={isLoading} 
        >
          랜덤 5명 불러오기 (서버)
        </button>
        
        <button className={styles.removeBtn} onClick={handleRemoveLast}>
          마지막 삭제
        </button>
        
        <select 
          className={styles.filterSelect}
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">전체 파트 보기</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Design">Design</option>
        </select>

        <span style={{ marginLeft: '15px' }}>총 {filteredLions.length}명</span>
      </div>

      
      {filteredLions.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>등록된 아기사자가 없습니다.</h2>
          <p>새로운 아기사자를 추가하거나 다른 파트를 필터링해보세요!</p>
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filteredLions.map((lion) => (
            <div
              key={lion.id}
              className={`${styles.summaryCard} ${lion.isMe ? styles.myCard : ""}`}
            >
              <span className={styles.badge}>
                {lion.skills ? lion.skills.split(",")[0].trim() : "Skill"}
              </span>
              <img
                src={lion.image}
                alt={`${lion.name} 프로필`}
                onError={(e) => {
                  e.target.src = "https://picsum.photos/id/64/400/300";
                }}
              />
              <h3>{lion.name}</h3>
              <span style={{ fontWeight: 'bold', color: '#555' }}>{lion.part}</span>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>{lion.intro}</p>
            </div>
          ))}
        </div>
      )}

      
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={handleCancel}
        >
          <form
            ref={formRef}
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <label htmlFor="name">이름</label>
            <input ref={nameInputRef} id="name" name="name" required />

            <label htmlFor="part">파트</label>
            <select id="part" name="part" required>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Design">Design</option>
            </select>

            <label htmlFor="skills">관심 기술 (쉼표로 구분)</label>
            <input id="skills" name="skills" required />

            <label htmlFor="intro">한 줄 소개</label>
            <input id="intro" name="intro" required />

            <label htmlFor="bio">자기소개</label>
            <textarea id="bio" name="bio" required />

            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />

            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel" required />

            <button type="submit">추가하기</button>
            <button type="button" onClick={handleCancel}>
              취소
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
