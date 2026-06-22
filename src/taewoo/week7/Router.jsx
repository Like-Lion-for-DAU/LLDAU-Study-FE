import React from "react";
import { Routes, Route } from "react-router-dom";
import Week7Page from "./ScrollPage";
import GridPage from "./GridPage";

export default function Week7Router() {
    return (
        <Routes>
            <Route index element={<Week7Page />} />
            <Route path="list" element={<GridPage />} />
        </Routes>
    );
}
