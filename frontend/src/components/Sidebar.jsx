const ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "profile", label: "Profile" },
];

function Sidebar({ page, onNavigate }) {
  return (
    <nav className="sidebar">
      <ul>
        {ITEMS.map((item) => (
          <li key={item.id} className={page === item.id ? "active" : ""}>
            <button className="nav-btn" onClick={() => onNavigate(item.id)}>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;