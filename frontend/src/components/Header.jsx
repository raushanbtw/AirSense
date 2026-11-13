function Header({ status }) {
  return (
    <header className="header">
      <h1>AirSense</h1>
      <span className="status">Backend: {status}</span>
    </header>
  );
}

export default Header;