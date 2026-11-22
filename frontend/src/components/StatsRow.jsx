import { Gauge, MapPin, Thermometer, Droplets, Wind } from "lucide-react";

function nearestMonitor(data) {
  const candidates = [];

  const waqi = data?.airQuality?.waqi;
  if (waqi?.station?.name && typeof waqi.station.distanceKm === "number") {
    candidates.push({ name: waqi.station.name, km: waqi.station.distanceKm });
  }

  const openaq = data?.airQuality?.openaq?.pollutants;
  if (openaq) {
    for (const p of Object.values(openaq)) {
      if (typeof p.distanceKm === "number") {
        candidates.push({ name: p.station, km: p.distanceKm });
      }
    }
  }

  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => a.km - b.km)[0];
}

function show(value, unit) {
  return typeof value === "number" ? `${value} ${unit}` : "n/a";
}

function Stat({ icon: Icon, tint, title, children }) {
  return (
    <div className={`card stat ${tint}`}>
      <div className="icon-bubble">
        <Icon size={22} />
      </div>
      <div>
        <span className="stat-title">{title}</span>
        <strong className="stat-value">{children}</strong>
      </div>
    </div>
  );
}

function StatsRow({ data }) {
  const weather = data?.weather;
  const monitor = nearestMonitor(data);

  return (
    <section className="stats">
      <Stat icon={Gauge} tint="tint-grey" title="Forecast Accuracy">
        Not available yet
        <small className="tiny block">Needs the model (Milestone 2)</small>
      </Stat>

      <Stat icon={MapPin} tint="tint-blue" title="Nearest Monitor">
        {monitor ? `${monitor.name}` : "n/a"}
        {monitor && <small className="tiny block">{monitor.km} km away</small>}
      </Stat>

      <Stat icon={Thermometer} tint="tint-red" title="Temperature">
        {show(weather?.temperature, "°C")}
      </Stat>

      <Stat icon={Droplets} tint="tint-teal" title="Humidity">
        {show(weather?.humidity, "%")}
      </Stat>

      <Stat icon={Wind} tint="tint-purple" title="Wind Speed">
        {show(weather?.windSpeed, "m/s")}
      </Stat>
    </section>
  );
}

export default StatsRow;