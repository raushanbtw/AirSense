import { useEffect, useState } from "react";
import { api } from "./api";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("not reachable"));
  }, []);

  return (
    <div className="app">
      <Header status={status} />
      <div className="body">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;