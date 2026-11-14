function Header({ status, userName }) {
  return (
    <header className="header">
      <h1>AirSense</h1>
      <span className="status">
        {userName ? `${userName} · ` : ""}Backend: {status}
      </span>
    </header>
  );
}

export default Header;