import { useState } from "react";
import styles from "./Page.module.css";
import pfp from "./pfp.png";

// 52주 × 7일 잔디 그리드 생성
// 배경은 랜덤 노이즈(레벨 1~2), 중앙에 하트 픽셀 아트(레벨 4) 오버레이
function generatePixelGrass() {
  const cols = 52;
  const rows = 7;
  const grid = Array.from({ length: cols }, () => Array(rows).fill(0));

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const seed = ((c * 7 + r) * 9301 + 49297) % 233280;
      grid[c][r] = seed < 60000 ? 0 : seed < 120000 ? 1 : seed < 180000 ? 2 : 1;
    }
  }

  // 11×7 하트 픽셀 맵
  const HEART = [
    [0,1,1,0,0,0,1,1,0,0,0],
    [1,1,1,1,0,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0],
  ];

  const startCol = Math.floor((cols - 11) / 2);
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 11; c++) {
      if (HEART[r][c]) grid[startCol + c][r] = 4;
    }
  }

  return grid;
}

const GRASS = generatePixelGrass();

const REPOS = [
  {
    name: "LLDAU-Study-FE",
    desc: "동아 멋쟁이 사자처럼 프론트엔드 스터디 레포. 주차별 미션 학습 내용 포함.",
    lang: "JavaScript",
    langColor: "#f1e05a",
    tags: ["React", "HTML/CSS"],
    href: "https://github.com/Like-Lion-for-DAU/LLDAU-Study-FE",
    org: "Like-Lion-for-DAU",
  },
  {
    name: "쫄",
    desc: "멋쟁이사자처럼 리그 참가작. 웹 기반 미니게임 대전 프로젝트.",
    lang: "JavaScript",
    langColor: "#f1e05a",
    tags: ["Game", "HTML/CSS", "JS"],
    href: "#",
    org: "wad8228",
  },
];

const ACTIVITY = [
  { date: "2026-03-02", msg: "chore: 멋쟁이사자처럼 디스이즈 활동 시작", type: "chore" },
  { date: "2026-03-02", msg: "init: 동아대학교 26학번 입학", type: "feat" },
];

const SKILLS_STAT = [
  { lang: "JavaScript", pct: 42, color: "#f1e05a" },
  { lang: "Python",     pct: 28, color: "#3572A5" },
  { lang: "HTML/CSS",   pct: 20, color: "#e34c26" },
  { lang: "기타",       pct: 10, color: "#333" },
];

const TYPE_COLOR = {
  feat:  "#238636",
  chore: "#6e7681",
};

