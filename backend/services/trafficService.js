const axios = require("axios");

function numberOrNull(value, min, max) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

async function getTraffic(lat, lon) {
  let data;
  try {
    const response = await axios.get(
      "https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json",
      {
        params: {
          key: process.env.TRAFFIC_API_KEY,
          point: `${lat},${lon}`,
          unit: "KMPH",
        },
        timeout: 8000,
      }
    );
    data = response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error("No traffic data available near this location");
    }
    throw error;
  }

  const f = data.flowSegmentData;
  if (!f) throw new Error("Unexpected traffic response");

  const currentSpeed = numberOrNull(f.currentSpeed, 0, 300);
  const freeFlowSpeed = numberOrNull(f.freeFlowSpeed, 0, 300);

  let congestionRatio = null;
  if (currentSpeed !== null && freeFlowSpeed) {
    congestionRatio = Math.min(1, Math.max(0, 1 - currentSpeed / freeFlowSpeed));
    congestionRatio = Math.round(congestionRatio * 100) / 100;
  }

  let congestionLevel = null;
  if (congestionRatio !== null) {
    congestionLevel =
      congestionRatio < 0.1 ? "low" : congestionRatio < 0.3 ? "moderate" : "heavy";
  }

  return {
    source: "tomtom",
    currentSpeed,
    freeFlowSpeed,
    speedUnit: "km/h",
    currentTravelTime: numberOrNull(f.currentTravelTime, 0, 100000),
    freeFlowTravelTime: numberOrNull(f.freeFlowTravelTime, 0, 100000),
    congestionRatio,
    congestionLevel,
    confidence: numberOrNull(f.confidence, 0, 1),
    roadClosure: Boolean(f.roadClosure),
    roadClass: f.frc || null,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { getTraffic };