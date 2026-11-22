import { Moon, Sun, User } from "lucide-react";
import Logo from "./Logo";

function Header({ status, userName, theme, onTheme }) {
  return (
    <header className="topbar">
      <Logo className="topbar-logo" />

      <div className="topbar-right">
        <div className="theme-toggle" role="group" aria-label="Colour theme">
          <button
            type="button"
            className={theme === "light" ? "on" : ""}
            onClick={() => onTheme("light")}
            aria-pressed={theme === "light"}
            title="Light mode"
          >
            <Sun size={16} />
          </button>
          <button
            type="button"
            className={theme === "dark" ? "on" : ""}
            onClick={() => onTheme("dark")}
            aria-pressed={theme === "dark"}
            title="Dark mode"
          >
            <Moon size={16} />
          </button>
        </div>

        <span className="chip">Backend: {status}</span>
        <span className="chip">
          <User size={14} /> {userName || "Guest"}
        </span>
      </div>
    </header>
  );
}

export default Header;