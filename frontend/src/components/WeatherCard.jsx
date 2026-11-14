import { formatTime } from "../utils/aqiColors";

function Row({ label, value, unit }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{value === null || value === undefined ? "n/a" : `${value} ${unit}`}</td>
    </tr>
  );
}

function WeatherCard({ data, loading, error, hasLocation }) {
  const weather = data?.weather;

  return (
    <section className="card">
      <h2>Weather</h2>

      {!hasLocation && <p>Share your location to see the weather.</p>}
      {hasLocation && loading && <p>Loading weather...</p>}
      {hasLocation && error && <p className="error">{error}</p>}
      {hasLocation && !loading && !error && data && !weather && (
        <p>Weather is unavailable right now.</p>
      )}

      {weather && (
        <>
          <p>
            <strong>{weather.condition}</strong> in {weather.stationName}
          </p>
          <table className="table">
            <tbody>
              <Row label="Temperature" value={weather.temperature} unit="°C" />
              <Row label="Humidity" value={weather.humidity} unit="%" />
              <Row label="Wind speed" value={weather.windSpeed} unit="m/s" />
              <Row label="Pressure" value={weather.pressure} unit="hPa" />
              <Row label="Rainfall (1 h)" value={weather.rainfall} unit="mm" />
            </tbody>
          </table>
          <p className="small">Updated {formatTime(weather.timestamp)}</p>
        </>
      )}
    </section>
  );
}

export default WeatherCard;