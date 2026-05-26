# 5주차 주완 코드 개선 과제 리뷰

1~4주차 리뷰/study에서 지적한 개선사항을 5주차 폴더에 적용한 결과물 기준으로,
런타임 영향이 있거나 미완 상태인 부분만 정리합니다.

## 1. 컴포넌트 함수명이 Week4Page

```
export default function Week4Page() {
  ...
}
```

- 폴더는 `week5`인데 함수명은 `Week4Page`로 남아있습니다.
- 동작에는 영향 없지만 React DevTools에서 잘못된 이름으로 보이고, 코드 검색·이해 시 혼동을 줍니다.

### 해결

- 함수명을 `Week5Page`로 변경

```
export default function Week5Page() {
  return (
    <div className={styles.weekPage}>
      ...
    </div>
  );
}
```

## 2. fillRandomForm에 AbortController / signal / 타임아웃 / cleanup 모두 없음

```
const fillRandomForm = () => {
  setIsFilling(true);
  setFillError("");

  fetch(API_URL + 1)               // signal 없음, 타임아웃 없음
    .then((res) => {...})
    .then((data) => {...})
    .catch((error) => {
      setFillError("랜덤 값 불러오기 실패: " + error.message);
    })
    .finally(() => {
      setIsFilling(false);
    });
};
```

- `fetchRandomMembers`에는 AbortController + 타임아웃 + latestRequestId까지 잘 적용되어 있지만, `fillRandomForm`은 아무것도 없습니다.
- 사용자가 "랜덤 값 채우기"를 빠르게 두 번 눌렀을 때 두 응답이 모두 setFormData → race condition.
- 컴포넌트가 unmount된 후 응답이 도착하면 unmounted setState 경고.
- 네트워크가 늦으면 무한 대기.

### 해결

- `fetchRandomMembers`와 동일한 패턴을 적용

```
const fillControllerRef = useRef(null);

const fillRandomForm = () => {
  // 이전 fill 요청 취소
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
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then((data) => {
      const randomMember = makeRandomMember(data.results[0], makeNextOrder());
      setFormData({
        name: randomMember.name,
        role: randomMember.role,
        ...
      });
    })
    .catch((error) => {
      if (error.name === "AbortError" && timedOut) {
        setFillError("랜덤 값 불러오기 실패: 시간 초과");
        return;
      }
      if (error.name === "AbortError") return;
      setFillError("랜덤 값 불러오기 실패: " + error.message);
    })
    .finally(() => {
      clearTimeout(timeoutId);
      setIsFilling(false);
    });
};
```

- useEffect cleanup에도 fillControllerRef abort 추가

```
useEffect(() => {
  return () => {
    if (latestControllerRef.current) latestControllerRef.current.abort();
    if (fillControllerRef.current) fillControllerRef.current.abort();   // 추가
  };
}, []);
```

## 3. fillRandomForm이 폼 취소되어도 makeNextOrder 카운터가 증가

```
const fillRandomForm = () => {
  ...
  .then((data) => {
    const randomMember = makeRandomMember(data.results[0], makeNextOrder());
    //                                                    ^^^^^^^^^^^^^^^
    // 폼에 임시 표시할 값 만들 뿐인데 카운터가 영구 증가
    setFormData({ ... });
  });
};
```

- 사용자가 "랜덤 값 채우기" 누르고 폼을 취소하더라도 `nextOrderRef`가 이미 증가합니다.
- 다음에 실제로 추가되는 멤버의 `createdAt`이 띄엄띄엄해짐.
- 큰 버그는 아니지만 의도와 어긋남.

### 해결

- 폼 채우기용 임시 데이터는 `createdAt` 없이 만들거나, `makeNextOrder()` 대신 임시값 사용

```
.then((data) => {
  // makeRandomMember는 order가 필요한데, 폼 표시용이라 일단 0이나 -1 같은 임시값
  const randomMember = makeRandomMember(data.results[0], 0);
  setFormData({
    name: randomMember.name,
    role: randomMember.role,
    badge: randomMember.badge,
    intro: randomMember.intro,
    description: randomMember.description,
    email: randomMember.email,
    phone: randomMember.phone,
    website: randomMember.website,
    image: randomMember.image,
    comment: randomMember.comment,
    // createdAt은 formData에 안 쓰니까 무시
  });
});
```

또는 makeRandomMember 대신 폼 전용 변환 함수를 분리:

```
function userToFormData(user) {
  const role = getRandomItem(roles);
  const badge = getRandomItem(badges);
  return {
    name: user.name.first + " " + user.name.last,
    role,
    badge,
    intro: role + " · " + user.location.country + " " + user.location.city + "에서 합류했어요!",
    description: user.name.first + "는 " + role + " 파트에 관심이 있으며, " + badge + "를 배우고 있습니다.",
    email: user.email,
    phone: user.phone,
    website: "https://example.com",
    image: user.picture.large,
    comment: "데이터가 바뀌면 화면도 바뀐다!",
  };
}

// 사용
setFormData(userToFormData(data.results[0]));
```

이렇게 분리하면 `makeNextOrder`/`createdAt`/`id` 같은 "실제 멤버용 필드"가 폼에 섞이지 않아 깔끔합니다.

## 4. visibleMembers의 isMe 정렬이 sortType을 부분적으로 덮어씀

```
const visibleMembers = useMemo(() => {
  let result = [...memberList];
  ...
  if (sortType === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortType === "latest") {
    result.sort((a, b) => b.createdAt - a.createdAt);
  }

  result.sort((a, b) => {
    if (a.isMe) return -1;
    if (b.isMe) return 1;
    return 0;
  });

  return result;
}, [memberList, partFilter, sortType, searchText]);
```

