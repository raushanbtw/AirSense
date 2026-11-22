import { Cloud, Flame, FlaskConical, Waves, Grip } from "lucide-react";

const ITEMS = [
  { key: "o3", name: "O₃", note: "Ground-level ozone that can irritate the lungs", icon: Cloud, tint: "tint-blue" },
  { key: "co", name: "CO", note: "A harmful gas from incomplete combustion", icon: Flame, tint: "tint-green" },
  { key: "no2", name: "NO₂", note: "A gas from vehicles and industrial emissions", icon: FlaskConical, tint: "tint-purple" },
  { key: "pm25", name: "PM2.5", note: "Very small particles that can enter deep into the lungs", icon: Waves, tint: "tint-pink" },
  { key: "pm10", name: "PM10", note: "Larger particles that can affect breathing", icon: Grip, tint: "tint-yellow" },
];

function pick(data, key) {
  const raw = data?.airQuality?.openaq?.pollutants?.[key];
  if (raw && typeof raw.value === "number") {
    return {
      value: raw.value,
      unit: raw.unit,
      source: `${raw.station} (${raw.distanceKm} km)`,
    };
  }

  const index = data?.airQuality?.waqi?.pollutants?.[key];
  if (typeof index === "number") {
    return { value: index, unit: "AQI sub-index", source: "WAQI" };
  }

  return null;
}

function PollutantCards({ data }) {
  return (
    <div className="pollutant-grid">
      {ITEMS.map((item) => {
        const reading = pick(data, item.key);
        const Icon = item.icon;

        return (
          <div key={item.key} className={`card pollutant ${item.tint}`}>
            <div className="pollutant-head">
              <Icon size={28} />
              <strong className="pollutant-name">{item.name}</strong>
            </div>

            <p className="small pollutant-desc">{item.note}</p>

            <div className="pollutant-value">
              {reading ? (
                <>
                  <span className="pollutant-number">{reading.value}</span>
                  <small>{reading.unit}</small>
                </>
              ) : (
                <small>No data</small>
              )}
            </div>

            {reading && <p className="tiny">{reading.source}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default PollutantCards;