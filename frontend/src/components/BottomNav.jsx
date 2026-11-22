import { LayoutDashboard, Bell, HeartPulse } from "lucide-react";

const ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, enabled: true },
  { id: "alerts", label: "Notifications", icon: Bell, enabled: false },
  { id: "profile", label: "Profile", icon: HeartPulse, enabled: true },
];

function BottomNav({ page, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={"bn-item" + (page === item.id ? " active" : "")}
            disabled={!item.enabled}
            title={item.enabled ? item.label : "Coming in a later milestone"}
            onClick={() => item.enabled && onNavigate(item.id)}
          >
            <Icon size={22} />
            <span className="bn-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;