import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import "./Navbar.css";

const weeks = Array.from({ length: 10 }, (_, i) => i + 1);

const members = [
  { path: "/taeyeop", name: "이태엽" },
  { path: "/juwan", name: "김주완" },
  { path: "/doyoung", name: "임도영" },
  { path: "/naham", name: "김나함" },
  { path: "/taewoo", name: "백태우" },
  { path: "/somin", name: "정소민" },
  { path: "/doeun", name: "이도은" },
  { path: "/seoyun", name: "정서윤" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <img src="/image/logo.png" alt="logo" className="navbar-logo-img" />
          LLDAU Study
        </NavLink>
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {members.map((m) => (
            <div key={m.path} className="navbar-dropdown">
              <NavLink
                to={m.path}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? "active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {m.name}
              </NavLink>
              <div className="navbar-dropdown-menu">
                {weeks.map((week) => (
                  <Link
                    key={week}
                    to={`${m.path}/week${week}`}
                    className="navbar-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    {week}주차
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>
    </nav>
  );
}
