import styles from "./Page.module.css";
import { members as initialMembers} from "./members";
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";


const TIMEOUT_MS = 5000;

function SummaryCard({ member }) {
  const navigate = useNavigate();
  return (
    <div
      className={`${styles["card"]} ${member.isMe ? styles["my-card"] : ""}`}
      onClick={() =>
        navigate(`/doyoung/week7/${member.id}`)
      }
      >
      <img
      src={member.image}
      alt={`${member.name} 프로필`}
      className={styles["photo"]}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = `https://picsum.photos/seed/${member.id || member.name}/300/300`;
      }}
      />
      <h3>{member.name}</h3>
      <span className={styles["frontend"]}>{member.role}</span>
      <p>{member.intro}</p>
    </div>
  );
}

export function ContactList({contact}) {
  if (!contact) return null;
  return (
    <ul>
      {contact.email && (
        <li>
          Email : <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </li>
      )}
      {contact.phone && (
        <li>
          Phone :{" "}
          <a href={`tel:${contact.phone.replace(/-/g, "")}`}>{contact.phone}</a>
        </li>
      )}
      {contact.link && (
        <li>
          link :{" "}
          <a
            href={contact.link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contact.link.label}
          </a>
        </li>
      )}
      {contact.instagram && <li>인스타: {contact.instagram}</li>}
    </ul>
  );
}

export default function WeekPage({ members, setMembers }) {

  const [retryAction, setRetryAction] =
  useState(null);

  const handleRetry = () =>{
    if (retryAction) {
      retryAction();
    }
  };

  const [fetchStatus, setFetchStatus] =
  useState("idle");

  const [statusMessage, setStatusMessage] =
  useState("");

  const latestControllRef = useRef(null);

  const latestRequestIdRef = useRef(0);

  const [sortType, setSortType] =
  useState("recent");
  const statusResetTimerRef = useRef(null);
  const focusResetTimerRef = useRef(null);

  const fetchRandomUsers = async (count, type = "add") => {
    const requestId = ++latestRequestIdRef.current;
    setRetryAction(() => () => fetchRandomUsers(count, type));

    if(latestControllRef.current) latestControllRef.current.abort();
    if (requestId !== latestRequestIdRef.current) return;
    const controller = new AbortController();
    latestControllRef.current = controller;

    let timedOut = false;

    const timeOutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 5000);

    try {
      setFetchStatus("loading");
      setStatusMessage("");


      const response = await fetch(`https://randomuser.me/api/?results=${count}&nat=us,gb,ca,au,nz`, {signal: controller.signal});
      clearTimeout(timeOutId);
      if(requestId !== latestRequestIdRef.current) return;
      if (!response.ok) {
          throw new Error("API 요청 실패");
      }
      const data = await response.json();
      const parts = ["Frontend", "Backend", "Design",];
      const newMember = data.results.map(
        (user) => ({
          id : makeNextId(user),
          name: `${user.name.first} ${user.name.last}`,
          role:
          parts[
            Math.floor(Math.random() * parts.length)
          ],
          //Math.floor -> 소수점 버림
          intro: "랜덤 유저입니다.",
          bio: [
            `${user.location.country}에서 온 사용자`,
          ],
          skills: [
            "React",
            "JavaScript",
            "CSS",
          ],
          motto: "잘 부탁드립니다!",
          image: user.picture.large,
          contact: {
            email: user.email,
            phone: user.phone,
            link: { label: "Profile", url: user.picture.large },
          },
        })
      );

      if (type === "refresh") {
        const myCards = members.filter(
          (member) => member.isMe
        );
        setMembers([
          ...myCards,
          ...newMember,
        ]);
      } else {
        setMembers((prev) => [
          ...newMember,
          ...prev
        ]);
      }

      setFetchStatus("success");
      if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
      statusResetTimerRef.current = setTimeout(() => {
        setFetchStatus("idle");
      }, 2000);
    }catch (error) {
      clearTimeout(timeOutId);
      setFetchStatus("error")
      if(error.name === "AbortError" && timedOut){
        setStatusMessage("시간 초과");
      } else {
        setStatusMessage("불러오기 실패")
      }
    }
  };

  const fillRandomData = async () => {
    const controller = new AbortController();

    let timedOut = false;

    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 5000);

    const response = await fetch(
      `https://randomuser.me/api/?nat=us,gb,ca,au,nz`,
      { signal: controller.signal }
    );
    try{
      setFetchStatus("loading");

      setRetryAction(() => fillRandomData);

      await new Promise((resolve) =>
      setTimeout(resolve, 5000));

      const response = await fetch(`https://randomuser.me/api/?nat=us,gb,ca,au,nz`);

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error("랜덤 유저 불러오기 실패");
      }
      const data = await response.json();
      const user = data.results[0];

      const parts = [
        "Frontend",
        "Backend",
        "Design",
      ];

      const randomIndex = Math.floor(
        Math.random() * parts.length
      );

      setmemberInput({
        id: makeNextId(user),
        name: `${user.name.first} ${user.name.last}`,
        role: parts[randomIndex],
        skills : "React, JavaScript, CSS",
        intro: "랜덤으로 생성된 아기사자입니다!",
        bio: `${user.location.country}에서 온 사용자입니다.`,
        email: user.email,
        phone: user.phone,
        web: user.picture.large,
        motto: "잘 부탁드립니다!",
      });
      setFetchStatus("success");

      setTimeout(() => {
        setFetchStatus("idle");
      }, 2000);
    } catch (error) {
      console.error(error);
      if (error.name === "AbortError" && timedOut) {
        setFetchStatus("error");
        setStatusMessage("시간 초과");
      } else if (error.name !== "AbortError") {
        setFetchStatus("error");
        setStatusMessage("랜덤 데이터 불러오기 실패");
      }
    }
  }

  const [search, setSearch] =
  useState("")

  const [showForm, setShowForm] =
  useState(false);

  const [partFilter, setPartFilter] =
  useState("ALL");
  
  const nextIdRef = useRef(
    initialMembers.length === 0 
    ? 1 
    : Math.max(...initialMembers.map((m) => m.id)) + 1
  );

  const frontendCount =
  members.filter(
    (m) => m.role === "Frontend"
  ).length;

  const backendCount =
  members.filter(
    (m) => m.role === "Backend"
  ).length;

  const designCount =
  members.filter(
    (m) => m.role === "Design"
  ).length;

  function makeNextId(user) {
    if (user) {
      return `${user.name.first}${user.name.last}${Date.now()}`
      .toLowerCase();
    }
    return `manual-${Date.now()}`;
  }

  const [memberInput, setmemberInput] =
  useState ({
    name :"",
    role :"",
    skills :"",
    intro :"",
    bio :"",
    email : "",
    phone :"",
    web :"",
    motto :"",
  }); 

  const visibleMembers = [...members]
  .filter((member) => {
    const matchPart =
    partFilter === "ALL" ||
    member.role === partFilter;

    const matchSearch =
    member.name
    .toLowerCase()
    .includes(search.toLowerCase());

    return matchPart && matchSearch;
  })
