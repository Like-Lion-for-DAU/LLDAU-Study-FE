//react 훅 임포트
//useEffect 사이드 이펙트 처리
//useRef 리렌더링엉ㅂ시 값/DOM 보관하는 ref객체 생성
//useState 컴포넌트 상태 선언 관리
import { useEffect, useRef, useState } from "react";
import styles from "./Page.module.css"; //css 모듈 임포트
import {
  initialMembers,
  PARTS,
  SKILLS_BY_PART,
  ABOUT_PRESETS,
  QUOTE_PRESETS,
  DEFAULT_IMAGES,
} from "./lions"; //필요한 상수랑 데이터

const TIMEOUT_MS = 5000; //fetch 요청에 적용할 타임아웃 시간,이 시간안에 응답없으면 abortController로 요청 취소

//배열에서 무작위 요소 하나를 반환하는 함수
//0이상 1미만 난수 생성후 배열 길이 범위로 스케일업해서 소수점 버리고 유요한 정수 확보함
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
//randomuser.me API응답을 내부 멤버 형식으로 반환함
function mapApiUser(user, id) {
  //PARTS배열에서 파트를 무작위로 선택
  const part = pickRandom(PARTS);

  //해당 파트의 기술 스택 배열을 복사한뒤 무작위로 섞고 앞 3개만 추출
  const skills = [...SKILLS_BY_PART[part]].sort(() => Math.random() - 0.5).slice(0, 3);
  //API응답에서 이름 추출후 성이랑 이릅 결합
  const name = `${user.name.first} ${user.name.last}`;
  //API응답에서 국가추출 만약 없으면 빈 문자열로 대체
  const country = user.location?.country || "";
  //API응답에서 도시추출 만약 없으면 빈 문자열로 대체
  const city = user.location?.city || "";
  //위에서 조합한 데이터로 내부 멤버 객체를 구성해 반환함
  return {
    id,//앱 내부 고유 ID
    name,
    part,
    intro: `${part} · ${country} ${city}에서 합류했어요!`,
    about: `안녕하세요, ${name}입니다. ${country} ${city} 출신으로 ${part} 분야에서 활동 중입니다.`,
    skills,
    badge: skills[0] || "",
    email: user.email || "",
    phone: user.phone || "",
    website: `https://github.com/${user.login?.username || "lion"}`,
    image: user.picture?.large || `https://picsum.photos/seed/${id}/200/200`,
    club: "LION TRACK",
    isMine: false,//API로 추가된 멤버는 내 카드가 아님
  };
}
//randomuser.me API에서 count명의 랜덤 유저를 가져오는 비동기 함수
async function fetchRandomUsers(count, signal) {
  //fetch 요청 results=count 명 nat으로 국정 한정
  const res = await fetch(
    `https://randomuser.me/api/?results=${count}&nat=us,gb,ca,au,nz`,
    { signal } //AbortSignal을 fetch에 전달 만약 abort시 요청 즉시 취소
  );

  //HTTP응답이 실패면 에러 throw
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json(); //JSON으로 파싱
  return data.results || []; //results배열 반환 만약 없으면 빈 배열 반환
}
//폼 초기 상태 함수
//폼을 열거나 닫을때 이 값으로 초기화함
const EMPTY_FORM = {
  name: "", //이름
  part: "", //파트
  skills: "", //관심기술 쉼표로 구분된 문자열
  intro: "", //한줄소개
  about: "", //자기소개
  email: "", //이메일
  phone: "", //전화번호
  website: "", //웹사이트
  quote: "", //한마디
};

