import { Car } from "lucide-react";

const COLORS = { low: "#16a34a", moderate: "#ca8a04", heavy: "#dc2626" };

function TrafficCard({ traffic, hasLocation, loading }) {
  let body;

  if (!hasLocation) {
    body = <p>Choose a location to see traffic.</p>;
  } else if (loading) {
    body = <p>Loading traffic...</p>;
  } else if (!traffic) {
    body = <p>Traffic data is unavailable for this location.</p>;
  } else {
    const ratio =
      typeof traffic.currentSpeed === "number" && traffic.freeFlowSpeed
        ? Math.min(100, Math.max(0, (traffic.currentSpeed / traffic.freeFlowSpeed) * 100))
        : null;
    const color = COLORS[traffic.congestionLevel] || "#6b7280";

    body = (
      <>
        <p>
          Congestion:{" "}
          <strong style={{ color }}>
            {traffic.congestionLevel ? traffic.congestionLevel.toUpperCase() : "n/a"}
          </strong>
        </p>
        <p>
          Current speed: <strong>{traffic.currentSpeed} km/h</strong>
          <br />
          Normal speed: <strong>{traffic.freeFlowSpeed} km/h</strong>
        </p>
        {ratio !== null && (
          <div className="bar" title="Current speed compared with normal speed">
            <span style={{ width: `${ratio}%`, background: color }} />
          </div>
        )}
        <p className="tiny">Nearest road covered by TomTom.</p>
      </>
    );
  }

  return (
    <section className="card tint-white">
      <h2>
        <Car size={20} /> Traffic
      </h2>
      {body}
    </section>
  );
}

export default TrafficCard;