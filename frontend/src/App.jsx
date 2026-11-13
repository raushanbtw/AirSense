import { useEffect, useState } from "react";
import { api } from "./api";

function App() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("Backend not reachable"));
  }, []);

  return (
    <div>
      <h1>AirSense</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

export default App;