export default function Page() {
  const [tab, setTab] = useState("overview");

  return (
    <div className={styles.root}>

      {/* 사이드바: 프로필 정보 고정 영역 */}
      <aside className={styles.sidebar}>
        <div className={styles.avatar}>
          <div className={styles.avatarImg}>
            <img src={pfp} alt="서윤" />
          </div>
        </div>

        <h1 className={styles.displayName}>정서윤</h1>
        <p className={styles.username}>@wad8228</p>
        <p className={styles.sideBio}>
          열심히 배워가고 있는 프론트엔드 개발자입니다!
          기초를 탄탄히 다지며 맡은 역할을 끝까지 책임지겠습니다. 🔥
        </p>
        <button className={styles.followBtn}>Follow</button>

        <div className={styles.sideStats}>
          <span><strong>2</strong> repos</span>
          <span className={styles.dot}>·</span>
          <span><strong>2</strong> commits</span>
        </div>

        <div className={styles.sideMeta}>
          <div className={styles.metaRow}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1.5 2.75a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25v7.5a.25.25 0 0 1-.25.25h-6.869l.26 1.5h2.109a.75.75 0 0 1 0 1.5H6.25a.75.75 0 0 1 0-1.5h2.109l.26-1.5H1.75a.25.25 0 0 1-.25-.25Z"/></svg>
            <span>동아대학교 컴퓨터공학과</span>
          </div>
          <div className={styles.metaRow}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z"/></svg>
            <span>Busan, Korea</span>
          </div>
          <div className={styles.metaRow}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
            <a href="https://github.com/wad8228" target="_blank" rel="noreferrer" className={styles.metaLink}>github.com/wad8228</a>
          </div>
          <div className={styles.metaRow}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/></svg>
            <span>멋쟁이사자처럼 · 디스이즈</span>
          </div>
        </div>

        <div className={styles.langStat}>
          <p className={styles.langTitle}>Languages</p>
          <div className={styles.langBar}>
            {SKILLS_STAT.map(({ lang, pct, color }) => (
              <div key={lang} style={{ width: `${pct}%`, background: color }} title={`${lang} ${pct}%`} />
            ))}
          </div>
          <div className={styles.langLegend}>
            {SKILLS_STAT.map(({ lang, pct, color }) => (
              <span key={lang} className={styles.langItem}>
                <span className={styles.langDot} style={{ background: color }} />
                {lang} <span className={styles.langPct}>{pct}%</span>
              </span>
            ))}
          </div>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.tabs}>
          {[
            { key: "overview",     label: "Overview" },
            { key: "repositories", label: "Projects" },
            { key: "activity",     label: "Activity" },
          ].map(({ key, label }) => (
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

            {/* 잔디 그래프: 픽셀 아트 하트를 배경 노이즈 위에 오버레이 */}
            <div className={styles.grassWrap}>
              <div className={styles.grassHeader}>
                <span className={styles.grassTitle}>
                  <strong>서윤</strong> contributions this year
                </span>
                <span className={styles.grassSub}>pixel art 🎮</span>
              </div>
              <div className={styles.grassScroll}>
                <div className={styles.grassGrid}>
                  {GRASS.map((week, wi) => (
                    <div key={wi} className={styles.grassWeek}>
                      {week.map((level, di) => (
                        <div
                          key={di}
                          className={`${styles.grassCell} ${styles[`g${level}`]}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.grassLegend}>
                <span>Less</span>
                {[0,1,2,3,4].map(l => (
                  <div key={l} className={`${styles.grassCell} ${styles[`g${l}`]}`} />
                ))}
                <span>More</span>
              </div>
            </div>

            <div className={styles.readmeWrap}>
              <div className={styles.readmeHeader}>
                <span className={styles.readmeTitle}>wad8228 / wad8228</span>
                <span className={styles.readmeBadge}>README.md</span>
              </div>
              <div className={styles.readmeBody}>
                <h2 className={styles.readmeH}>안녕하세요, 정서윤입니다 👋</h2>
                <p className={styles.readmeP}>
                  07년생 26학번 동아대학교 컴퓨터공학과 재학 중입니다.<br />
                  아직 부족한 점이 많지만, 배우는 과정 자체를 즐기며 꾸준히 성장하고 있습니다.<br />
                  MBTI는 <strong>ESTP</strong>이고, 멋쟁이사자처럼 <strong>디스이즈</strong> 소속으로 활동 중입니다.
                </p>
                <div className={styles.readmeTags}>
                  {["Frontend", "React", "Python", "AI", "Blockchain", "ESTP"].map(t => (
                    <span key={t} className={styles.readmeTag}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.pinnedTitle}>📌 Pinned</div>
            <div className={styles.repoGrid}>
              {REPOS.map((r) => (
                <a key={r.name} href={r.href} target="_blank" rel="noreferrer" className={styles.repoCard}>
                  <div className={styles.repoTop}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={styles.repoIcon} aria-hidden="true"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/></svg>
                    <span className={styles.repoNameSmall}>{r.org} /</span>
                    <span className={styles.repoName}>{r.name}</span>
                    <span className={styles.repoBadge}>Public</span>
                  </div>
                  <p className={styles.repoDesc}>{r.desc}</p>
                  <div className={styles.repoTags}>
                    {r.tags.map(t => <span key={t} className={styles.repoTag}>{t}</span>)}
                  </div>
                  <div className={styles.repoMeta}>
                    <span className={styles.repoLang}>
                      <span className={styles.repoLangDot} style={{ background: r.langColor }} />
                      {r.lang}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {tab === "repositories" && (
          <div className={styles.tabContent}>
            <div className={styles.repoList}>
              {REPOS.map((r) => (
                <a key={r.name} href={r.href} target="_blank" rel="noreferrer" className={styles.repoListRow}>
                  <div className={styles.repoListLeft}>
                    <div className={styles.repoListName}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={styles.repoIcon} aria-hidden="true"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/></svg>
                      <span className={styles.repoNameSmall}>{r.org} /</span>
                      <span>{r.name}</span>
                      <span className={styles.repoBadge}>Public</span>
                    </div>
                    <p className={styles.repoDesc}>{r.desc}</p>
                    <div className={styles.repoMeta}>
                      <span className={styles.repoLang}>
                        <span className={styles.repoLangDot} style={{ background: r.langColor }} />
                        {r.lang}
                      </span>
                      {r.tags.map(t => <span key={t} className={styles.repoTag}>{t}</span>)}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div className={styles.tabContent}>
            <div className={styles.activityList}>
              {ACTIVITY.map(({ date, msg, type }) => (
                <div key={date + msg} className={styles.activityRow}>
                  <div
                    className={styles.activityDot}
                    style={{ background: TYPE_COLOR[type] ?? "#30363d" }}
                  />
                  <div className={styles.activityBody}>
                    <div className={styles.activityTop}>
                      <span
                        className={styles.activityType}
                        style={{ color: TYPE_COLOR[type], borderColor: TYPE_COLOR[type] + "44" }}
                      >
                        {type}
                      </span>
                      <span className={styles.activityMsg}>{msg.replace(/^\w+: /, "")}</span>
                    </div>
                    <span className={styles.activityDate}>{date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}