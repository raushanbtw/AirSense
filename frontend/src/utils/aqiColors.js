export function aqiCategory(aqi) {
  if (typeof aqi !== "number") return { label: "No data", color: "#6b7280" };
  if (aqi <= 50) return { label: "Good", color: "#16a34a" };
  if (aqi <= 100) return { label: "Moderate", color: "#ca8a04" };
  if (aqi <= 150) return { label: "Unhealthy for sensitive groups", color: "#ea580c" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#dc2626" };
  if (aqi <= 300) return { label: "Very unhealthy", color: "#7c3aed" };
  return { label: "Hazardous", color: "#7f1d1d" };
}

export function formatTime(iso) {
  if (!iso) return "unknown time";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "unknown time" : date.toLocaleString();
}