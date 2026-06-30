import React, { useState } from "react";
import { Routes, Route, Outlet, Link, useLocation } from "react-router-dom";
import { members as initialMembers } from "./script.js";
import styles from "./Page.module.css";
import ListPage from "./ScrollPage";
import DetailPage from "./DetailPage";

function NotFound() {
  return (
    <div className={styles["notFoundPage"]}>
      <h2>페이지를 찾을 수 없습니다</h2>
      <Link to="/taewoo/week7">← 목록으로 돌아가기</Link>
    </div>
  );
}

function Layout({ context }) {
  const location = useLocation();
  const isList =
    location.pathname === "/taewoo/week7" ||
    location.pathname === "/taewoo/week7/";
  return (
    <div>
      <header className={styles["week7Header"]}>
        <Link to="/taewoo/week7" className={styles["week7HeaderTitle"]}>
          아기사자 명단
        </Link>
        <span className={styles["week7HeaderCount"]}>
          총 {context.memberList.length}명
        </span>
        {!isList && (
          <Link to="/taewoo/week7" className={styles["week7HeaderBack"]}>
            ← 목록으로
          </Link>
        )}
      </header>
      <Outlet context={context} />
    </div>
  );
}

export default function Week7Router() {
  const [memberList, setMemberList] = useState(initialMembers);
  const context = { memberList, setMemberList };
  return (
    <Routes>
      <Route element={<Layout context={context} />}>
        <Route index element={<ListPage />} />
        <Route path="lions/:id" element={<DetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
