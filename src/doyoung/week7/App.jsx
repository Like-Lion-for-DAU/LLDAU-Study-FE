import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { members as initialMembers } from "./members";
import WeekPage from "./Page";
import DetailPage from "./DetailPage";
import NotFoundPage from "./NotFoundPage";

function App() {
  const [members, setMembers] = useState(initialMembers);

  return (
    <Routes>
      <Route
        index
        element={<WeekPage members={members} setMembers={setMembers} />}
      />
      <Route path=":id" element={<DetailPage members={members} />} />
      <Route path=":id/*" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;

//왜 안되죠..?
//코드 엉망진창...
//코드 정리하고 싶다...
