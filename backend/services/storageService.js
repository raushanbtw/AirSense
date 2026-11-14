const { Point } = require("@influxdata/influxdb-client");
const { writeApi } = require("../config/influx");

// Add a number field only if it is a real number
function addFloat(point, name, value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    point.floatField(name, value);
    return true;
  }
  return false;
}

function validTime(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function locationKey(lat, lon) {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

async function storeEnvironment(env) {
  const { latitude, longitude } = env.location;
  const loc = locationKey(latitude, longitude);
  const points = [];

  // OpenAQ pollutants (µg/m³)
  const openaq = env.airQuality?.openaq;
  if (openaq) {
    for (const [pollutant, p] of Object.entries(openaq.pollutants)) {
      const time = validTime(p.timestamp);
      if (!time) continue;
      const point = new Point("air_quality")
        .tag("source", "openaq")
        .tag("pollutant", pollutant)
        .tag("unit", p.unit)
        .tag("station", p.station)
        .tag("location_key", loc);
      if (addFloat(point, "value", p.value)) points.push(point.timestamp(time));
    }
  }

  // WAQI overall AQI and pollutant sub-indices
  const waqi = env.airQuality?.waqi;
  if (waqi) {
    const time = validTime(waqi.timestamp);
    if (time) {
      const entries = { aqi: waqi.aqi, ...waqi.pollutants };
      for (const [pollutant, value] of Object.entries(entries)) {
        const point = new Point("air_quality")
          .tag("source", "waqi")
          .tag("pollutant", pollutant)
          .tag("unit", "AQI")
          .tag("station", waqi.station?.name || "unknown")
          .tag("location_key", loc);
        if (addFloat(point, "value", value)) points.push(point.timestamp(time));
      }
    }
  }

  // Weather
  const w = env.weather;
  if (w) {
    const time = validTime(w.timestamp);
    if (time) {
      const point = new Point("weather")
        .tag("source", w.source || "unknown")
        .tag("station", w.stationName || "unknown")
        .tag("location_key", loc);
      let fields = 0;
      fields += addFloat(point, "temperature", w.temperature);
      fields += addFloat(point, "humidity", w.humidity);
      fields += addFloat(point, "pressure", w.pressure);
      fields += addFloat(point, "wind_speed", w.windSpeed);
      fields += addFloat(point, "rainfall", w.rainfall);
      fields += addFloat(point, "visibility", w.visibility);
      if (fields > 0) points.push(point.timestamp(time));
    }
  }

  // Traffic
  const t = env.traffic;
  if (t) {
    const time = validTime(t.timestamp);
    if (time) {
      const point = new Point("traffic")
        .tag("source", t.source || "unknown")
        .tag("road_class", t.roadClass || "unknown")
        .tag("location_key", loc)
        .booleanField("road_closure", Boolean(t.roadClosure));
      addFloat(point, "current_speed", t.currentSpeed);
      addFloat(point, "free_flow_speed", t.freeFlowSpeed);
      addFloat(point, "current_travel_time", t.currentTravelTime);
      addFloat(point, "free_flow_travel_time", t.freeFlowTravelTime);
      addFloat(point, "congestion_ratio", t.congestionRatio);
      addFloat(point, "confidence", t.confidence);
      points.push(point.timestamp(time));
    }
  }

  if (points.length === 0) return 0;

  writeApi.writePoints(points);
  await writeApi.flush();
  return points.length;
}

module.exports = { storeEnvironment };