//페이지 메인 컴포넌트 선언 및 default export
export default function Week4Page() {

  //현재 표시중인 전체 멤버 배열 상태
  //초기값은 lion.js에서 불러온 initialMemvers
  const [members, setMembers] = useState(initialMembers);
  
  const [showForm, setShowForm] = useState(false); //멤버 추가 폼의 표시 여부 상태 True는 열림 False는 닫힘
  const [formData, setFormData] = useState(EMPTY_FORM); //폼 입력값 상태 객체 각 필드가 controlled input과 연동됨
  const [filterPart, setFilterPart] = useState("전체"); //파트 필터 상태 전체이면 모든 멤버표시 특정파트이면 해당 파트만 표시
  const [sortOrder, setSortOrder] = useState("최신추가순");//정렬 기준 상태
  const [searchName, setSearchName] = useState(""); //이름 검색어 상태 입력값을 포함하는 멤버만 필터링
  
  
  //API fetch 상태
  //idle loading success error
  //UI에서 버튼 비활성화 상태 메시지 표시에 활용
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(""); //fetch 실패시 에러 메시지 상태
  
  
  //랜덤값 채우기 버튼이 현재 요청중인지 여부 상태
  //true면 버튼 비활성화 및 로딩 텍스트 표시
  const [isFilling, setIsFilling] = useState(false);
  
  
  //다음 멤버에 부여할 id를 저장하는 ref
  //ref를 사용하는 이유는 id변경시 리렌더링이 필요없기떄문
  //초기값은 현재 initialMembers중 가장 큰 id + 1
  const nextIdRef = useRef(Math.max(...initialMembers.map((m) => m.id)) + 1);
  
  
  //가장 최근에 시작된 fetch 요청의 고유 번호를 추적하는 ref
  //경쟁 조건 방지하기위해서 사용됨
  //이전 요청의 응답이 늦게 도착해도 무시 가능함
  const latestRequestIdRef = useRef(0);
  
  //현재 진행중인 ㄴfetch 요청의 AbortController를 저장하는 ref
  //새 요청 시작전에 이전 요청을 abort()로 취소할떄 사용
  const latestControllerRef = useRef(null);
  
  //마지막으로 실행된 fetch액션 함수를 저장하는 ref
  //재시도 버튼 클릭시 동일한 액션을 다시 실행하기위해 보관
  const lastFetchActionRef = useRef(null);
  
  //완료 상태를 2초후 idle로 되돌리는 타이머를 저장하는 ref
  //컴포넌트 언마운트시 clearTimeout으로 타임어를 정리
  const statusResetTimerRef = useRef(null);
  
  //폼의 이름 input요소에ㅓ 대한 ref
  //폼이 열릴때 자동으로 포커스를 위해 사용
  const nameInputRef = useRef(null);
  
  //아기사자추가 버튼 요서에 대한 ref
  //폼 닫힐때 포커스를 이 버튼으로 되돌리기위해 사용
  const addBtnRef = useRef(null);

  //컴포넌트 마운트시 1회 실행되는 cleanup등록 useEffect
  //의존성 배열이 []이므로 마운트시한번 언마운트시 cleanup실행
  useEffect(() => {
    //cleanup함수는 컴포넌트가 DOM에서 제거될때 실행됨
    return () => {
      if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current); //메모리 누수 방지하기위해 남아있는 상태 리셋 타이머가 있으면 정리함
      if (latestControllerRef.current) latestControllerRef.current.abort();//언마운트후 setState호출을 방지하기위해 진행중인 fetch요청이있으면 취소함
    };
  }, []);

  //showForm이 바뀔때마다 실행되는 useEffect
  //폼이 열리면 이름 일벽 필드로 자동 포커스 이동
  useEffect(() => {
    if (showForm) nameInputRef.current?.focus();
  }, [showForm]); //showForm이 변경될때만 재실행

  //show FOrm 상태에 따라 esc키 이벤트 리스너를 등록 해제함
  useEffect(() => {
    //폼이 닫혀있으면 이벤트 리스너 등록 불필요하므로 즉시 종료함
    if (!showForm) return;

    //esc키 누름 감지 핸들러
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setShowForm(false);//폼 닫기
        setFormData(EMPTY_FORM);//폼 데이터 초기화
        addBtnRef.current?.focus(); //포커스를 아기사자 추가 버튼으로 복귀
      }
    };
    window.addEventListener("keydown", onEsc); //전역에 keydown이벤트 등록
    return () => window.removeEventListener("keydown", onEsc); //cleanup showForm이 flase가 되거나 컴포넌트 언마운트시 이벤트 해제함
  }, [showForm]); //show Form 바뀔때마다 리스너 재등록

  //아기사자 추가 버튼 클릭 핸들러 폼 표시 여부를 토글함
  const handleToggleForm = () => setShowForm((prev) => !prev);

  //폼 닫기,데이터 초기화,버튼으로 포커스 복귀를 처리함
  const handleCloseForm = () => {
    setShowForm(false); //폼숨기기
    setFormData(EMPTY_FORM); //모든 입력값 초기화
    addBtnRef.current?.focus(); //아기사자 추가 버튼으로 포커스 이동
  };


  //랜덤 값 채우기 버튼 핸들러
  const handleFillRandom = async () => {
    if (isFilling) return; //이미 로딩중이면 중복 호출 방지함
    setIsFilling(true); //로딩상태 시작
    const controller = new AbortController(); //이 요청 전용 AbortController 생성
    let timedOut = false; //타임아웃 여부 추적용 지역변수
    
    //TIMEOUT_MS 후 자동 abort및 timedOut플래그 설정
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);
    try {
      //랜덤 유저 API호출
      const users = await fetchRandomUsers(1, controller.signal);
      clearTimeout(timeoutId); //성공시 타이머 정리
      const user = users[0];
      if (!user) throw new Error("유저를 불러오지 못했습니다."); //유저 데이터 없으면 에러 throw
      const part = pickRandom(PARTS); //파트 및 기술 무작위 선택
      const skills = [...SKILLS_BY_PART[part]].sort(() => Math.random() - 0.5).slice(0, 3);
      const country = user.location?.country || "";
      const city = user.location?.city || "";
      
      //API데이터 및 랜덤 프리셋으로 전체 필드를 채움
      setFormData({
        name: `${user.name.first} ${user.name.last}`,
        part,
        skills: skills.join(", "),
        intro: `${part} · ${country} ${city}에서 합류했어요!`,
        about: pickRandom(ABOUT_PRESETS),
        email: user.email || "",
        phone: user.phone || "",
        website: `https://example.com/${user.login?.username || "lion"}`,
        quote: pickRandom(QUOTE_PRESETS),
      });
    } catch (err) {
      clearTimeout(timeoutId); //에러 발생시에도 타이머 정리

      //AbortError 이면서 timedOut이면 취소함
      if (err?.name === "AbortError" && timedOut) {
        alert("랜덤 값 채우기 실패: 시간 초과");
      } else if (err?.name !== "AbortError") {
        //AbortError가 아닌 에러
        alert(`랜덤 값 채우기 실패: ${err?.message}`);
      }
      //AbortError이지만 Timeout이아니면 사용자가 의도적으로 취소한것이므로 무시함
    } finally {
      //성공 실패 모두 로딩 상태 해제함
      setIsFilling(false);
    }
  };

  //마지막으로 추가된 멤버를 삭제하는 핸들러
  //마지막 요소를 제외한 새 배열을 반환함
  const handleDeleteLast = () => setMembers((prev) => prev.slice(0, -1));

  //폼 입력 필드의 onChange핸들러를 생성하는 고차함수
  //field는 변경할 formData의 키 이름
  //반환값은 onChange이벤트 핸들러 함수
  //이전 상태를 spread한뒤 해당 field만 새 값으로 업데이트해서 불변성을 유지함
  const handleInput = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  //폼 제출 핸들러
  //입력값을 검증후 members에 새 멤버 추가
  const handleSubmit = (e) => {
    e.preventDefault(); //기본 form subit방지
    const skillArr = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const id = nextIdRef.current++;
    setMembers((prev) => [
      ...prev,
      {
        id,
        name: formData.name.trim(),
        part: formData.part,
        intro: formData.intro.trim(),
        about: formData.about.trim(),
        quote: formData.quote.trim(),
        skills: skillArr,
        badge: skillArr[0] || "",
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        website: formData.website.trim(),
        image: DEFAULT_IMAGES[members.length % DEFAULT_IMAGES.length],
        club: "LION TRACK",
        isMine: false,
      },
    ]);
    handleCloseForm();
  };

  async function runFetchAction(actionFn) {
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

      if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
      statusResetTimerRef.current = setTimeout(() => {
        if (requestId === latestRequestIdRef.current) setFetchStatus("idle");
      }, 2000);
    } catch (err) {
      if (requestId !== latestRequestIdRef.current) return;
      clearTimeout(timeoutId);
      if (err?.name === "AbortError" && timedOut) {
        setFetchStatus("error");
        setErrorMessage("불러오기 실패: 시간 초과");
        return;
      }
      if (err?.name === "AbortError") return;
      setFetchStatus("error");
      setErrorMessage(`불러오기 실패: ${err?.message || "알 수 없는 오류"}`);
    }
  }

  const handleFetchAdd = (count) =>
    runFetchAction(async (ctx) => {
      const users = await fetchRandomUsers(count, ctx.signal);
      if (!ctx.isLatest()) return;
      const newOnes = users.map((u) => mapApiUser(u, nextIdRef.current++));
      setMembers((prev) => [...prev, ...newOnes]);
    });

  const handleFetchRefresh = () =>
    runFetchAction(async (ctx) => {
      const mineMembers = members.filter((m) => m.isMine);
      const fetchCount = members.length - mineMembers.length;
      if (fetchCount === 0) return;
      const users = await fetchRandomUsers(fetchCount, ctx.signal);
      if (!ctx.isLatest()) return;
      const newOnes = users.map((u) => mapApiUser(u, nextIdRef.current++));
      setMembers([...mineMembers, ...newOnes]);
    });

  const handleRetry = () => {
    if (typeof lastFetchActionRef.current === "function") {
      runFetchAction(lastFetchActionRef.current);
    }
  };

  const visibleMembers = (() => {
    let list = members.slice();
    if (filterPart !== "전체") list = list.filter((m) => m.part === filterPart);
    const query = searchName.trim();
    if (query) list = list.filter((m) => m.name?.includes(query));
    if (sortOrder === "이름순") {
      list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    } else {
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  })();

  return (
    <main className={styles["container"]}>
      <div className={styles["controls"]}>
        <button ref={addBtnRef} type="button" className={styles["btn"]} onClick={handleToggleForm}>
          아기 사자 추가
        </button>
        <button type="button" className={styles["btn"]} onClick={handleDeleteLast}>
          마지막 아기 사자 삭제
        </button>
        <span className={styles["total-count"]}>총 {members.length}명</span>
      </div>

      <div className={styles["controls"]}>
        <button
          type="button"
          className={`${styles["btn"]} ${styles["btn-fetch"]}`}
          onClick={() => handleFetchAdd(1)}
          disabled={fetchStatus === "loading"}
        >
          랜덤 1명 추가
        </button>
        <button
          type="button"
          className={`${styles["btn"]} ${styles["btn-fetch"]}`}
          onClick={() => handleFetchAdd(5)}
          disabled={fetchStatus === "loading"}
        >
          랜덤 5명 추가
        </button>
        <button
          type="button"
          className={`${styles["btn"]} ${styles["btn-fetch"]}`}
          onClick={handleFetchRefresh}
          disabled={fetchStatus === "loading"}
        >
          전체 새로고침
        </button>
        <span
          className={styles["fetch-status"]}
          data-state={fetchStatus === "idle" ? "" : fetchStatus}
        >
          {fetchStatus === "loading" && "불러오는 중..."}
          {fetchStatus === "success" && "완료!"}
          {fetchStatus === "error" && errorMessage}
          {fetchStatus === "idle" && "준비 완료"}
        </span>
        {fetchStatus === "error" && (
          <button
            type="button"
            className={`${styles["btn"]} ${styles["btn-retry"]}`}
            onClick={handleRetry}
          >
            재시도
          </button>
        )}
      </div>

      <div className={styles["view-options"]}>
        <label className={styles["view-option"]}>
          <span>파트</span>
          <select value={filterPart} onChange={(e) => setFilterPart(e.target.value)}>
            <option value="전체">전체</option>
            {PARTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className={styles["view-option"]}>
          <span>정렬</span>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="최신추가순">최신추가순</option>
            <option value="이름순">이름순</option>
          </select>
        </label>
        <label className={styles["view-option"]}>
          <span>검색</span>
          <input
            type="search"
            placeholder="이름으로 검색"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </label>
      </div>

      {showForm && (
        <div className={styles["form-wrapper"]}>
          <form className={styles["add-form"]} onSubmit={handleSubmit}>
            <div className={styles["form-grid"]}>
              <div className={styles["form-group"]}>
                <label htmlFor="f-name">이름</label>
                <input
                  ref={nameInputRef}
                  id="f-name" type="text" placeholder="예: 홍아기사자"
                  value={formData.name} onChange={handleInput("name")} required
                />
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="f-part">파트</label>
                <select id="f-part" value={formData.part} onChange={handleInput("part")} required>
                  <option value="">선택하세요</option>
                  {PARTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className={`${styles["form-group"]} ${styles["form-full"]}`}>
                <label htmlFor="f-skills">관심 기술 (쉼표로 구분)</label>
                <input
                  id="f-skills" type="text" placeholder="예: JavaScript, React, HTML/CSS"
                  value={formData.skills} onChange={handleInput("skills")} required
                />
              </div>

              <div className={`${styles["form-group"]} ${styles["form-full"]}`}>
                <label htmlFor="f-intro">한 줄 소개 (요약 카드)</label>
                <input
                  id="f-intro" type="text" placeholder="예: 3주차 DOM 조작 연습 중!"
                  value={formData.intro} onChange={handleInput("intro")} required
                />
              </div>

              <div className={`${styles["form-group"]} ${styles["form-full"]}`}>
                <label htmlFor="f-about">자기소개 (상세 카드)</label>
                <textarea
                  id="f-about" rows={5}
                  placeholder="예: HTML/CSS로 구조를 만들고, JS로 데이터를 바꾸면 화면이 바뀌는 경험을 하고 있습니다."
                  value={formData.about} onChange={handleInput("about")} required
                />
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="f-email">Email</label>
                <input
                  id="f-email" type="email" placeholder="예: lion@example.com"
                  value={formData.email} onChange={handleInput("email")} required
                />
              </div>

              <div className={styles["form-group"]}>
                <label htmlFor="f-phone">Phone</label>
                <input
                  id="f-phone" type="tel" placeholder="예: 010-1234-5678"
                  value={formData.phone} onChange={handleInput("phone")} required
                />
              </div>

              <div className={`${styles["form-group"]} ${styles["form-full"]}`}>
                <label htmlFor="f-website">Website</label>
                <input
                  id="f-website" type="url" placeholder="예: https://example.com"
                  value={formData.website} onChange={handleInput("website")}
                />
              </div>

              <div className={`${styles["form-group"]} ${styles["form-full"]}`}>
                <label htmlFor="f-quote">한 마디</label>
                <input
                  id="f-quote" type="text" placeholder="예: 데이터 바꾸면 화면도 바뀐다!"
                  value={formData.quote} onChange={handleInput("quote")} required
                />
              </div>
            </div>

            <div className={styles["form-actions"]}>
              <button
                type="button"
                className={styles["btn"]}
                onClick={handleFillRandom}
                disabled={isFilling}
              >
                {isFilling ? "불러오는 중..." : "랜덤 값 채우기"}
              </button>
              <button type="submit" className={`${styles["btn"]} ${styles["btn-primary"]}`}>
                추가하기
              </button>
              <button type="button" className={styles["btn"]} onClick={handleCloseForm}>
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <section className={styles["summary-section"]}>
        <ul className={styles["card-grid"]}>
          {visibleMembers.length === 0 && (
            <li className={styles["empty-state"]}>
              표시할 아기 사자가 없습니다.<br />(필터/검색 조건을 확인해 주세요)
            </li>
          )}
          {visibleMembers.map((m) => {
            const partClass = m.part?.toLowerCase() || "";
            return (
              <li
                key={m.id}
                className={`${styles["summary-card"]} ${m.isMine ? styles["summary-card--mine"] : ""}`}
              >
                <div className={styles["card-image-wrap"]}>
                  <img
                    src={m.image}
                    alt={`${m.name} 프로필 이미지`}
                    className={styles["card-image"]}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://picsum.photos/seed/${m.id}/400/280`;
                    }}
                  />
                  <span className={styles["badge"]}>{m.badge}</span>
                </div>
                <div className={styles["card-body"]}>
                  <h2 className={styles["card-name"]}>{m.name}</h2>
                  <p className={`${styles["card-part"]} ${styles[`card-part--${partClass}`] || ""}`}>
                    {m.part}
                  </p>
                  <p className={styles["card-intro"]}>{m.intro}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles["detail-section"]}>
        <h2 className={styles["section-title"]}>상세 자기소개</h2>
        <ol className={styles["detail-list"]}>
          {visibleMembers.length === 0 && (
            <li className={styles["empty-state"]}>표시할 아기 사자가 없습니다.</li>
          )}
          {visibleMembers.map((m) => {
            const partClass = m.part?.toLowerCase() || "";
            return (
              <li key={m.id} className={styles["detail-card"]}>
                <header className={styles["detail-header"]}>
                  <h3 className={styles["detail-name"]}>{m.name}</h3>
                  <p className={`${styles["detail-part"]} ${styles[`detail-part--${partClass}`] || ""}`}>
                    {m.part}
                  </p>
                  <p className={styles["detail-club"]}>{m.club}</p>
                </header>

                <section className={styles["detail-section-inner"]}>
                  <h4>자기소개</h4>
                  <p>{m.about}</p>
                </section>

                <section className={styles["detail-section-inner"]}>
                  <h4>관심 기술</h4>
                  <ul className={styles["skill-list"]}>
                    {(m.skills || []).map((s, i) => (
                      <li key={`${m.id}-skill-${i}`}>{s}</li>
                    ))}
                  </ul>
                </section>

                <section className={styles["detail-section-inner"]}>
                  <h4>연락처</h4>
                  <address>
                    <ul className={styles["contact-list"]}>
                      {m.email && <li>이메일: <a href={`mailto:${m.email}`}>{m.email}</a></li>}
                      {m.phone && <li>전화번호: {m.phone}</li>}
                      {m.website && (
                        <li>
                          웹사이트:{" "}
                          <a href={m.website} target="_blank" rel="noopener noreferrer">
                            {m.website}
                          </a>
                        </li>
                      )}
                    </ul>
                  </address>
                </section>

                <section className={styles["detail-section-inner"]}>
                  <h4>한 마디</h4>
                  <blockquote>{m.quote}</blockquote>
                </section>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
