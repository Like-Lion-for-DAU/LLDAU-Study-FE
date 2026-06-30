import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import styles from "./Page.module.css";
import {
  initialMembers,
  PARTS,
  SKILLS_BY_PART,
  ABOUT_PRESETS,
  QUOTE_PRESETS,
  DEFAULT_IMAGES,
} from "./lions";
import type { Member, Part, RandomUser } from "./types";

const TIMEOUT_MS = 5000;

const PART_COLOR: Record<Part, string> = {
  Frontend: "#3fb950",
  Backend: "#58a6ff",
  Design: "#bc8cff",
};

// ── UI 전용 타입 ──
type FetchStatus = "idle" | "loading" | "success" | "error";
type SortKey = "default" | "name" | "part";
type PartFilter = "all" | Part;
type DetailTab = "overview" | "skills" | "contact";

// 추가 폼은 모든 값이 문자열, skills는 쉼표 구분 문자열로 보관
interface MemberForm {
  name: string;
  part: Part | "";
  badge: string;
  intro: string;
  image: string;
  club: string;
  about: string;
  skills: string;
  email: string;
  phone: string;
  website: string;
  quote: string;
}

interface FetchContext {
  signal: AbortSignal;
  isLatest: () => boolean;
}
type FetchAction = (ctx: FetchContext) => Promise<void>;

const TABS: { key: DetailTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "skills", label: "Skills" },
  { key: "contact", label: "Contact" },
];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickSkills(part: Part): string[] {
  const pool = SKILLS_BY_PART[part] ?? [];
  const set = new Set<string>();
  while (set.size < Math.min(3, pool.length)) set.add(pickRandom(pool));
  return [...set];
}

function handleOf(m: Pick<Member, "name" | "email" | "website">): string {
  if (m.website?.includes("github.com/")) {
    return m.website.split("github.com/")[1].replace(/\/$/, "");
  }
  if (m.email) return m.email.split("@")[0];
  return m.name;
}

async function fetchRandomUsers(
  count: number,
  signal: AbortSignal
): Promise<RandomUser[]> {
  const url = `https://randomuser.me/api/?results=${count}&inc=name,email,phone,picture,login&noinfo`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: { results?: RandomUser[] } = await res.json();
  return data.results ?? [];
}

function mapApiUser(u: RandomUser, id: number): Member {
  const part = pickRandom(PARTS);
  const skills = pickSkills(part);
  return {
    id,
    name: `${u.name.first} ${u.name.last}`,
    part,
    badge: skills[0] ?? part,
    intro: `${part} 파트에서 함께 성장 중인 아기사자입니다.`,
    image: u.picture?.large ?? "",
    isMine: false,
    club: "LION TRACK",
    about: pickRandom(ABOUT_PRESETS),
    skills,
    email: u.email,
    phone: u.phone,
    website: u.login?.username ? `https://github.com/${u.login.username}` : "",
    quote: pickRandom(QUOTE_PRESETS),
  };
}

const EMPTY_FORM: MemberForm = {
  name: "", part: "", badge: "", intro: "", image: "", club: "",
  about: "", skills: "", email: "", phone: "", website: "", quote: "",
};

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function generatePixelGrass(seed: number): number[][] {
  const cols = 52, rows = 7;
  const grid: number[][] = Array.from({ length: cols }, () =>
    Array<number>(rows).fill(0)
  );
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const v = ((c * 7 + r) * 9301 + 49297 + seed) % 233280;
      grid[c][r] = v < 60000 ? 0 : v < 120000 ? 1 : v < 180000 ? 2 : 1;
    }
  }

  // 11×7 하트 픽셀 맵
  const HEART: number[][] = [
    [0,1,1,0,0,0,1,1,0,0,0],
    [1,1,1,1,0,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0],
  ];
  const startCol = Math.floor((cols - 11) / 2);
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 11; c++)
      if (HEART[r][c]) grid[startCol + c][r] = 4;
  return grid;
}

function fallbackImg(e: SyntheticEvent<HTMLImageElement>, id: number): void {
  e.currentTarget.onerror = null;
  e.currentTarget.src = `https://picsum.photos/seed/lion${id}/240/240`;
}

interface DetailModalProps {
  member: Member;
  following: boolean;
  onToggleFollow: (id: number) => void;
  onClose: () => void;
}

