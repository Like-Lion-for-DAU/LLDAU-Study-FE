import { useMemo, useRef, useState } from "react";
import styles from "./Page.module.css";
import { members } from "./members";

const API_URL = "https://randomuser.me/api/?nat=us,gb,ca,au,nz&results=";

const roles = ["Frontend", "Backend", "Design"];
const badges = ["React", "JavaScript", "Node.js", "Figma", "CSS Grid", "GraphQL"];

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function makeLocalMember(member, index) {
  return {
    id: "local-" + index + "-" + member.name,
    name: member.name,
    role: member.role,
    badge: member.badge,
    intro: member.intro,
    description: member.description || member.intro,
    image: member.image,
    email: member.email,
    phone: member.phone,
    website: member.website,
    comment: member.comment,
    club: member.club || "LION TRACK",
    isMe: member.isMe || false,
    createdAt: index,
  };
}

function makeRandomMember(user, index) {
  const role = getRandomItem(roles);
  const badge = getRandomItem(badges);

  return {
    id: user.login.uuid,
    name: user.name.first + " " + user.name.last,
    role: role,
    badge: badge,
    intro: role + " · " + user.location.country + " " + user.location.city + "에서 합류했어요!",
    description:
      user.name.first +
      "는 " +
      role +
      " 파트에 관심이 있으며, " +
      badge +
      "를 배우고 있습니다.",
    image: user.picture.large,
    email: user.email,
    phone: user.phone,
    website: "https://example.com",
    comment: "데이터가 바뀌면 화면도 바뀐다!",
    club: "LION TRACK",
    isMe: false,
    createdAt: Date.now() + index,
  };
}

