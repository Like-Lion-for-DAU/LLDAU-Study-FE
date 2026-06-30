import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./Page.module.css";
import { members } from "./members";

const API_URL = "https://randomuser.me/api/?nat=us,gb,ca,au,nz&results=";
const TIMEOUT_MS = 5000;

const roles = ["Frontend", "Backend", "Design"];
const badges = ["React", "JavaScript", "Node.js", "Figma", "CSS Grid", "GraphQL"];

const EMPTY_FORM = {
  name: "",
  role: "Frontend",
  badge: "",
  intro: "",
  description: "",
  email: "",
  phone: "",
  website: "",
  image: "",
  comment: "",
};

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function makeLocalMember(member, order) {
  return {
    id: "local-" + order + "-" + member.name,
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
    createdAt: order,
  };
}

function makeRandomMember(user, order) {
  const role = getRandomItem(roles);
  const badge = getRandomItem(badges);

  return {
    id: user.login.uuid,
    name: user.name.first + " " + user.name.last,
    role: role,
    badge: badge,
    intro: role + " · " + user.location.country + " " + user.location.city + "에서 합류했어요.",
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
    comment: "데이터가 바뀌면 화면도 바뀜",
    club: "LION TRACK",
    isMe: false,
    createdAt: order,
  };
}

function userToFormData(user) {
  const role = getRandomItem(roles);
  const badge = getRandomItem(badges);

  return {
    name: user.name.first + " " + user.name.last,
    role: role,
    badge: badge,
    intro: role + " · " + user.location.country + " " + user.location.city + "에서 합류했어요.",
    description:
      user.name.first +
      "는 " +
      role +
      " 파트에 관심이 있으며, " +
      badge +
      "를 배우고 있습니다.",
    email: user.email,
    phone: user.phone,
    website: "https://example.com",
    image: user.picture.large,
    comment: "데이터가 바뀌면 화면도 바뀜",
  };
}

