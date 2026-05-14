import styles from "./Page.module.css";
import { members as initialMembers, usePageScrollDown, useFormData } from "./script.js";
import { useState, useEffect } from "react";

export default function Week3Page() {
  const [memberList, setMemberList] = useState(initialMembers);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const { formData, handleInput, isFormValid, warn, warnFormat, reset } = useFormData();
  
    usePageScrollDown(selected, () => setSelected(null));
    usePageScrollDown(showAdd, () => setShowAdd(false));

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const skillList = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
    const newMember = {
      name: formData.name,
      part: formData.part,
      intro: formData.introduce,
      club: "DAU_DSIS",
      badge: skillList[0] || "신규",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2QuItPJLx65Rb2kqBsMRU7t3BmKc8jn98lw&s",
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

  return (
    <div className={styles["week-page"]}>
      <h2>3주차</h2>
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

      <div className={styles["gridContainer"]}>
        {memberList.map((member) => (
          <div onClick={() => setSelected(member)} className={styles["mainProfile"]}>
            <p className={styles["badge"]}>
              <span className={styles["badgeSpace"]}>{member.badge}</span>
            </p>
            <img className={styles["profileImage"]} src={member.image} />
            <h2 className={styles["name"]}>{member.name}</h2>
            <b className={styles["blueRule"]}>{member.part}</b>
            <p className={styles["lineIntroduce"]}>{member.intro}</p>
          </div>
        ))}
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
                <label htmlFor="introduce" className={styles["pushLabel"]}>한 줄 소개(요약 카드)</label>
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
                    <input id="email" type="text" className={styles["inputEmail"]}
                    placeholder="예: lion@example.com"
                    value={formData.email} onChange={handleInput("email")}/>
                    {warn("email") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                    {warnFormat("email") && <span className={styles["inputWarning"]}><b>!</b> '@' 가 포함되어야 합니다 <b>!</b></span>}
                  </div>
                </div>
                <div className={styles["field"]}>
                  <label htmlFor="phone" className={styles["pushLabel"]}>Phone</label>
                  <div className={styles["halfWidth"]}>
                    <input id="phone" type="text" className={styles["inputPhone"]}
                    placeholder="예: 010-1234-5678"
                    value={formData.phone} onChange={handleInput("phone")}/>
                    {warn("phone") && <span className={styles["inputWarning"]}><b>!</b> 입력란이 비어있습니다 <b>!</b></span>}
                    {warnFormat("phone") && <span className={styles["inputWarning"]}><b>!</b> 예시의 형식을 따라주세요 <b>!</b></span>}
                  </div>
                </div>
              </div>

              <div className={`${styles["pushLionRow"]} ${styles["fullWidth"]}`}>
                <label htmlFor="website" className={styles["pushLabel"]}>Website</label>
                  <input id="website" type="text" className={styles["inputLongtype"]}
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

              <button type="submit" className={styles["pushLionAddButton"]}
              disabled={!isFormValid}>추가</button>
              <button type="button" className={styles["pushLionCancelButton"]}
              onClick={() => setShowAdd(false)}>취소</button>

            </form>
            {/* 모든 입력란이 채워져야 활성화 */}
            

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
              <p key={i} className={styles["introduceMyself"]}>{text}</p>
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