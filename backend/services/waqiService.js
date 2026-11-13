const axios = require("axios");

const POLLUTANTS = ["pm25", "pm10", "no2", "o3", "co", "so2"];

async function getWaqiAirQuality(lat, lon) {
  const url = `https://api.waqi.info/feed/geo:${lat};${lon}/`;

  const { data } = await axios.get(url, {
    params: { token: process.env.WAQI_TOKEN },
    timeout: 8000,
  });

  if (data.status !== "ok") {
    throw new Error("WAQI has no data for this location");
  }

  const d = data.data;
  const iaqi = d.iaqi || {};

  const pollutants = {};
  for (const name of POLLUTANTS) {
    if (iaqi[name] && typeof iaqi[name].v === "number") {
      pollutants[name] = iaqi[name].v;
    }
  }

  return {
    source: "waqi",
    aqi: typeof d.aqi === "number" ? d.aqi : null,
    dominantPollutant: d.dominentpol || null,
    pollutantUnit: "AQI sub-index",
    pollutants,
    station: {
      name: d.city?.name || null,
      latitude: d.city?.geo?.[0] ?? null,
      longitude: d.city?.geo?.[1] ?? null,
    },
    timestamp: d.time?.iso || null,
  };
}

module.exports = { getWaqiAirQuality };