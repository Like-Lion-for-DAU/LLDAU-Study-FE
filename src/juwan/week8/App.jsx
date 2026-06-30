import { Navigate, Route, Routes } from "react-router-dom";
import Week8Page from "./Page";

export default function Week8App() {
  return (
    <Routes>
      <Route index element={<Week8Page />} />
      <Route path="lions/:memberId" element={<Week8Page />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}