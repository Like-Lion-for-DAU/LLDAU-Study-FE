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
    part :"",
    skills :"",
    intro :"",
    detail :"",
    email : "",
    phone :"",
    web :"",
    tell :"",
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

    setTimeout(() =>{
      setFocusedId(null);
    }, 1000);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const newMember = {
      name : memberInput.name,
      part : memberInput.part,
      intro : memberInput.intro,
      club : "DSIS",
      image: "/lion.png",
      bio : [memberInput.detail],
      skills : memberInput.skills
      .split(",")
      .map((skill) => skill.trim()),
      motto: memberInput.tell,
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
      part: "",
      skills: "",
      intro: "",
      detail: "",
      email: "",
      phone: "",
      web: "",
      tell: "",
    });
    setShowForm(false);
  }

  const visibleMembers = members.filter(
    (member) =>
      partFilter === "ALL" || member.role === partFilter
  );

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
          {/* <button
          type="button"
          className={styles["btnIcon"]}
          onClick={() => fetchnewData(1)}>
            랜덤 1명 추가
          </button>
          <button
          type="button"
          className={styles["btnIcon"]}
          onClick={() => fetchnewData(5)}>
            랜덤 5명 추가
          </button>
          <button
          type="button"
          className={styles["btonIcon"]}
          onClick={() => doFetch({ type : "refresh" })}>
            전체 새로고침
          </button> */}
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
          
          {/* <div>
            <span>정렬</span>
            <select
            value={cardArray}
            className={styles["selectBtn"]}>
              <option value="recent">최신추가순</option>
              <option value="nameArray">이름순</option>
            </select>
          </div>
          <div>
            <span>검색</span>
            <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles["search"]}
            placeholder="이름으로 검색"/>
          </div> */}
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
                onChange={(event) =>
                  handleInputChange("name", event)
                }
                placeholder="예: 홍아기사자"
                required/>
              </div>
              <div
              className={styles["controlInner"]}>
                <label
                htmlFor="part"
                className={styles["text"]}>
                  파트
                </label>
                <select
                id="part"
                className={styles["part"]}
                value={memberInput.part}
                onChange={(e) =>
                  handleInputChange("part", event)
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
                <lable
                htmlFor="detail"
                className={styles["text"]}>
                  자기소개 (상세 카드)
                </lable>
                <textarea
                id="detail"
                rows="5"
                cols="30"
                value={memberInput.detail}
                className={styles["form"]}
                onChange={(event) =>
                  handleInputChange("detail", event)
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
                replaceholder="예: lion@example.com"
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
                type="web"
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
                htmlFor="tell"
                className={styles["text"]}>
                  한마디
                </label>
                <input
                id="tell"
                type="text"
                className={styles["form"]}
                value={memberInput.tell}
                onChange={(event) =>
                  handleInputChange("tell", event)
                }
                placeholder="예: 데이터 바꾸면 화면도 바뀐다!"
                required/>
              </div>
              <div
              className={styles["controlOut"]}>
                <button
                type="button"
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
        {members.map((member) => (
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
