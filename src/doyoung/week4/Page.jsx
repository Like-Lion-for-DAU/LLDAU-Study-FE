import styles from "./Page.module.css";
import { members as initialMembers} from "./members";
import { useEffect, useRef, useState } from "react";

function SummaryCard({ member, onClick }) {
  return (
    <div
      className={`${styles["card"]} ${member.isMe ? styles["my-card"] : ""}`} onClick={onClick}
      >
      <img src={member.image} alt={`${member.name} 프로필`} className={styles["photo"]}/>
      <h3>{member.name}</h3>
      <span className={styles["frontend"]}>{member.role}</span>
      <p>{member.intro}</p>
    </div>
  );
}

function ContactList({contact}) {
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

function DetailCard({ 
  member,
  isFocused,
  innerRef,
}) {
  return (
    <div ref = {innerRef} className={`${styles["detailcard"]} ${isFocused ? styles["isFocused"] : ""}`}>
      <h3>{member.name}</h3>
      <span className={styles["frontend"]}>{member.role}</span>
      <p className={styles["dsis"]}>동아리명 : {member.club}</p>

      <section className={styles["section"]}>
        <h4>자기소개</h4>
        {member.bio.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </section>

      <section className={styles["section"]}>
        <h4>연락처</h4>
        <ContactList contact={member.contact}/>
      </section>

      <section className={styles["section"]}>
        <h4>관심 기술</h4>
        <ul>
          {member.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </section>

      <section className={styles["section"]}>
        <h4>한 마디</h4>
        <p>{member.tell}</p>
      </section>
    </div>
  );
}

export default function Week4Page() {

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

  const [lastRequest, setLastRequest] =
  useState(null);

  const latestControllRef = useRef(null);

  const latestRequestIdRef = useRef(0);

  const [sortType, setSortType] =
  useState("recent");

  const controller = new AbortController();

  const TIMEOUT_MS = 5000;
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  const fetchRandomUsers = async (count, type = "add") => {
    const requestId = ++latestRequestIdRef.current;

    if(latestControllRef.current) latestControllRef.current.abort();
    const controller = new AbortController();
    latestControllRef.current = controller;

    let timedOut = false;

    const timeOutId = setTimeout(() => {
      timedOut = true;
      controller = true;
      controller.abort();
    }, 5000);

    try {
      setFetchStatus("loading");
      setStatusMessage("");

      await new Promise((resolve) =>
      setTimeout(resolve, 5000));

      const response = await fetch(`https://randomuser.me/api/?results=${count}&nat=us,gb,ca,au,nz`, {signal: controller.signal});
      clearTimeout(timeoutId);
      if(requestId !== latestRequestIdRef.current) return;
      if (!response.ok) {
          throw new Error("API 요청 실패");
      }
      const data = await response.json();
      const parts = ["Frontend", "Backend", "Design",];
      const newMember = data.results.map(
        (user) => ({
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
          tell: "잘 부탁드립니다!",
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


      setTimeout(() => {
        setFetchStatus("idle");
      }, 2000);
    }catch (error) {
      clearTimeout(timeoutId);
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
    } catch (error) {
      console.error(error);
      alert("랜덤 데이터를 불러오지 못했습니다.");
    }
  }

  const [search, setSearch] =
  useState("")

  const [members, setMembers] =
  useState(initialMembers);

  const [showForm, setShowForm] =
  useState(false);

  const [partFilter, setPartFilter] =
  useState("ALL");

  const [focusedId, setFocusedId] =
  useState(null);

  const detailRefs = useRef({});

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
    setMembers((prev) =>
    prev.slice(0, -1));
  }

  function handleCardClick(name) {
    detailRefs.current[name]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setFocusedId(name);
    setTimeout(() =>{
      setFocusedId(null);
    }, 1000);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const newMember = {
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
      <h2>4주차</h2>

      <section>
        <div className={styles["controlInner"]}>
          <button
          type="button"
          className={styles["btnIcon"]}
          onClick={() => setShowForm(true)}>
            아기사자추가
          </button>
          <button
          type="button"
          className={styles["btnIcon"]}
          onClick={handleRemoveLast}>
            마지막 아기 사자 삭제
          </button>
          <span
          className={styles["count"]}>
            총 {visibleMembers.length}명
          </span>
          <button
          type="button"
          className={styles["btnIcon"]}
          onClick={() => fetchRandomUsers(1, "add")}>
            랜덤 1명 추가
          </button>
          <button
          type="button"
          className={styles["btnIcon"]}
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
          <div>
            <span className = {styles["text"]}>파트</span>
            <select
            value={partFilter}
            onChange={(e) => setPartFilter(e.target.value)}
            className={styles["btnIcon"]}>
              <option value="ALL">전체</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Design">Design</option>
            </select>
          </div>

          <div
          className={styles["txet"]}>
            {fetchStatus === "idle" && (
              <p className={styles["text"]}>준비 완료</p>
            )}

            {fetchStatus === "loading" && (
              <p className={styles["text"]}>불러오는 중...</p>
            )}

            {fetchStatus === "success" && (
              <p className={styles["text"]}>완료!</p>
            )}

            {fetchStatus === "error" && (
              <div>
                <p className={styles["text"]}>
                  불러오기 실패 : 
                  {statusMessage}
                </p>

                <button
                className={styles["btnIcon"]}
                onClick={handleRetry}>
                  재시도
                </button>
              </div>
            )}
          </div>
          
          <div>
            <span className={styles["text"]}>정렬</span>
            <select
            value={sortType}
            className={styles["btnIcon"]}
            onChange={(e) =>
              setSortType(e.target.value)
            }>
              <option value="recent">최신추가순</option>
              <option value="name">이름순</option>
            </select>
          </div>
          <div>   
            <span className={styles["text"]}>검색</span>
            <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles["nametext"]}
            placeholder="이름으로 검색"/>
          </div>
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
                type="text"
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
                type="text"
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
        <section className={styles["cardpack"]}>
          {visibleMembers.map((member) => (
            <SummaryCard 
            key={member.name}
            member={member}
            onClick={() => handleCardClick(member.name)} />
          ))}
        </section>
      )}
      
      <section className={styles["detailcardpack"]}>
        {visibleMembers.map((member) => (
          <DetailCard
          key={member.name}
          member={member}
          isFocused={focusedId === member.name}
          innerRef={(el) => {
            if (el) {
              detailRefs.current[
                member.name
              ] = el;
            }
          }}/>
          ))}
      </section>
    </div>
  );
}
