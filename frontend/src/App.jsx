import { useEffect, useState } from "react";
import { api } from "./api";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import useUserProfile from "./hooks/useUserProfile";
import useTheme from "./hooks/useTheme";

const SIDEBAR_KEY = "airsense_sidebar";

function readCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "collapsed";
  } catch {
    return false;
  }
}

function App() {
  const [status, setStatus] = useState("checking...");
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const profile = useUserProfile();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("not reachable"));
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "open");
    } catch {
      // ignore: the choice just won't survive a reload
    }
  };

  return (
    <div className="app">
      <Sidebar
        page={page}
        onNavigate={setPage}
        collapsed={collapsed}
        onToggle={toggleSidebar}
      />

      <div className="main">
        <Header
          status={status}
          userName={profile.user?.name}
          theme={theme}
          onTheme={setTheme}
        />
        <div className="content">
          <div hidden={page !== "dashboard"}>
            <Dashboard user={profile.user} />
          </div>
          <div hidden={page !== "profile"}>
            <Profile profile={profile} />
          </div>
        </div>
      </div>

      <BottomNav page={page} onNavigate={setPage} />
    </div>
  );
}

export default App;