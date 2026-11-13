import useLocation from "../hooks/useLocation";
import LocationCard from "../components/LocationCard";

function Dashboard() {
  const { coords, error, loading, requestLocation } = useLocation();

  return (
    <main className="dashboard">
      <LocationCard
        coords={coords}
        error={error}
        loading={loading}
        onRequest={requestLocation}
      />

      <section className="card">
        <h2>Air Quality</h2>
        <p>AQI and pollutant readings will appear here.</p>
      </section>

      <section className="card">
        <h2>Weather</h2>
        <p>Weather information will appear here.</p>
      </section>

      <section className="card">
        <h2>Analytics</h2>
        <p>Trends and forecasts will appear here in a later milestone.</p>
      </section>
    </main>
  );
}

export default Dashboard;