import { aqiCategory, formatTime } from "../utils/aqiColors";

const NAMES = { pm25: "PM2.5", pm10: "PM10", no2: "NO2", o3: "O3", co: "CO", so2: "SO2" };

function AqiCard({ data, loading, error, hasLocation }) {
  if (!hasLocation) {
    return (
      <section className="card">
        <h2>Air Quality</h2>
        <p>Share your location to see air quality.</p>
      </section>
    );
  }
  if (loading) {
    return (
      <section className="card">
        <h2>Air Quality</h2>
        <p>Loading air quality...</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="card">
        <h2>Air Quality</h2>
        <p className="error">{error}</p>
      </section>
    );
  }
  if (!data) return null;

  const waqi = data.airQuality?.waqi;
  const openaq = data.airQuality?.openaq;
  const category = aqiCategory(waqi?.aqi);
  const rows = openaq ? Object.entries(openaq.pollutants) : [];

  return (
    <section className="card">
      <h2>Air Quality</h2>

      {waqi ? (
        <>
          <div className="aqi-badge" style={{ background: category.color }}>
            AQI {waqi.aqi ?? "n/a"}
          </div>
          <p>
            <strong>{category.label}</strong>
            {waqi.dominantPollutant && <> · main pollutant {NAMES[waqi.dominantPollutant] || waqi.dominantPollutant}</>}
          </p>
          <p className="small">
            {waqi.station?.name}, {formatTime(waqi.timestamp)}
          </p>
        </>
      ) : (
        <p>Overall AQI is unavailable right now.</p>
      )}

      {rows.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Pollutant</th>
              <th>Value</th>
              <th>Station</th>
              <th>Measured</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, p]) => (
              <tr key={name}>
                <td>{NAMES[name] || name}</td>
                <td>
                  {p.value} {p.unit}
                </td>
                <td>
                  {p.station} ({p.distanceKm} km)
                </td>
                <td>{formatTime(p.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="small">Detailed pollutant readings are unavailable.</p>
      )}
    </section>
  );
}

export default AqiCard;