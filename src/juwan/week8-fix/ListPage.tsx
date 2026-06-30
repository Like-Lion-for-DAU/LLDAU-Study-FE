import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  type SyntheticEvent,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./Page.module.css";
import { ROLES } from "./types";
import type {
  AddMemberForm,
  FetchMode,
  MemberItem,
  RandomUser,
  RandomUserResponse,
  Role,
} from "./types";

const API_URL = "https://randomuser.me/api/?nat=us,gb,ca,au,nz&results=";
const TIMEOUT_MS = 5000;

const EMPTY_FORM: AddMemberForm = {
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

function userToFormData(user: RandomUser): AddMemberForm {
  // role/badge는 폼 안에서만 사용. ROLES 안에서 고르므로 Role 유니온 보장.
  const role: Role = ROLES[Math.floor(Math.random() * ROLES.length)];
  return {
    name: `${user.name.first} ${user.name.last}`,
    role,
    badge: "React",
    intro: `${role} · ${user.location.country} ${user.location.city}에서 합류했어요.`,
    description: `${user.name.first}는 ${role} 파트에 관심이 있습니다.`,
    image: user.picture.large,
    email: user.email,
    phone: user.phone,
    website: "https://example.com",
    comment: "데이터가 바뀌면 화면도 바뀜",
  };
}

// week8 리뷰 1번: ListPage는 부모(App)에서 전달받은 상태와 핸들러를 그대로 사용.
// 멤버 상태와 fetch 로직은 부모에 있어서 DetailPage와 자동으로 동기화된다.
interface ListPageProps {
  memberList: MemberItem[];
  setMemberList: Dispatch<SetStateAction<MemberItem[]>>;
  statusText: string;
  isLoading: boolean;
  hasError: boolean;
  fetchRandomMembers: (
    count: number,
    mode: FetchMode,
    preservedCards?: MemberItem[]
  ) => void;
  retryRequest: () => void;
  deleteLastMember: () => void;
  makeNextCustomId: () => string;
  makeNextOrder: () => number;
}

export default function ListPage({
  memberList,
  setMemberList,
  statusText,
  isLoading,
  hasError,
  fetchRandomMembers,
  retryRequest,
  deleteLastMember,
  makeNextCustomId,
  makeNextOrder,
}: ListPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const partFilter = searchParams.get("part") ?? "ALL";
  const sortType = searchParams.get("sort") ?? "latest";
  const searchText = searchParams.get("q") ?? "";

  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<AddMemberForm>(EMPTY_FORM);

  // 랜덤 값 채우기 - 메인 fetch와 별개 controller로 분리 (race 차단)
  const [isFilling, setIsFilling] = useState<boolean>(false);
  const [fillError, setFillError] = useState<string>("");
  const fillControllerRef = useRef<AbortController | null>(null);
  const fillRequestIdRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      fillControllerRef.current?.abort();
    };
  }, []);

  // ESC로 폼 닫기
  useEffect(() => {
    if (!showForm) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowForm(false);
        setFillError("");
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showForm]);

  // 정렬/필터/검색 - 보기 옵션 URL 연동, 기본값은 URL에서 제외
  function updateQuery(key: "part" | "sort" | "q", value: string): void {
    const next = new URLSearchParams(searchParams);
    const isDefault =
      (key === "part" && value === "ALL") ||
      (key === "sort" && value === "latest") ||
      (key === "q" && value.trim() === "");
    if (isDefault) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  }

  const visibleMembers = useMemo<MemberItem[]>(() => {
    let result = [...memberList];

    if (partFilter !== "ALL") {
      result = result.filter((m) => m.role === partFilter);
    }

    if (searchText.trim() !== "") {
      const q = searchText.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      if (a.isMe !== b.isMe) return a.isMe ? -1 : 1;
      if (sortType === "name") return a.name.localeCompare(b.name);
      return b.createdAt - a.createdAt;
    });

    return result;
  }, [memberList, partFilter, sortType, searchText]);

  // 입력 핸들러 - keyof로 필드 이름을 좁히고, 모든 select/input/textarea 이벤트 허용
  type InputEvent = ChangeEvent<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
  const handleInput =
    (field: keyof AddMemberForm) =>
    (e: InputEvent): void => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  // 랜덤 값 채우기 - 자체 race 차단
  function fillRandomForm(): void {
    if (isFilling) return;

    const requestId = fillRequestIdRef.current + 1;
    fillRequestIdRef.current = requestId;

    fillControllerRef.current?.abort();
    const controller = new AbortController();
    fillControllerRef.current = controller;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    setIsFilling(true);
    setFillError("");

    fetch(`${API_URL}1`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((raw) => {
        const data = raw as RandomUserResponse;
        if (requestId !== fillRequestIdRef.current) return;
        setFormData(userToFormData(data.results[0]));
      })
      .catch((error: unknown) => {
        if (requestId !== fillRequestIdRef.current) return;
        if (!(error instanceof Error)) {
          setFillError("랜덤 값 불러오기 실패: 알 수 없는 오류");
          return;
        }
        if (error.name === "AbortError") {
          if (timedOut) setFillError("랜덤 값 불러오기 실패: 시간 초과");
          return;
        }
        console.error("Fill form error:", error);
        setFillError("랜덤 값 불러오기 실패: 잠시 후 다시 시도해주세요.");
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (requestId !== fillRequestIdRef.current) return;
        setIsFilling(false);
      });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const name = formData.name.trim();
    if (!name) return;

    const customId = makeNextCustomId();
    const imageUrl =
      formData.image.trim() || `https://picsum.photos/seed/${customId}/400/300`;

    const newMember: MemberItem = {
      id: customId,
      name,
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
    setFillError("");
  }

  function handleImageError(
    e: SyntheticEvent<HTMLImageElement>,
    member: MemberItem
  ): void {
    e.currentTarget.onerror = null;
    e.currentTarget.src = `https://picsum.photos/seed/${member.id}/400/300`;
  }

  // 카드 클릭 시 URL의 query string을 detail에도 그대로 전달 - 주완 원본의 좋은 패턴
  function getMemberLink(member: MemberItem): {
    pathname: string;
    search: string;
  } {
    const queryString = searchParams.toString();
    return {
      pathname: `lions/${member.id}`,
      search: queryString ? `?${queryString}` : "",
    };
  }

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
            onClick={() => {
              const myCards = memberList.filter((m) => m.isMe);
              const fetchCount = memberList.length - myCards.length;
              if (fetchCount <= 0) return;
              fetchRandomMembers(fetchCount, "replace", myCards);
            }}
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
              onChange={(e) => updateQuery("part", e.target.value)}
            >
              <option value="ALL">전체</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            정렬
            <select
              className={styles.select}
              value={sortType}
              onChange={(e) => updateQuery("sort", e.target.value)}
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
              onChange={(e) => updateQuery("q", e.target.value)}
            />
          </label>
        </div>
      </div>

      {showForm && (
        <form className={styles.formBox} onSubmit={handleSubmit}>
          {fillError && (
            <div className={styles.fillErrorRow}>
              <span className={styles.errorMsg}>{fillError}</span>
            </div>
          )}

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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, role: e.target.value as Role }))
            }
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
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
            <button className={styles.button} type="submit">
              추가하기
            </button>
            <button
              className={styles.button}
              type="button"
              onClick={() => {
                setFormData(EMPTY_FORM);
                setFillError("");
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
            <Link
              key={member.id}
              className={`${styles.card} ${member.isMe ? styles.mainCard : ""}`}
              to={getMemberLink(member)}
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
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