- 마지막 `result.sort`로 본인 카드를 무조건 최상단에 둡니다.
- 의도가 "본인 카드는 정렬과 무관하게 항상 위"라면 OK. 하지만 코드만 봤을 때는 sortType 효과를 덮어쓰는 것처럼 보입니다.
- JavaScript의 Array.sort는 안정 정렬(Stable)이라 같은 isMe 값끼리는 이전 정렬 순서가 유지되긴 합니다.

### 해결 - 의도가 본인 강제 최상단이라면 한 번에 정렬

```
result.sort((a, b) => {
  // 1) 본인이 항상 위
  if (a.isMe !== b.isMe) {
    return a.isMe ? -1 : 1;
  }
  // 2) 같은 그룹 안에서는 sortType대로
  if (sortType === "name") {
    return a.name.localeCompare(b.name);
  }
  return b.createdAt - a.createdAt;
});
```

- 비교 함수 하나에 isMe 우선순위 + sortType 정렬을 같이 처리하면 의도가 명확.
- 그리고 sort 호출이 3번에서 1번으로 줄어듦.

### 해결 - 의도가 본인 강제 최상단이 아니라면 마지막 sort 제거

```
// 마지막 isMe sort 블록 통째로 삭제
// result.sort((a, b) => {
//   if (a.isMe) return -1;
//   if (b.isMe) return 1;
//   return 0;
// });
```

- 본인 카드는 `styles.mainCard`로 시각 강조만 하고 위치는 정렬에 맡김.

## 6. statusText 자동 reset 없음

```
.then((data) => {
  ...
  setStatusText("완료!");
})
```

- 성공 후 "완료!" 메시지가 영구적으로 화면에 남습니다 (다음 fetch 호출 전까지).
- 디자인 선택일 수 있지만, 사용자에게는 "지금도 작업 중인가?" 같은 혼동을 줄 수 있음.

### 해결 - 일정 시간 후 "준비 완료"로 자동 복귀

```
const statusResetTimerRef = useRef(null);

.then((data) => {
  ...
  setStatusText("완료!");

  if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
  statusResetTimerRef.current = setTimeout(() => {
    setStatusText("준비 완료");
  }, 2000);
})

// cleanup
useEffect(() => {
  return () => {
    if (latestControllerRef.current) latestControllerRef.current.abort();
    if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
  };
}, []);
```

## 7. handleRefreshAll의 "새로고침할 랜덤 멤버가 없습니다" 메시지도 영구 표시

```
const handleRefreshAll = () => {
  const myCards = memberList.filter((member) => member.isMe);
  const fetchCount = memberList.length - myCards.length;

  if (fetchCount <= 0) {
    setStatusText("새로고침할 랜덤 멤버가 없습니다.");
    return;
  }
  ...
};
```

- 이 메시지도 다음 fetch 호출 전까지 화면에 남습니다.
- 6번 항목의 자동 reset 패턴을 같이 적용하면 자연스러움.

### 해결

- 같은 statusResetTimerRef를 활용

```
if (fetchCount <= 0) {
  setStatusText("새로고침할 랜덤 멤버가 없습니다.");

  if (statusResetTimerRef.current) clearTimeout(statusResetTimerRef.current);
  statusResetTimerRef.current = setTimeout(() => {
    setStatusText("준비 완료");
  }, 2000);
  return;
}
```

## 8. error.message에 raw HTTP 메시지 노출

```
.catch((error) => {
  ...
  setStatusText("불러오기 실패: " + error.message);
});
```

- "HTTP 503" 같은 raw 메시지가 사용자에게 그대로 노출됩니다.
- 개발자가 봤을 때는 유용하지만, 일반 사용자에게는 불친절.

### 해결 - 사용자용 메시지로 매핑

```
.catch((error) => {
  if (requestId !== latestRequestIdRef.current) return;

  if (error.name === "AbortError" && timedOut) {
    setHasError(true);
    setStatusText("불러오기 실패: 시간 초과");
    return;
  }

  if (error.name === "AbortError") return;

  // HTTP 코드는 콘솔에만 남기고, 사용자에게는 친절한 메시지
  console.error("Fetch error:", error);
  setHasError(true);
  setStatusText("불러오기 실패: 잠시 후 다시 시도해주세요.");
});
```

## 9. CSS Modules camelCase 통일 일관성

```
// 거의 camelCase로 잘 되어 있음
styles.weekPage, styles.controlArea, styles.controlRow, styles.button
styles.cardContainer, styles.mainCard, styles.cardImage, styles.cardContent
styles.detailSection, styles.detailTitle, styles.detailList, styles.detailCard
styles.formBox, styles.formButtons
```

- 5주차 코드 기준 거의 camelCase로 잘 정리되어 있습니다.
- 이미 잘 따르고 있어 추가 수정 불필요.

## 10. 카드/상세 분리 - 모달 패턴은 디자인 선택

- 4주차 정답 코드는 카드와 상세 리스트를 따로 보여주는 구조였고, 일부 사람은 카드 클릭 → 모달/스크롤로 상세를 보는 패턴을 선택했습니다.
- 현재 코드는 정답 코드 구조 그대로 - 카드 위, 상세 리스트 아래.
- 동작 문제 없음.

### 선택사항

- 카드 클릭 시 상세 모달 또는 상세 카드로 스크롤을 추가하면 UX 개선.
