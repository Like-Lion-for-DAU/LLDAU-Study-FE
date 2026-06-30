import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ListPage from "./ListPage";
import DetailPage from "./DetailPage";
import { members as initialMembers } from "./members";
import type { MemberItem, FetchMode, RandomUser, RandomUserResponse } from "./types";
import { ROLES, BADGES } from "./types";

const API_URL = "https://randomuser.me/api/?nat=us,gb,ca,au,nz&results=";
const TIMEOUT_MS = 5000;

// week8 리뷰의 1번(라우터 캡슐화), 상태 끌어올림 패턴.
// 상태와 fetch 핸들러를 부모(App)에 두고 자식 페이지에 props로 전달한다.
// 그러면 ListPage에서 수정한 멤버가 DetailPage에서도 동일하게 보인다.
//
// 반환 타입(JSX.Element 같은)은 명시하지 않고 TS 추론에 맡긴다 (week8 리뷰 2-1).

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeRandomMember(user: RandomUser, order: number): MemberItem {
  const role = pick(ROLES);
  const badge = pick(BADGES);
  return {
    id: user.login.uuid,
    name: `${user.name.first} ${user.name.last}`,
    role,
    badge,
    intro: `${role} · ${user.location.country} ${user.location.city}에서 합류했어요.`,
    description: `${user.name.first}는 ${role} 파트에 관심이 있으며, ${badge}를 배우고 있습니다.`,
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

export default function Week8App() {
  // 초기 데이터를 MemberItem 형태로 한 번 변환 - id/createdAt 부여
  const [memberList, setMemberList] = useState<MemberItem[]>(() =>
    initialMembers.map<MemberItem>((m, idx) => ({
      ...m,
      id: String(idx + 1),
      isMe: m.isMe ?? false,
      createdAt: idx,
    }))
  );

  // 상태/fetch 관련 ref - 환경 독립 타입과 nullable 명시 (week8 리뷰 노트 10번)
  const nextOrderRef = useRef<number>(initialMembers.length);
  const nextCustomIdRef = useRef<number>(0);
  const latestControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef<number>(0);
  const lastRequestRef = useRef<(() => void) | null>(null);
  const statusResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // fetch 상태
  const [statusText, setStatusText] = useState<string>("준비 완료");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // unmount 시 in-flight 요청과 타이머 정리
  useEffect(() => {
    return () => {
      latestControllerRef.current?.abort();
      if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    };
  }, []);

  function makeNextOrder(): number {
    const order = nextOrderRef.current;
    nextOrderRef.current += 1;
    return order;
  }

  function makeNextCustomId(): string {
    const id = `custom-${nextCustomIdRef.current}`;
    nextCustomIdRef.current += 1;
    return id;
  }

  function scheduleStatusReset(): void {
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
    statusResetTimerRef.current = setTimeout(() => {
      setStatusText("준비 완료");
    }, 2000);
  }

  // fetchRandomMembers - race 차단 패턴 (latestRequestIdRef + AbortController + timeout)
  function fetchRandomMembers(
    count: number,
    mode: FetchMode,
    preservedCards: MemberItem[] = []
  ): void {
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    lastRequestRef.current = () => fetchRandomMembers(count, mode, preservedCards);

    latestControllerRef.current?.abort();
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

    fetch(`${API_URL}${count}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((raw) => {
        // week8 리뷰 2-6: inline annotation 대신 명시적 단언으로 검증 의도를 분리
        const data = raw as RandomUserResponse;
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
        scheduleStatusReset();
      })
      .catch((error: unknown) => {
        // week8 리뷰 2-7: catch는 unknown으로 받고 instanceof Error로 좁힌다
        if (requestId !== latestRequestIdRef.current) return;
        if (!(error instanceof Error)) {
          setHasError(true);
          setStatusText("불러오기 실패: 알 수 없는 오류");
          return;
        }
        if (error.name === "AbortError") {
          if (timedOut) {
            setHasError(true);
            setStatusText("불러오기 실패: 시간 초과");
          }
          return;
        }
        console.error("Fetch error:", error);
        setHasError(true);
        setStatusText("불러오기 실패: 잠시 후 다시 시도해주세요.");
      })
      .finally(() => {
        clearTimeout(timeoutId);
        if (requestId !== latestRequestIdRef.current) return;
        setIsLoading(false);
      });
  }

  function retryRequest(): void {
    lastRequestRef.current?.();
  }

  function deleteLastMember(): void {
    setMemberList((prev) => prev.slice(0, -1));
  }

  return (
    <Routes>
      <Route
        index
        element={
          <ListPage
            memberList={memberList}
            setMemberList={setMemberList}
            statusText={statusText}
            isLoading={isLoading}
            hasError={hasError}
            fetchRandomMembers={fetchRandomMembers}
            retryRequest={retryRequest}
            deleteLastMember={deleteLastMember}
            makeNextCustomId={makeNextCustomId}
            makeNextOrder={makeNextOrder}
          />
        }
      />
      <Route
        path="lions/:memberId"
        element={<DetailPage memberList={memberList} />}
      />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
