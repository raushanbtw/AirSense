import { useEffect, useState } from "react";
import { api } from "./api";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import useUserProfile from "./hooks/useUserProfile";

function App() {
  const [status, setStatus] = useState("checking...");
  const [page, setPage] = useState("dashboard");
  const profile = useUserProfile();

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("not reachable"));
  }, []);

  return (
    <div className="app">
      <Header status={status} userName={profile.user?.name} />
      <div className="body">
        <Sidebar page={page} onNavigate={setPage} />
        <div className="content">
          <div hidden={page !== "dashboard"}>
            <Dashboard user={profile.user} />
          </div>
          <div hidden={page !== "profile"}>
            <Profile profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;