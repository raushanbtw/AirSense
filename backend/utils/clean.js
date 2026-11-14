// Convert any date/time text to a UTC ISO string, or null if it is invalid
function toUtcIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

// Keep a number only if it is a real number inside the allowed range
function cleanNumber(value, min, max) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

module.exports = { toUtcIso, cleanNumber };