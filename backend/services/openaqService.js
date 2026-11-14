const axios = require("axios");

const BASE = "https://api.openaq.org/v3";
const WANTED = ["pm25", "pm10", "no2", "o3", "co", "so2"];
const MAX_AGE_HOURS = 24;
const MAX_STATIONS = 3;

function headers() {
  return { "X-API-Key": process.env.OPENAQ_API_KEY };
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getNearbyLocations(lat, lon) {
  const { data } = await axios.get(`${BASE}/locations`, {
    headers: headers(),
    timeout: 8000,
    params: { coordinates: `${lat},${lon}`, radius: 25000, limit: 10 },
  });
  return data.results || [];
}

async function getLatest(locationId) {
  const { data } = await axios.get(`${BASE}/locations/${locationId}/latest`, {
    headers: headers(),
    timeout: 8000,
  });
  return data.results || [];
}

async function getOpenAqAirQuality(lat, lon) {
  const locations = await getNearbyLocations(lat, lon);
  if (locations.length === 0) {
    throw new Error("OpenAQ has no stations within 25 km");
  }

  // Nearest stations first
  const stations = locations
    .map((l) => ({
      ...l,
      distanceKm: l.coordinates
        ? distanceKm(lat, lon, l.coordinates.latitude, l.coordinates.longitude)
        : Infinity,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_STATIONS);

  const latestResults = await Promise.allSettled(
    stations.map((s) => getLatest(s.id))
  );

  const pollutants = {};
  const now = Date.now();

  stations.forEach((station, i) => {
    if (latestResults[i].status !== "fulfilled") return;

    // Match sensor IDs to pollutant names and units
    const sensorMap = {};
    (station.sensors || []).forEach((s) => {
      sensorMap[s.id] = { name: s.parameter?.name, unit: s.parameter?.units };
    });

    for (const r of latestResults[i].value) {
      const sensor = sensorMap[r.sensorsId];
      if (!sensor || !WANTED.includes(sensor.name)) continue;
      if (!String(sensor.unit).includes("g/m")) continue; // keep only µg/m³
      if (typeof r.value !== "number" || r.value < 0) continue;

      const time = r.datetime?.utc;
      const ageHours = (now - new Date(time).getTime()) / 3600000;
      if (!time || Number.isNaN(ageHours) || ageHours > MAX_AGE_HOURS) continue;

      // Nearest station wins. Inside one station, the newest reading wins.
      const current = pollutants[sensor.name];
      if (current) {
        const sameStation = current.stationId === station.id;
        if (!sameStation || new Date(current.timestamp) >= new Date(time)) continue;
      }

      pollutants[sensor.name] = {
        value: r.value,
        unit: "µg/m³",
        timestamp: time,
        station: station.name,
        stationId: station.id,
        distanceKm: Math.round(station.distanceKm * 10) / 10,
        stationLatitude: station.coordinates?.latitude ?? null,
        stationLongitude: station.coordinates?.longitude ?? null,
      };
    }
  });

  return {
    source: "openaq",
    pollutants,
    stationsChecked: stations.map((s) => s.name),
  };
}

module.exports = { getOpenAqAirQuality };