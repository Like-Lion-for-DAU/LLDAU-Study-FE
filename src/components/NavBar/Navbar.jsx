import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../assets/header/logo.png";

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
    <nav className={styles["navbar"]}>
      <div className={styles["navbar-inner"]}>
        <NavLink to="/" className={styles["navbar-logo"]}>
          <img src={logo} alt="logo" className={styles["navbar-logo-img"]} />
          LLDAU Study
        </NavLink>
        <div className={`${styles["navbar-links"]} ${menuOpen ? styles["open"] : ""}`}>
          {members.map((m) => (
            <div key={m.path} className={styles["navbar-dropdown"]}>
              <NavLink
                to={m.path}
                className={({ isActive }) =>
                  `${styles["navbar-link"]} ${isActive ? styles["active"] : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {m.name}
              </NavLink>
              <div className={styles["navbar-dropdown-menu"]}>
                {weeks.map((week) => (
                  <Link
                    key={week}
                    to={`${m.path}/week${week}`}
                    className={styles["navbar-dropdown-item"]}
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
          className={styles["navbar-hamburger"]}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={styles["hamburger-line"]} />
          <span className={styles["hamburger-line"]} />
          <span className={styles["hamburger-line"]} />
        </button>
      </div>
    </nav>
  );
}