export default function Week6Page() {
  const [searchParams, setSearchParams] = useSearchParams();

  const nextOrderRef = useRef(0);
  const nextCustomIdRef = useRef(0);
  const latestControllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);
  const lastRequestRef = useRef(null);
  const fillControllerRef = useRef(null);
  const fillRequestIdRef = useRef(0);
  const statusResetTimerRef = useRef(null);

  const makeNextOrder = () => {
    const order = nextOrderRef.current;
    nextOrderRef.current += 1;
    return order;
  };

  const makeNextCustomId = () => {
    const id = "custom-" + nextCustomIdRef.current;
    nextCustomIdRef.current += 1;
    return id;
  };

  const resetStatusLater = () => {
    if (statusResetTimerRef.current) {
      clearTimeout(statusResetTimerRef.current);
    }

    statusResetTimerRef.current = setTimeout(() => {
      setStatusText("준비 완료");
    }, 2000);
  };

  const [memberList, setMemberList] = useState(() =>
    members.map((member) => makeLocalMember(member, makeNextOrder()))
  );

  const [showForm, setShowForm] = useState(false);

  const partFilter = searchParams.get("part") || "ALL";
  const sortType = searchParams.get("sort") || "latest";
  const searchText = searchParams.get("q") || "";

  const [statusText, setStatusText] = useState("준비 완료");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isFilling, setIsFilling] = useState(false);
  const [fillError, setFillError] = useState("");

  const updateUrlOption = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (key === "part") {
      if (value === "ALL") {
        nextParams.delete("part");
      } else {
        nextParams.set("part", value);
      }
    }

    if (key === "sort") {
      if (value === "latest") {
        nextParams.delete("sort");
      } else {
        nextParams.set("sort", value);
      }
    }

    if (key === "q") {
      if (value.trim() === "") {
        nextParams.delete("q");
      } else {
        nextParams.set("q", value);
      }
    }

    setSearchParams(nextParams);
  };

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

    result.sort((a, b) => {
      if (a.isMe !== b.isMe) {
        return a.isMe ? -1 : 1;
      }

      if (sortType === "name") {
        return a.name.localeCompare(b.name);
      }

      return b.createdAt - a.createdAt;
    });

    return result;
  }, [memberList, partFilter, sortType, searchText]);

  const handleInput = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const fetchRandomMembers = (count, mode, preservedCards = []) => {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    lastRequestRef.current = () => fetchRandomMembers(count, mode, preservedCards);

    if (latestControllerRef.current) {
      latestControllerRef.current.abort();
    }

    const controller = new AbortController();
    latestControllerRef.current = controller;

    let timedOut = false;

    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    setIsLoading(true);
    setHasError(false);
    setStatusText("불러오는 중...");

    fetch(API_URL + count, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }

        return res.json();
      })
      .then((data) => {
        if (requestId !== latestRequestIdRef.current) return;

        const randomMembers = data.results.map((user) =>
          makeRandomMember(user, makeNextOrder())
        );

        if (mode === "replace") {
          setMemberList([...preservedCards, ...randomMembers]);
        } else {
          setMemberList((prev) => [...prev, ...randomMembers]);
        }

        setStatusText("완료!");
        resetStatusLater();
      })
      .catch((error) => {
        if (requestId !== latestRequestIdRef.current) return;

        if (error.name === "AbortError" && timedOut) {
          setHasError(true);
          setStatusText("불러오기 실패: 시간 초과");
          return;
        }

        if (error.name === "AbortError") return;

        console.error("Fetch error:", error);
        setHasError(true);
        setStatusText("불러오기 실패: 잠시 후 다시 시도해주세요.");
      })
      .finally(() => {
        clearTimeout(timeoutId);

        if (requestId !== latestRequestIdRef.current) return;

        setIsLoading(false);
      });
  };

  const handleRefreshAll = () => {
    const myCards = memberList.filter((member) => member.isMe);
    const fetchCount = memberList.length - myCards.length;

    if (fetchCount <= 0) {
      setStatusText("새로고침할 랜덤 멤버가 없습니다.");
      resetStatusLater();
      return;
    }

    fetchRandomMembers(fetchCount, "replace", myCards);
  };

  const fillRandomForm = () => {
    const requestId = fillRequestIdRef.current + 1;
    fillRequestIdRef.current = requestId;

    if (fillControllerRef.current) {
      fillControllerRef.current.abort();
    }

    const controller = new AbortController();
    fillControllerRef.current = controller;

    let timedOut = false;

    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    setIsFilling(true);
    setFillError("");

    fetch(API_URL + 1, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }

        return res.json();
      })
      .then((data) => {
        if (requestId !== fillRequestIdRef.current) return;

        setFormData(userToFormData(data.results[0]));
      })
      .catch((error) => {
        if (requestId !== fillRequestIdRef.current) return;

        if (error.name === "AbortError" && timedOut) {
          setFillError("랜덤 값 불러오기 실패: 시간 초과");
          return;
        }

        if (error.name === "AbortError") return;

        console.error("Fill form error:", error);
        setFillError("랜덤 값 불러오기 실패: 잠시 후 다시 시도해주세요.");
      })
      .finally(() => {
        clearTimeout(timeoutId);

        if (requestId !== fillRequestIdRef.current) return;

        setIsFilling(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const customId = makeNextCustomId();

    const imageUrl =
      formData.image.trim() ||
      "https://picsum.photos/seed/" + customId + "/400/300";

    const newMember = {
      id: customId,
      name: formData.name.trim(),
      role: formData.role,
      badge: formData.badge.trim(),
      intro: formData.intro.trim(),
      description: formData.description.trim(),
      image: imageUrl,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      website: formData.website.trim(),
      comment: formData.comment.trim(),
      club: "LION TRACK",
      isMe: false,
      createdAt: makeNextOrder(),
    };

    setMemberList((prev) => [...prev, newMember]);
    setFormData(EMPTY_FORM);
    setShowForm(false);
  };

  const deleteLastMember = () => {
    setMemberList((prev) => prev.slice(0, -1));
  };

  const retryRequest = () => {
    if (lastRequestRef.current) {
      lastRequestRef.current();
    }
  };

  const handleImageError = (e, member) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://picsum.photos/seed/" + member.id + "/400/300";
  };

  useEffect(() => {
    return () => {
      if (latestControllerRef.current) {
        latestControllerRef.current.abort();
      }

      if (fillControllerRef.current) {
        fillControllerRef.current.abort();
      }

      if (statusResetTimerRef.current) {
        clearTimeout(statusResetTimerRef.current);
      }
    };
  }, []);

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
            onClick={handleRefreshAll}
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
              onChange={(e) => updateUrlOption("part", e.target.value)}
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
              onChange={(e) => updateUrlOption("sort", e.target.value)}
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
              onChange={(e) => updateUrlOption("q", e.target.value)}
            />
          </label>
        </div>
      </div>

      {showForm && (
        <form className={styles.formBox} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            name="name"
            required
            placeholder="이름"
            value={formData.name}
            onChange={handleInput("name")}
          />

          <select
            className={styles.select}
            name="role"
            value={formData.role}
            onChange={handleInput("role")}
          >
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Design">Design</option>
          </select>

          <input
            className={styles.input}
            name="badge"
            required
            placeholder="관심 기술"
            value={formData.badge}
            onChange={handleInput("badge")}
          />

          <input
            className={styles.input}
            name="intro"
            required
            placeholder="한 줄 소개"
            value={formData.intro}
            onChange={handleInput("intro")}
          />

          <textarea
            className={styles.textarea}
            name="description"
            required
            placeholder="자기소개"
            value={formData.description}
            onChange={handleInput("description")}
          />

          <input
            className={styles.input}
            name="email"
            type="email"
            required
            placeholder="Email"
            value={formData.email}
            onChange={handleInput("email")}
          />

          <input
            className={styles.input}
            name="phone"
            type="tel"
            required
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInput("phone")}
          />

          <input
            className={styles.input}
            name="website"
            type="url"
            required
            placeholder="Website"
            value={formData.website}
            onChange={handleInput("website")}
          />

          <input
            className={styles.input}
            name="image"
            type="url"
            placeholder="이미지 URL"
            value={formData.image}
            onChange={handleInput("image")}
          />

          <input
            className={styles.input}
            name="comment"
            required
            placeholder="한 마디"
            value={formData.comment}
            onChange={handleInput("comment")}
          />

          <div className={styles.formButtons}>
            <button
              className={styles.button}
              type="button"
              disabled={isFilling}
              onClick={fillRandomForm}
            >
              {isFilling ? "불러오는 중..." : "랜덤 값 채우기"}
            </button>

            {fillError && <span className={styles.errorMsg}>{fillError}</span>}

            <button className={styles.button} type="submit">
              추가하기
            </button>

            <button
              className={styles.button}
              type="button"
              onClick={() => {
                setFormData(EMPTY_FORM);
                setShowForm(false);
              }}
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
                onError={(e) => handleImageError(e, member)}
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