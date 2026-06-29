import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollPage from "./ScrollPage";
import GridPage from "./GridPage";

export default function Week8Router() {
    return (
        <Routes>
            <Route index element={<ScrollPage />} />
            <Route path="list" element={<GridPage />} />
        </Routes>
    );
}