//a, b로 나눠진 이유 => a와 b를 비교하기 위해
  .sort((a,b) => {
    if (sortType === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if(e.key === "Escape") {
        setShowForm(false);
      }
    };

    if (showForm) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener(
        "keydown",
        handleEsc
      );
    };
  }, [showForm]);

  function handleInputChange(field, event) {
    setmemberInput((prevState) => ({
      ...prevState,
      [field] : event.target.value,
    }));
  }

  function handleRemoveLast() {
    setMembers((prev) => {
      const lastIndex = prev.findLastIndex((member) => !member.isMe);

      if (lastIndex === -1) return prev;

      return prev.filter(
        //_이거 뭐하는 놈이지...
        (_, index) => index !== lastIndex
      );
    });
  }

  function handleCardClick(id) {
    const member =
    members.find((m) => m.id === id);

    setSelectedMember(member);

    if (focusResetTimerRef.current) clearTimeout(focusResetTimerRef.current);
    focusResetTimerRef.current = setTimeout(() => {
      setFocusedId(null);
    }, 1000);
  }
  useEffect(() => {
    return () => {
      if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
      if (focusResetTimerRef.current) clearTimeout(focusResetTimerRef.current);
      if (latestControllRef.current) latestControllRef.current.abort();
    };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const newMember = {
      id: makeNextId(),
      name : memberInput.name,
      role : memberInput.role,
      intro : memberInput.intro,
      club : "DSIS",
      image: "/lion.png",
      bio : [memberInput.bio],
      skills : memberInput.skills
      .split(",")
      .map((skill) => skill.trim()),
      motto: memberInput.motto,
      contact: {
        email: memberInput.email,
        phone: memberInput.phone,
        link: {
          label:"웹사이트",
          url: memberInput.web,
        },
      },
    };

    setMembers((prev) => [
      ...prev,
      newMember,
    ]);

    setmemberInput({
      name: "",
      role: "",
      skills: "",
      intro: "",
      bio: "",
      email: "",
      phone: "",
      web: "",
      motto: "",
    });
    setShowForm(false);
  }


  return (
    <div className={styles["week-page"]}>
      <h2>7주차</h2>

      <section className={styles["controlSection"]}>

        <h2 className={styles["controlTitle"]}>
          멋쟁이사자처럼 아기사자 명단
        </h2>

        <div className={styles["searchSection"]}>

          <input
          type="text"
          value={search}
          onChange={(e) => 
            setSearch(e.target.value)
          }
          className={styles["nametext"]}
          placeholder="이름으로 검색"/>
        </div>

        <div className={styles["statusBar"]}>

          <span
          className={styles["count"]}>
            총 {visibleMembers.length}명
          </span>

          {fetchStatus === "idle" && (
            <p className={styles["statusText"]}>준비 완료</p>
          )}

          {fetchStatus === "loading" && (
            <p className={styles["statusText"]}>불러오는 중...</p>
          )}

          {fetchStatus === "success" && (
            <p className={styles["statusSuccess"]}>완료!</p>
          )}

          {fetchStatus === "error" && (
            <div>
              <p className={styles["statusError"]}>
                불러오기 실패 : 
                {statusMessage}
              </p>

              <button
              className={styles["retryBtn"]}
              onClick={handleRetry}>
                재시도
              </button>
            </div>
          )}
        </div>

        <div className={styles["filterSection"]}>
          <select
          value={partFilter}
          onChange={(e) => 
            setPartFilter(e.target.value)
          }
          className={styles["filterControl"]}>
            <option value="ALL">전체</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
          </select>

          <select
          value={sortType}
          className={styles["filterControl"]}
          onChange={(e) =>
            setSortType(e.target.value)
          }>
            <option value="recent">최신추가순</option>
            <option value="name">이름순</option>
          </select>
        </div>

        <div className={styles["actionSection"]}>
          <button
          type="button"
          className={styles["primaryBtn"]}
          onClick={() => setShowForm(true)}>
            아기사자추가
          </button>

          <button
          type="button"
          className={styles["btnIcon"]}
          onClick={handleRemoveLast}>
            마지막 아기 사자 삭제
          </button>

          <button
          type="button"
          className={styles["primaryBtn"]}
          onClick={() => fetchRandomUsers(1, "add")}>
            랜덤 1명 추가
          </button>

          <button
          type="button"
          className={styles["primaryBtn"]}
          onClick={() => fetchRandomUsers(5, "add")}>
            랜덤 5명 추가
          </button>

          <button
          type="button"
          className={styles["btnIcon"]}
          onClick={() =>
            fetchRandomUsers(
              members.filter((m) => !m.isMe)
              .length,
              "refresh"
            )
          }>
            전체 새로고침
          </button>
        </div>

      </section>

      {showForm && (
        <section
        className={styles["formSection"]}>
          <div>
            <form
            onSubmit={handleSubmit}
            className={styles["formInner"]}>
              <div
              className={styles["controlInner"]}>
                <label
                htmlFor="name"
                className={styles["text"]}>
                  이름
                </label>
                <input
                id="name"
                type="text"
                className={styles["form"]}
                value={memberInput.name}
                onChange={(event) =>
                  handleInputChange("name", event)
                }
                placeholder="예: 홍아기사자"
                required/>
              </div>
              <div
              className={styles["controlInner"]}>
                <label
                htmlFor="role"
                className={styles["text"]}>
                  파트
                </label>
                <select
                id="role"
                className={styles["part"]}
                value={memberInput.role}
                onChange={(e) =>
                  handleInputChange("role", e)
                }
                required>
                  <option value="">파트를 선택하세요</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Design">Design</option>
                </select>
              </div>
              <div
              className={styles["Width"]}>
                <label
                htmlFor="skills"
                className={styles["text"]}>
                  관심 기술 (쉼표로 구성)
                </label>
                <input
                id="skills"
                type="text"
                className={styles["form"]}
                value={memberInput.skills}
                onChange={(event) =>
                  handleInputChange("skills", event)
                }
                placeholder="예: JavaScript, React, HTML/CSS"
                required/>
              </div>
              <div
              className={styles["Width"]}>
                <label
                htmlFor="intro"
                className={styles["text"]}>
                  한 줄 소개 (요약 카드)
                </label>
                <input
                id="intro"
                type="text"
                className={styles["form"]}
                value={memberInput.intro}
                onChange={(event) =>
                  handleInputChange("intro", event)
                }
                placeholder="예: 3주차 DOM 조작 연습 중!"
                required/>
              </div>
              <div
              className={styles["Width"]}>
                <label
                htmlFor="bio"
                className={styles["text"]}>
                  자기소개 (상세 카드)
                </label>
                <textarea
                id="bio"
                rows="5"
                cols="30"
                value={memberInput.bio}
                className={styles["form"]}
                onChange={(event) =>
                  handleInputChange("bio", event)
                }
                placeholder="예: HTML/CSS로 구조를 만들고, JS로 데이터를 바꾸면 화면이 바뀌는 경험을 하고 있습니다."
                required/>
              </div>
              <div
              className={styles["controlInner"]}>
                <label
                htmlFor="email"
                className={styles["text"]}>
                  Email
                </label>
                <input
                id="email"
                type="email"
                className={styles["form"]}
                value={memberInput.email}
                onChange={(event) =>
                  handleInputChange("email", event)
                }
                placeholder="예: lion@example.com"
                required/>
              </div>
              <div
              className={styles["controlInner"]}>
                <label
                htmlFor="phone"
                className={styles["text"]}>
                  Phone
                </label>
                <input
                id="phone"
                type="tel"
                className={styles["form"]}
                value={memberInput.phone}
                onChange={(event) =>
                  handleInputChange("phone", event)
                }
                placeholder="예: 010-1234-5678"
                required/>
              </div>
              <div
              className={styles["Width"]}>
                <label
                htmlFor="web"
                className={styles["textWidth"]}>
                  Website
                </label>
                <input
                id="web"
                type="url"
                className={styles["form"]}
                value={memberInput.web}
                onChange={(event) =>
                  handleInputChange("web", event)
                }
                placeholder="예: https://example.com"
                required/>
              </div>
              <div
              className={styles["Width"]}>
                <label
                htmlFor="motto"
                className={styles["text"]}>
                  한마디
                </label>
                <input
                id="motto"
                type="text"
                className={styles["form"]}
                value={memberInput.motto}
                onChange={(event) =>
                  handleInputChange("motto", event)
                }
                placeholder="예: 데이터 바꾸면 화면도 바뀐다!"
                required/>
              </div>
              <div
              className={styles["controlOut"]}>
                <button
                type="button"
                className={styles["btnIcon"]}
                onClick={fillRandomData}>
                  랜덤 값 채우기
                </button>
                <button
                type="submit"
                className={styles["btnIcon"]}
                >
                  추가하기
                </button>
                <button
                type="button"
                className={styles["btnIcon"]}
                onClick={() =>
                  setShowForm(false)
                }>
                  취소
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
      {visibleMembers.length === 0 ? (
        <p>조건에 맞는 아기사자가 없습니다.</p>
      ) : (

        <div>
          <div className={styles["mainLayout"]}>

            <aside className={styles["sidebar"]}>

              {members
              .filter((m) => m.isMe)
              .map((member) => (
                <SummaryCard
                key={member.id}
                member={member}
                />
              ))}

              <div className={styles["statsCard"]}>
                <h4>파트별 통계</h4>
                <div className={styles["statsGrid"]}>
                  <div className={styles["statItem"]}>
                    <div className={styles["statValue"]}>
                      {frontendCount}
                    </div>
                    <span>Frontend</span>
                  </div>
                  <div className={styles["statItem"]}>
                    <div className={styles["statValue"]}>{backendCount}</div>
                    <span>Backend</span>
                  </div>
                  <div className={styles["statItem"]}>
                    <div className={styles["statValue"]}>{designCount}</div>
                    <span>Design</span>
                  </div>
                  <div className={styles["statItem"]}>
                    <div className={styles["statValue"]}>{members.length}</div>
                    <span>전체</span>
                  </div>
                </div>
              </div>

            </aside>

            <section className={styles.memberList}>
              {visibleMembers
              .filter((m) => !m.isMe)
              .map((member) => (
                <SummaryCard
                key={member.id}
                member={member}
                />
              ))}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
