const axios = require("axios");
const { distanceKm } = require("../utils/geo");

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

  const stationLat = d.city?.geo?.[0];
  const stationLon = d.city?.geo?.[1];
  const hasPosition = typeof stationLat === "number" && typeof stationLon === "number";

  return {
    source: "waqi",
    aqi: typeof d.aqi === "number" ? d.aqi : null,
    dominantPollutant: d.dominentpol || null,
    pollutantUnit: "AQI sub-index",
    pollutants,
    station: {
      name: d.city?.name || null,
      latitude: hasPosition ? stationLat : null,
      longitude: hasPosition ? stationLon : null,
      distanceKm: hasPosition
        ? Math.round(distanceKm(lat, lon, stationLat, stationLon) * 10) / 10
        : null,
    },
    timestamp: d.time?.iso || null,
  };
}

module.exports = { getWaqiAirQuality };