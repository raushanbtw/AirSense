const axios = require("axios");

function numberOrNull(value, min, max) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value < min || value > max) return null; // reject impossible values
  return value;
}

async function getWeather(lat, lon) {
  const { data } = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
    params: { lat, lon, units: "metric", appid: process.env.WEATHER_API_KEY },
    timeout: 8000,
  });

  return {
    source: "openweathermap",
    temperature: numberOrNull(data.main?.temp, -90, 60), // °C
    humidity: numberOrNull(data.main?.humidity, 0, 100), // %
    pressure: numberOrNull(data.main?.pressure, 800, 1100), // hPa
    windSpeed: numberOrNull(data.wind?.speed, 0, 120), // m/s
    rainfall: numberOrNull(data.rain?.["1h"] ?? 0, 0, 500), // mm in the last hour
    visibility: numberOrNull(data.visibility, 0, 100000), // metres
    condition: data.weather?.[0]?.description || null,
    stationName: data.name || null,
    timestamp: data.dt ? new Date(data.dt * 1000).toISOString() : null,
    units: {
      temperature: "°C",
      humidity: "%",
      pressure: "hPa",
      windSpeed: "m/s",
      rainfall: "mm",
      visibility: "m",
    },
  };
}

module.exports = { getWeather };