export default function Week3Page() {
  const [memberList, setMemberList] = useState(
    members.map((member, index) => makeLocalMember(member, index))
  );

  const [showForm, setShowForm] = useState(false);
  const [partFilter, setPartFilter] = useState("ALL");
  const [sortType, setSortType] = useState("latest");
  const [searchText, setSearchText] = useState("");
  const [statusText, setStatusText] = useState("준비 완료");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const formRef = useRef(null);
  const lastRequestRef = useRef(null);

  const visibleMembers = useMemo(() => {
    let result = [...memberList];

    if (partFilter !== "ALL") {
      result = result.filter((member) => member.role === partFilter);
    }

    if (searchText.trim() !== "") {
      result = result.filter((member) =>
        member.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (sortType === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortType === "latest") {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [memberList, partFilter, sortType, searchText]);

  const fetchRandomMembers = (count, mode) => {
    lastRequestRef.current = () => fetchRandomMembers(count, mode);

    setIsLoading(true);
    setHasError(false);
    setStatusText("불러오는 중...");

    fetch(API_URL + count)
      .then((res) => {
        if (!res.ok) {
          throw new Error("요청 실패");
        }

        return res.json();
      })
      .then((data) => {
        const randomMembers = data.results.map((user, index) =>
          makeRandomMember(user, index)
        );

        if (mode === "replace") {
          setMemberList(randomMembers);
        } else {
          setMemberList((prev) => [...prev, ...randomMembers]);
        }

        setStatusText("완료!");
      })
      .catch((error) => {
        setHasError(true);
        setStatusText("불러오기 실패: " + error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fillRandomForm = () => {
    setIsLoading(true);
    setHasError(false);
    setStatusText("불러오는 중...");

    fetch(API_URL + 1)
      .then((res) => {
        if (!res.ok) {
          throw new Error("요청 실패");
        }

        return res.json();
      })
      .then((data) => {
        const randomMember = makeRandomMember(data.results[0], 0);
        const form = formRef.current;

        form.name.value = randomMember.name;
        form.role.value = randomMember.role;
        form.badge.value = randomMember.badge;
        form.intro.value = randomMember.intro;
        form.description.value = randomMember.description;
        form.email.value = randomMember.email;
        form.phone.value = randomMember.phone;
        form.website.value = randomMember.website;
        form.comment.value = randomMember.comment;
        form.image.value = randomMember.image;

        setStatusText("랜덤 값 채우기 완료!");
      })
      .catch((error) => {
        setHasError(true);
        setStatusText("불러오기 실패: " + error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData(e.target);

    const newMember = {
      id: "custom-" + Date.now(),
      name: fd.get("name").trim(),
      role: fd.get("role"),
      badge: fd.get("badge").trim(),
      intro: fd.get("intro").trim(),
      description: fd.get("description").trim(),
      image: fd.get("image").trim() || "https://picsum.photos/seed/" + Date.now() + "/400/300",
      email: fd.get("email").trim(),
      phone: fd.get("phone").trim(),
      website: fd.get("website").trim(),
      comment: fd.get("comment").trim(),
      club: "LION TRACK",
      isMe: false,
      createdAt: Date.now(),
    };

    setMemberList((prev) => [...prev, newMember]);
    setShowForm(false);
    e.target.reset();
  };

  const deleteLastMember = () => {
    setMemberList((prev) => prev.slice(0, -1));
  };

  const retryRequest = () => {
    if (lastRequestRef.current) {
      lastRequestRef.current();
    }
  };

  return (
    <div className={styles.weekPage}>
      <div className={styles.controlArea}>
        <div className={styles.controlRow}>
          <button className={styles.button} onClick={() => setShowForm(true)}>
            아기 사자 추가
          </button>

          <button className={styles.button} onClick={deleteLastMember}>
            마지막 아기 사자 삭제
          </button>

          <strong className={styles.totalText}>총 {memberList.length}명</strong>
        </div>

        <div className={styles.controlRow}>
          <button
            className={styles.button}
            disabled={isLoading}
            onClick={() => fetchRandomMembers(1, "add")}
          >
            랜덤 1명 추가
          </button>

          <button
            className={styles.button}
            disabled={isLoading}
            onClick={() => fetchRandomMembers(5, "add")}
          >
            랜덤 5명 추가
          </button>

          <button
            className={styles.button}
            disabled={isLoading}
            onClick={() => fetchRandomMembers(9, "replace")}
          >
            전체 새로고침
          </button>

          <span className={styles.statusText}>{statusText}</span>

          {hasError && (
            <button className={styles.button} onClick={retryRequest}>
              재시도
            </button>
          )}
        </div>

        <div className={styles.controlRow}>
          <label className={styles.label}>
            파트
            <select
              className={styles.select}
              value={partFilter}
              onChange={(e) => setPartFilter(e.target.value)}
            >
              <option value="ALL">전체</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Design">Design</option>
            </select>
          </label>

          <label className={styles.label}>
            정렬
            <select
              className={styles.select}
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="latest">최신추가순</option>
              <option value="name">이름순</option>
            </select>
          </label>

          <label className={styles.label}>
            검색
            <input
              className={styles.input}
              type="text"
              placeholder="이름으로 검색"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </label>
        </div>
      </div>

      {showForm && (
        <form ref={formRef} className={styles.formBox} onSubmit={handleSubmit}>
          <input className={styles.input} name="name" required placeholder="이름" />

          <select className={styles.select} name="role">
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
          </select>

          <input className={styles.input} name="badge" required placeholder="관심 기술" />
          <input className={styles.input} name="intro" required placeholder="한 줄 소개" />

          <textarea
            className={styles.textarea}
            name="description"
            required
            placeholder="자기소개"
          />

          <input className={styles.input} name="email" type="email" required placeholder="Email" />
          <input className={styles.input} name="phone" required placeholder="Phone" />
          <input className={styles.input} name="website" type="url" required placeholder="Website" />
          <input className={styles.input} name="image" type="url" placeholder="이미지 URL" />
          <input className={styles.input} name="comment" required placeholder="한 마디" />

          <div className={styles.formButtons}>
            <button
              className={styles.button}
              type="button"
              disabled={isLoading}
              onClick={fillRandomForm}
            >
              랜덤 값 채우기
            </button>

            <button className={styles.button} type="submit">
              추가하기
            </button>

            <button
              className={styles.button}
              type="button"
              onClick={() => setShowForm(false)}
            >
              취소
            </button>
          </div>
        </form>
      )}

      <div className={styles.cardContainer}>
        {visibleMembers.length === 0 ? (
          <p className={styles.emptyText}>조건에 맞는 아기 사자가 없습니다.</p>
        ) : (
          visibleMembers.map((member) => (
            <article
              key={member.id}
              className={`${styles.card} ${member.isMe ? styles.mainCard : ""}`}
            >
              <img
                className={styles.cardImage}
                src={member.image}
                alt={`${member.name} 프로필`}
              />

              <span className={styles.badge}>{member.badge}</span>

              <div className={styles.cardContent}>
                <h3 className={styles.name}>{member.name}</h3>
                <p className={styles.role}>{member.role}</p>
                <p className={styles.introduce}>{member.intro}</p>
              </div>
            </article>
          ))
        )}
      </div>

      <section className={styles.detailSection}>
        <h2 className={styles.detailTitle}>상세 자기소개</h2>

        <div className={styles.detailList}>
          {visibleMembers.length === 0 ? (
            <p className={styles.emptyText}>표시할 상세 정보가 없습니다.</p>
          ) : (
            visibleMembers.map((member) => (
              <article className={styles.detailCard} key={member.id + "-detail"}>
                <h3>{member.name}</h3>
                <p>파트 : {member.role}</p>
                <p>관심 기술 : {member.badge}</p>
                <p>자기소개 : {member.description}</p>
                <p>Email : {member.email}</p>
                <p>Phone : {member.phone}</p>
                {member.website && <p>Website : {member.website}</p>}
                <p>한 마디 : "{member.comment}"</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}