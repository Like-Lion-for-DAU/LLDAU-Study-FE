import { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import type { Dispatch, SetStateAction } from "react";
import { members as initialMembers } from "./script.ts";
import type { Member } from "./script.ts";
import ScrollPage from "./ScrollPage.tsx";
import GridPage from "./GridPage.tsx";

interface RouterContext {
  memberList: Member[];
  setMemberList: Dispatch<SetStateAction<Member[]>>;
}

function Layout({ context }: { context: RouterContext }) {
  return <Outlet context={context} />;
}

export default function Week8Router() {
  const [memberList, setMemberList] = useState<Member[]>(initialMembers);
  const context: RouterContext = { memberList, setMemberList };
  return (
    <Routes>
      <Route element={<Layout context={context} />}>
        <Route index element={<ScrollPage />} />
        <Route path="list" element={<GridPage />} />
      </Route>
    </Routes>
  );
}
