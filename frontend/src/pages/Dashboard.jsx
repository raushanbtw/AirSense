import useLocation from "../hooks/useLocation";
import useEnvironment from "../hooks/useEnvironment";
import LocationCard from "../components/LocationCard";
import AqiCard from "../components/AqiCard";
import WeatherCard from "../components/WeatherCard";

function Dashboard() {
  const location = useLocation();
  const environment = useEnvironment(location.coords);
  const hasLocation = Boolean(location.coords);
  const traffic = environment.data?.traffic;

  return (
    <main className="dashboard">
      <LocationCard
        coords={location.coords}
        error={location.error}
        loading={location.loading}
        onRequest={location.requestLocation}
      />

      <AqiCard
        data={environment.data}
        loading={environment.loading}
        error={environment.error}
        hasLocation={hasLocation}
      />

      <WeatherCard
        data={environment.data}
        loading={environment.loading}
        error={environment.error}
        hasLocation={hasLocation}
      />

      <section className="card">
        <h2>Traffic</h2>
        {!hasLocation && <p>Share your location to see traffic.</p>}
        {hasLocation && !traffic && !environment.loading && (
          <p>Traffic data is unavailable for this location.</p>
        )}
        {traffic && (
          <p>
            Congestion: <strong>{traffic.congestionLevel}</strong>
            <br />
            Speed {traffic.currentSpeed} km/h (normal {traffic.freeFlowSpeed} km/h)
          </p>
        )}
      </section>

      <section className="card">
        <h2>Analytics</h2>
        <p>Trends and forecasts will appear here in a later milestone.</p>
      </section>
    </main>
  );
}

export default Dashboard;