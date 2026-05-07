import styles from "./Page.module.css";
import {members} from "./script.js";
import { useState, useEffect } from "react";

export default function Week3Page() {
  const [count_lion, setCountLion] = useState(9);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  
    useEffect(() => {
      if (!selected) return;
      const handleEsc = (e) => {
        if (e.key === "Escape") setSelected(null);
      };
      window.addEventListener("keydown", handleEsc);
      const original = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleEsc);
        document.documentElement.style.overflow = original;
      };
    }, [selected]);

  return (
    <div className={styles["week-page"]}>
      <h2>3주차</h2>
      <div>
        <button className={styles["add-button"]}
        onClick={() => setShowAdd(true)}>
          아기 사자 추가
        </button>

        <button className={styles["remove-button"]}
        onClick={() => setCountLion(count_lion - 1)}>
          마지막 아기 사자 제거
        </button>
        <span className={styles["count_lion"]}>총 {count_lion}명</span>
      </div>

      <div className={styles["grid-container"]}>
        {members.map((members) => (
          <div onClick={() => setSelected(members)} className={styles["main_profile"]}>
            <p className={styles["badge"]}>
              <span className={styles["badge_space"]}>{members.badge}</span>
            </p>
            <img className={styles["profile_image"]} src={members.image} />
            <h2 className={styles["name"]}>{members.name}</h2>
            <b className={styles["blue_rule"]}>{members.part}</b>
            <p className={styles["line_introduce"]}>{members.intro}</p>
          </div>
        ))}
      </div>

      {/* 아기 사자 추가 모달 */}
      {showAdd && (
        <div className={styles["push_lion"]} onClick={() => setShowAdd(false)}>
          <div className={styles["push_lion_content"]} onClick={(e) => e.stopPropagation()}>
            <table className={styles["push_lion_table"]}>
              <tr>
                <td><p>이름</p>
                  <input type="text" className={styles["input_name"]} 
                  placeholder="예: 홍아기사자"/>
                </td>

                <td><p>파트</p>
                  <select size={1}>
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="PM">PM</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td><p>관심기술 (쉼표로 구분)</p>
                <input type="text" className={styles["input_skills"]}
                placeholder="예: JavaScript, React, HTML/CSS"/></td>
              </tr>

              <tr>
                <td><p>한 줄 소개(요약 카드)</p>
                <input type="text" className={styles["input_last"]}
                placeholder="예: 3주차 DOM 조작 연습 중"/></td>
              </tr>

              <tr>
                <td><p>자기소개 (상세 카드)</p>
                <input type="text" className={styles["input_introduce"]}
                placeholder="예: HTML/CSS로 구조를 만들고, JS로 데이터를 바꾸면 화면이 바뀌는 경험을 하고 있습니다."/></td>
              </tr>

              <tr>
                <td><p>Email</p>
                <input type="text" className={styles["input_email"]}
                placeholder="예: lion@example.com"/></td>
                <td><p>Phone</p>
                <input type="text" className={styles["input_phone"]}
                placeholder="예: 010-1234-5678"/></td>
              </tr>

              <tr>
                <td><p>Website</p>
                <input type="text" className={styles["input_website"]}
                placeholder="예: https://www.example.com"/></td>
              </tr>

              <tr>
                <td><p>한 마디</p>
                <input type="text" className={styles["input_last"]}
                placeholder="예: 데이터 바꾸면 화면도 바뀐다!"/></td>
              </tr>


            </table>
            <button className={styles["push_add_button"]} onClick={() => { setCountLion(count_lion + 1); setShowAdd(false); }}>추가</button>
            <button className={styles["push_cancel_button"]} onClick={() => setShowAdd(false)}>취소</button>

          </div>
        </div>
      )}

      {/* 자기소개 모달 */}
      {selected && (
        <div className={styles["modal_overlay"]}
        onClick={() => setSelected(null)}>
          <div className={styles["modal_content"]}
          onClick={(e) => e.stopPropagation()}>

            <h2 className={styles["name"]}>{selected.name}</h2>
            <b className={styles["blue_rule"]}>{selected.part}</b>
            <p className={styles["join_club"]}>{selected.club}</p>

            <hr className={styles["modal_divider"]} />

            {!selected.contact && !selected.skills && !selected.last ? (
              <p className={styles["introduce_myself"]}>아직 준비 중입니다.</p>
            ) : (
              <>

            <h3 className={styles["introduce_title"]}>자기소개</h3>
            {selected.introduce.map((text, i) => (
              <p key={i} className={styles["introduce_myself"]}>{text}</p>
            ))}

            {(selected.contact.email || selected.contact.phone || selected.contact.website) && (
              <>
                <h3 className={styles["introduce_title"]}>연락처</h3>
                <ul>
                  {selected.contact.email && <li className={styles["list_style"]}>Email: {selected.contact.email}</li>}
                  {selected.contact.phone && <li className={styles["list_style"]}>Phone: {selected.contact.phone}</li>}
                  {selected.contact.website && (
                    <li className={styles["list_style"]}>Website: <a href={selected.contact.website.url}>{selected.contact.website.label}</a></li>
                  )}
                </ul>
              </>
            )}

            {selected.skills && (
              <>
                <h3 className={styles["introduce_title"]}>관심 기술</h3>
                <ul>
                  {selected.skills.map((skill, i) => (
                    <li key={i} className={styles["list_style"]}>{skill}</li>
                  ))}
                </ul>
              </>
            )}

            {selected.last && (
              <>
                <h3 className={styles["introduce_title"]}>한 마디</h3>
                <p className={styles["introduce_last"]}>{selected.last}</p>
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