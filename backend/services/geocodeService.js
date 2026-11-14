const axios = require("axios");

async function searchPlaces(q) {
  const { data } = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
    params: { q, limit: 5, appid: process.env.WEATHER_API_KEY },
    timeout: 8000,
  });

  const list = Array.isArray(data) ? data : [];

  return list
    .filter((p) => typeof p.lat === "number" && typeof p.lon === "number")
    .map((p) => ({
      name: p.name,
      state: p.state || null,
      country: p.country || null,
      latitude: p.lat,
      longitude: p.lon,
    }));
}

module.exports = { searchPlaces };