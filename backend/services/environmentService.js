const { getOpenAqAirQuality } = require("./openaqService");
const { getWaqiAirQuality } = require("./waqiService");
const { getWeather } = require("./weatherService");
const { getTraffic } = require("./trafficService");
const { toUtcIso } = require("../utils/clean");

async function getEnvironment(lat, lon) {
  const names = ["openaq", "waqi", "weather", "traffic"];

  const results = await Promise.allSettled([
    getOpenAqAirQuality(lat, lon),
    getWaqiAirQuality(lat, lon),
    getWeather(lat, lon),
    getTraffic(lat, lon),
  ]);

  const [openaq, waqi, weather, traffic] = results.map((r) =>
    r.status === "fulfilled" ? r.value : null
  );

  const errors = results
    .map((r, i) =>
      r.status === "rejected" ? { source: names[i], message: r.reason.message } : null
    )
    .filter(Boolean);

  errors.forEach((e) => console.error(`${e.source} error:`, e.message));

  // Make every timestamp UTC
  if (openaq) {
    for (const p of Object.values(openaq.pollutants)) {
      p.timestamp = toUtcIso(p.timestamp);
    }
  }
  if (waqi) waqi.timestamp = toUtcIso(waqi.timestamp);
  if (weather) weather.timestamp = toUtcIso(weather.timestamp);
  if (traffic) traffic.timestamp = toUtcIso(traffic.timestamp);

  return {
    location: { latitude: lat, longitude: lon },
    collectedAt: new Date().toISOString(),
    airQuality: { openaq, waqi },
    weather,
    traffic,
    unavailable: errors.map((e) => e.source),
    errors,
  };
}

module.exports = { getEnvironment };