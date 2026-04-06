import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar/Navbar";
import Home from "./components/Home/Home";
import TaeyeopPage from "./taeyeop/Page";
import JuwanPage from "./juwan/Page";
import DoyoungPage from "./doyoung/Page";
import NahamPage from "./naham/Page";
import TaewooPage from "./taewoo/Page";
import SominPage from "./somin/Page";
import DoeunPage from "./doeun/Page";
import SeoyunPage from "./seoyun/Page";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/taeyeop/*" element={<TaeyeopPage />} />
        <Route path="/juwan/*" element={<JuwanPage />} />
        <Route path="/doyoung/*" element={<DoyoungPage />} />
        <Route path="/naham/*" element={<NahamPage />} />
        <Route path="/taewoo/*" element={<TaewooPage />} />
        <Route path="/somin/*" element={<SominPage />} />
        <Route path="/doeun/*" element={<DoeunPage />} />
        <Route path="/seoyun/*" element={<SeoyunPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