function DetailModal({ member, following, onToggleFollow, onClose }: DetailModalProps) {
  const [tab, setTab] = useState<DetailTab>("overview");
  const grass = useMemo(() => generatePixelGrass(hashSeed(String(member.id))), [member.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="닫기">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.749.749 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.749.749 0 1 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" /></svg>
        </button>

        <div className={styles.modalBody}>
          <aside className={styles.sidebar}>
            <div className={styles.avatar}>
              <div className={styles.avatarImg}>
                <img src={member.image} alt={`${member.name} 프로필 이미지`} onError={(e) => fallbackImg(e, member.id)} />
              </div>
            </div>

            <h1 className={styles.displayName}>{member.name}</h1>
            <p className={styles.username}>@{handleOf(member)}</p>
            {member.isMine && <span className={styles.mineTag}>It&apos;s you · 본인</span>}
            <p className={styles.sideBio}>{member.intro}</p>

            <span
              className={styles.partBadge}
              style={{ color: PART_COLOR[member.part], borderColor: (PART_COLOR[member.part] ?? "#30363d") + "55" }}
            >
              <span className={styles.partDot} style={{ background: PART_COLOR[member.part] }} />
              {member.part}
            </span>

            <button
              className={`${styles.followBtn} ${following ? styles.followBtnActive : ""}`}
              onClick={() => onToggleFollow(member.id)}
            >
              {following ? "Following" : "Follow"}
            </button>

            <div className={styles.sideMeta}>
              <div className={styles.metaRow}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" /><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" /></svg>
                <span>{member.club}</span>
              </div>
              <div className={styles.metaRow}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z" /></svg>
                <a href={`mailto:${member.email}`} className={styles.metaLink}>{member.email}</a>
              </div>
            </div>
          </aside>

          <main className={styles.content}>
            <div className={styles.tabs}>
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`${styles.tab} ${tab === key ? styles.tabActive : ""}`}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className={styles.tabContent}>
                <div className={styles.grassWrap}>
                  <div className={styles.grassHeader}>
                    <span className={styles.grassTitle}>
                      <strong>{member.name}</strong> contributions this year
                    </span>
                    <span className={styles.grassSub}>pixel art 🎮</span>
                  </div>
                  <div className={styles.grassScroll}>
                    <div className={styles.grassGrid}>
                      {grass.map((week, wi) => (
                        <div key={wi} className={styles.grassWeek}>
                          {week.map((level, di) => (
                            <div key={di} className={`${styles.grassCell} ${styles[`g${level}`]}`} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.readmeWrap}>
                  <div className={styles.readmeHeader}>
                    <span className={styles.readmeTitle}>{handleOf(member)} / README.md</span>
                    <span className={styles.readmeBadge}>About</span>
                  </div>
                  <div className={styles.readmeBody}>
                    <h2 className={styles.readmeH}>안녕하세요, {member.name}입니다 👋</h2>
                    <p className={styles.readmeP}>{member.about}</p>
                  </div>
                </div>

                {member.quote && (
                  <blockquote className={styles.quote}>{member.quote}</blockquote>
                )}
              </div>
            )}

            {tab === "skills" && (
              <div className={styles.tabContent}>
                <div className={styles.pinnedTitle}>🛠 Skills</div>
                {member.skills?.length ? (
                  <ul className={styles.skillList}>
                    {member.skills.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                ) : (
                  <p className={styles.dimText}>등록된 스킬이 없습니다.</p>
                )}
              </div>
            )}

            {tab === "contact" && (
              <div className={styles.tabContent}>
                <div className={styles.pinnedTitle}>📇 Contact</div>
                <address className={styles.contactList}>
                  {member.email && (
                    <div className={styles.contactRow}>
                      <span className={styles.contactKey}>Email</span>
                      <a href={`mailto:${member.email}`} className={styles.metaLink}>{member.email}</a>
                    </div>
                  )}
                  {member.phone && (
                    <div className={styles.contactRow}>
                      <span className={styles.contactKey}>Phone</span>
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.website && (
                    <div className={styles.contactRow}>
                      <span className={styles.contactKey}>Website</span>
                      <a href={member.website} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                        {member.website}
                      </a>
                    </div>
                  )}
                </address>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

interface AddFormProps {
  onAdd: (form: MemberForm) => void;
  onClose: () => void;
  onFill: () => void;
  isFilling: boolean;
  fillError: string;
  fillData: MemberForm | null;
  formError: string;
}

function AddForm({ onAdd, onClose, onFill, isFilling, fillError, fillData, formError }: AddFormProps) {
  const [form, setForm] = useState<MemberForm>(EMPTY_FORM);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (fillData) setForm(fillData);
  }, [fillData]);

  const input =
    (field: keyof MemberForm) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.formTop}>
          <h3 className={styles.formTitle}>아기사자 추가</h3>
          <button className={styles.fillBtn} onClick={onFill} disabled={isFilling}>
            {isFilling ? "불러오는 중" : "랜덤 값 채우기"}
          </button>
        </div>
        {fillError && <span className={styles.fillError}>{fillError}</span>}

        <div className={styles.formGrid}>
          <label className={styles.formGroup}>이름 *
            <input ref={nameRef} className={styles.formInput} value={form.name} onChange={input("name")} placeholder="정서윤" />
          </label>
          <label className={styles.formGroup}>파트 *
            <select className={styles.formInput} value={form.part} onChange={input("part")}>
              <option value="">선택</option>
              {PARTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className={styles.formGroup}>뱃지
            <input className={styles.formInput} value={form.badge} onChange={input("badge")} placeholder="TypeScript" />
          </label>
          <label className={styles.formGroup}>소속
            <input className={styles.formInput} value={form.club} onChange={input("club")} placeholder="디스이즈" />
          </label>
          <label className={`${styles.formGroup} ${styles.formFull}`}>한 줄 소개
            <input className={styles.formInput} value={form.intro} onChange={input("intro")} placeholder="구조적인 UI를 고민합니다." />
          </label>
          <label className={`${styles.formGroup} ${styles.formFull}`}>이미지 URL
            <input className={styles.formInput} value={form.image} onChange={input("image")} placeholder="비우면 기본 이미지" />
          </label>
          <label className={`${styles.formGroup} ${styles.formFull}`}>소개(About)
            <textarea className={styles.formInput} rows={3} value={form.about} onChange={input("about")} />
          </label>
          <label className={`${styles.formGroup} ${styles.formFull}`}>스킬 (쉼표로 구분)
            <input className={styles.formInput} value={form.skills} onChange={input("skills")} placeholder="React, TypeScript, CSS" />
          </label>
          <label className={styles.formGroup}>이메일
            <input className={styles.formInput} value={form.email} onChange={input("email")} />
          </label>
          <label className={styles.formGroup}>전화
            <input className={styles.formInput} value={form.phone} onChange={input("phone")} />
          </label>
          <label className={`${styles.formGroup} ${styles.formFull}`}>웹사이트
            <input className={styles.formInput} value={form.website} onChange={input("website")} placeholder="https://github.com/..." />
          </label>
          <label className={`${styles.formGroup} ${styles.formFull}`}>한마디(Quote)
            <input className={styles.formInput} value={form.quote} onChange={input("quote")} />
          </label>
        </div>

        {formError && <span className={styles.fillError}>{formError}</span>}

        <div className={styles.formActions}>
          <button className={styles.btn} onClick={onClose}>취소</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => onAdd(form)}>추가</button>
        </div>
      </div>
    </div>
  );
}

interface MemberCardProps {
  member: Member;
  onOpen: (id: number) => void;
  onDelete: (id: number) => void;
}

function MemberCard({ member, onOpen, onDelete }: MemberCardProps) {
  return (
    <div
      className={`${styles.memberCard} ${member.isMine ? styles.memberCardMine : ""}`}
      onClick={() => onOpen(member.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(member.id)}
    >
      <button
        className={styles.memberDelete}
        aria-label="멤버 삭제"
        onClick={(e) => { e.stopPropagation(); onDelete(member.id); }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.749.749 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.749.749 0 1 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" /></svg>
      </button>

      {member.isMine && <span className={styles.cardMineFlag}>본인</span>}

      <div className={styles.memberCardTop}>
        <div className={styles.memberAvatar}>
          <img src={member.image} alt={`${member.name} 프로필 이미지`} onError={(e) => fallbackImg(e, member.id)} />
        </div>
        <div className={styles.memberNames}>
          <span className={styles.memberName}>{member.name}</span>
          <span className={styles.memberUser}>@{handleOf(member)}</span>
        </div>
        <span className={styles.cardBadge}>{member.badge}</span>
      </div>

      <p className={styles.memberBio}>{member.intro}</p>

      <span className={styles.partLabel} style={{ color: PART_COLOR[member.part] }}>
        <span className={styles.partDot} style={{ background: PART_COLOR[member.part] }} />
        {member.part}
      </span>
    </div>
  );
}

export default function Page() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [query, setQuery] = useState("");
  const [partFilter, setPartFilter] = useState<PartFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [following, setFollowing] = useState<Set<number>>(() => new Set());

  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [isFilling, setIsFilling] = useState(false);
  const [fillError, setFillError] = useState("");
  const [fillData, setFillData] = useState<MemberForm | null>(null);
  const [formError, setFormError] = useState("");

  const latestControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef(0);
  const lastFetchActionRef = useRef<FetchAction | null>(null);
  const statusResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fillControllerRef = useRef<AbortController | null>(null);
  const nextIdRef = useRef<number>(
    initialMembers.length ? Math.max(...initialMembers.map((m) => m.id)) + 1 : 1
  );

  const makeNextId = (): number => {
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    return id;
  };

  useEffect(() => {
    return () => {
      if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
      if (latestControllerRef.current) latestControllerRef.current.abort();
      if (fillControllerRef.current) fillControllerRef.current.abort();
    };
  }, []);

  function scheduleStatusReset() {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    statusResetTimerRef.current = setTimeout(() => setFetchStatus("idle"), 2000);
  }

  async function runFetchAction(actionFn: FetchAction): Promise<void> {
    const requestId = ++latestRequestIdRef.current;
    lastFetchActionRef.current = actionFn;

    if (latestControllerRef.current) latestControllerRef.current.abort();
    const controller = new AbortController();
    latestControllerRef.current = controller;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    setErrorMessage("");
    setFetchStatus("loading");

    try {
      await actionFn({
        signal: controller.signal,
        isLatest: () => requestId === latestRequestIdRef.current,
      });
      if (requestId !== latestRequestIdRef.current) return;
      clearTimeout(timeoutId);
      setFetchStatus("success");
      scheduleStatusReset();
    } catch (err) {
      if (requestId !== latestRequestIdRef.current) return;
      clearTimeout(timeoutId);
      const e = err as { name?: string; message?: string };
      if (e?.name === "AbortError" && timedOut) {
        setErrorMessage("불러오기 실패: 시간 초과");
        setFetchStatus("error");
        return;
      }
      if (e?.name === "AbortError") return;
      setErrorMessage(`불러오기 실패: ${e?.message || "알 수 없는 오류"}`);
      setFetchStatus("error");
    }
  }

  const handleFetchAdd = (count: number) =>
    runFetchAction(async (ctx) => {
      const users = await fetchRandomUsers(count, ctx.signal);
      if (!ctx.isLatest()) return;
      const newOnes = users.map((u) => mapApiUser(u, makeNextId()));
      setMembers((prev) => [...prev, ...newOnes]);
    });

  const handleRefreshAll = () =>
    runFetchAction(async (ctx) => {
      const users = await fetchRandomUsers(9, ctx.signal);
      if (!ctx.isLatest()) return;
      const fresh = users.map((u) => mapApiUser(u, makeNextId()));
      setMembers((prev) => [...prev.filter((m) => m.isMine), ...fresh]);
    });

  const handleFillRandom = async (): Promise<void> => {
    if (isFilling) return;
    if (fillControllerRef.current) fillControllerRef.current.abort();
    const controller = new AbortController();
    fillControllerRef.current = controller;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    setIsFilling(true);
    setFillError("");

    try {
      const users = await fetchRandomUsers(1, controller.signal);
      const first = users[0];
      if (!first) throw new Error("응답이 비어 있습니다");
      const m = mapApiUser(first, 0);
      setFillData({
        name: m.name, part: m.part, badge: m.badge, intro: m.intro,
        image: m.image, club: m.club, about: m.about,
        skills: m.skills.join(", "), email: m.email, phone: m.phone,
        website: m.website, quote: m.quote,
      });
    } catch (err) {
      const e = err as { name?: string; message?: string };
      if (e?.name === "AbortError" && timedOut) setFillError("랜덤 값 채우기 실패: 시간 초과");
      else if (e?.name !== "AbortError") setFillError(`랜덤 값 채우기 실패: ${e?.message || "알 수 없는 오류"}`);
    } finally {
      clearTimeout(timeoutId);
      setIsFilling(false);
    }
  };

  const handleAdd = (form: MemberForm) => {
    const name = form.name.trim();
    const part = form.part.trim();
    if (!name || !part) {
      setFormError("이름과 파트는 필수입니다.");
      return;
    }
    const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
    const newMember: Member = {
      id: makeNextId(),
      name,
      part: part as Part,
      badge: form.badge.trim() || skills[0] || part,
      intro: form.intro.trim() || `${part} 파트 아기사자입니다.`,
      image: form.image.trim() || pickRandom(DEFAULT_IMAGES),
      isMine: false,
      club: form.club.trim() || "LION TRACK",
      about: form.about.trim(),
      skills,
      email: form.email.trim(),
      phone: form.phone.trim(),
      website: form.website.trim(),
      quote: form.quote.trim(),
    };
    setMembers((prev) => [...prev, newMember]);
    setFormError("");
    setFillData(null);
    setShowForm(false);
  };

  const deleteMember = (id: number) => setMembers((prev) => prev.filter((m) => m.id !== id));

  const toggleFollow = (id: number) =>
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visibleMembers = useMemo(() => {
    let list = members;
    if (partFilter !== "all") list = list.filter((m) => m.part === partFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((m) =>
        [m.name, m.intro, m.badge, m.club, ...(m.skills ?? [])]
          .join(" ").toLowerCase().includes(q)
      );
    }
    if (sortKey === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ko"));
    else if (sortKey === "part") list = [...list].sort((a, b) => a.part.localeCompare(b.part));
    return list;
  }, [members, partFilter, query, sortKey]);

  const selected = members.find((m) => m.id === selectedId) ?? null;

  const statusMap: Record<FetchStatus, string> = {
    loading: "불러오는 중…",
    success: "완료되었습니다.",
    error: errorMessage,
    idle: "",
  };
  const statusText = statusMap[fetchStatus];

  const busy = fetchStatus === "loading";

  return (
    <div className={styles.container}>
      <header className={styles.orgHeader}>
        <div className={styles.orgMark}>🦁</div>
        <div className={styles.orgInfo}>
          <h1 className={styles.orgName}>멋쟁이사자처럼</h1>
          <p className={styles.orgDesc}>동아대학교 멋쟁이사자처럼의 아기사자들을 소개합니다.</p>
          <div className={styles.orgStats}><strong>{members.length}</strong> people</div>
        </div>
      </header>

      <div className={styles.controls}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleFetchAdd(1)} disabled={busy}>
          + 랜덤 1명
        </button>
        <button className={styles.btn} onClick={() => handleFetchAdd(5)} disabled={busy}>
          + 랜덤 5명
        </button>
        <button className={styles.btn} onClick={handleRefreshAll} disabled={busy}>
          ↻ 전체 새로고침
        </button>

        {statusText && (
          <span className={styles.fetchStatus} data-state={fetchStatus}>{statusText}</span>
        )}
        {fetchStatus === "error" && lastFetchActionRef.current && (
          <button
            className={`${styles.btn} ${styles.btnRetry}`}
            onClick={() => lastFetchActionRef.current && runFetchAction(lastFetchActionRef.current)}
          >
            재시도
          </button>
        )}
      </div>

      <div className={styles.peopleBar}>
        <div className={styles.peopleTab}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Z" /></svg>
          People <span className={styles.peopleCount}>{visibleMembers.length}</span>
        </div>

        <div className={styles.peopleActions}>
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z" /></svg>
            <input className={styles.searchInput} placeholder="이름·스킬 검색…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <select className={styles.select} value={partFilter} onChange={(e) => setPartFilter(e.target.value as PartFilter)}>
            <option value="all">전체 파트</option>
            {PARTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <select className={styles.select} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
            <option value="default">기본순</option>
            <option value="name">이름순</option>
            <option value="part">파트순</option>
          </select>

          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { setFormError(""); setFillError(""); setFillData(null); setShowForm(true); }}>
            + 멤버 추가
          </button>
        </div>
      </div>

      {visibleMembers.length === 0 ? (
        <div className={styles.emptyState}>
          표시할 아기사자가 없습니다. 필터/검색 조건을 확인해 주세요.
        </div>
      ) : (
        <div className={styles.peopleGrid}>
          {visibleMembers.map((m) => (
            <MemberCard key={m.id} member={m} onOpen={setSelectedId} onDelete={deleteMember} />
          ))}
        </div>
      )}

      {selected && (
        <DetailModal
          member={selected}
          following={following.has(selected.id)}
          onToggleFollow={toggleFollow}
          onClose={() => setSelectedId(null)}
        />
      )}

      {showForm && (
        <AddForm
          onAdd={handleAdd}
          onClose={() => setShowForm(false)}
          onFill={handleFillRandom}
          isFilling={isFilling}
          fillError={fillError}
          fillData={fillData}
          formError={formError}
        />
      )}
    </div>
  );
}