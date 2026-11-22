const MOODS = {
  none: { top: "#4b6a93", bottom: "#b9c9de", sun: "#e8eef7", sunOpacity: 0.4, building: "#263a57", haze: "#d5dfec", hazeOpacity: 0.15 },
  good: { top: "#2f8fe0", bottom: "#c6ecff", sun: "#fff3b0", sunOpacity: 1, building: "#1d5a66", haze: "#ffffff", hazeOpacity: 0.05 },
  moderate: { top: "#dd9a3f", bottom: "#fbe5b5", sun: "#fff0c2", sunOpacity: 0.85, building: "#6a5640", haze: "#f6dca3", hazeOpacity: 0.3 },
  poor: { top: "#4e3d39", bottom: "#b49682", sun: "#d8643f", sunOpacity: 0.65, building: "#2f2523", haze: "#a58f80", hazeOpacity: 0.6 },
};

// [width, height] of each building
const SPECS = [
  [46, 80], [38, 130], [52, 100], [40, 150], [60, 90], [44, 120], [36, 170],
  [56, 95], [42, 140], [50, 105], [38, 160], [58, 85], [44, 125], [52, 110],
  [40, 145], [48, 92], [56, 132], [38, 102], [46, 118], [54, 88],
];

let cursor = 0;
const BUILDINGS = SPECS.map(([w, h]) => {
  const building = { x: cursor, w, h };
  cursor += w;
  return building;
});

function SkylineScene({ mood }) {
  const m = MOODS[mood] || MOODS.none;

  return (
    <svg
      className="scene"
      viewBox="0 0 940 240"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.top} />
          <stop offset="1" stopColor={m.bottom} />
        </linearGradient>
        <linearGradient id="hazeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.haze} stopOpacity="0" />
          <stop offset="1" stopColor={m.haze} stopOpacity={m.hazeOpacity} />
        </linearGradient>
      </defs>

      <rect width="940" height="240" fill="url(#skyGrad)" />
      <circle cx="700" cy="70" r="34" fill={m.sun} opacity={m.sunOpacity} />

      {BUILDINGS.map((b, i) => (
        <rect key={i} x={b.x} y={240 - b.h} width={b.w - 3} height={b.h} fill={m.building} />
      ))}

      <rect y="40" width="940" height="200" fill="url(#hazeGrad)" />
    </svg>
  );
}

export default SkylineScene;