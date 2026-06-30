import { Routes, Route } from "react-router-dom";
import Week8Page from "./Page";
import DetailPage from "./DetailPage";
import NotFoundPage from "./NotFoundPage";
import Layout from "./Layout";
import type { Member } from "./types";

interface AppProps {
  membersList: Member[];
  setMembersList: React.Dispatch<React.SetStateAction<Member[]>>;
}

export default function Week7App({ membersList, setMembersList }: AppProps) {
  return (
    <Routes>
      <Route element={<Layout membersList={membersList} />}>
        <Route
          index
          element={
            <Week8Page
              membersList={membersList}
              setMembersList={setMembersList}
            />
          }
        />
        <Route path="lions/:id" element={<DetailPage membersList={membersList} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}