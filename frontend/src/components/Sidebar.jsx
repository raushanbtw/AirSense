import {
  LayoutDashboard,
  Bell,
  HeartPulse,
  History,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Logo from "./Logo";

const ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { id: "alerts", label: "Alerts & Notifications", icon: Bell, enabled: false },
  { id: "profile", label: "My Health Profile", icon: HeartPulse, enabled: true },
  { id: "history", label: "Exposure History", icon: History, enabled: false },
  { id: "settings", label: "Settings", icon: Settings, enabled: false },
];

function Sidebar({ page, onNavigate, collapsed, onToggle }) {
  const ToggleIcon = collapsed ? ChevronsRight : ChevronsLeft;

  return (
    <nav className={"sidebar" + (collapsed ? " collapsed" : "")}>
      {/* Logo on the left, hide/show button on the right (symbol only) */}
      <div className="brand-row">
        <Logo className="brand-logo" />

        <button
          className="collapse-btn"
          onClick={onToggle}
          title={collapsed ? "Show sidebar" : "Hide sidebar"}
          aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
        >
          <ToggleIcon size={18} />
        </button>
      </div>

      <ul>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className={page === item.id ? "active" : ""}>
              <button
                className="nav-btn"
                disabled={!item.enabled}
                title={item.enabled ? item.label : "Coming in a later milestone"}
                onClick={() => item.enabled && onNavigate(item.id)}
              >
                <Icon size={20} />
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Sidebar;