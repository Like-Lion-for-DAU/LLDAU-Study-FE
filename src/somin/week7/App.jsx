import { Routes, Route } from "react-router-dom";
import Week7Page from "./Page";
import DetailPage from "./DetailPage";
import NotFoundPage from "./NotFoundPage";
import Layout from "./Layout";

export default function Week7App({ membersList, setMembersList }) {
  return (
    <Routes>
      <Route element={<Layout membersList={membersList} />}>
        <Route index element={<Week7Page membersList={membersList} setMembersList={setMembersList} />} />
        <Route path="lions/:id" element={<DetailPage membersList={membersList} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}