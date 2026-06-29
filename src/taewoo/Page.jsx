import { Routes, Route } from "react-router-dom";
import styles from "./Page.module.css";
import Week1Page from "./week1/Page";
import Week2Page from "./week2/Page";
import Week3Page from "./week3/Page";
import Week4Page from "./week4/Page";
import Week5Page from "./week5/Page";
import Week6Page from "./week6/Page";
import Week7Router from "./week7/Router";
import Week8Router from "./week8/Router";
import Week9Page from "./week9/Page";
import Week10Page from "./week10/Page";

export default function TaewooPage() {
  return (
    <div className={styles["taewoo-page"]}>
      <Routes>
        <Route index element={<h2>백태우</h2>} />
        <Route path="week1" element={<Week1Page />} />
        <Route path="week2" element={<Week2Page />} />
        <Route path="week3" element={<Week3Page />} />
        <Route path="week4" element={<Week4Page />} />
        <Route path="week5" element={<Week5Page />} />
        <Route path="week6" element={<Week6Page />} />
        <Route path="week7/*" element={<Week7Router />} />
        <Route path="week8/*" element={<Week8Router />} />
        <Route path="week9/*" element={<Week9Page />} />
        <Route path="week10/*" element={<Week10Page />} />
      </Routes>
    </div>
  );
}
