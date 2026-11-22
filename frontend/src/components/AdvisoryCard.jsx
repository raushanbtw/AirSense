import { ShieldCheck } from "lucide-react";
import { buildAdvisory } from "../utils/advisory";

const TINTS = { warn: "tint-red", ok: "tint-green", info: "tint-blue" };

function AdvisoryCard({ user, data, loading, hasLocation }) {
  let tint = "tint-blue";
  let content;

  if (!hasLocation) {
    content = <p>Choose a location to see an advisory.</p>;
  } else if (loading) {
    content = <p>Checking air quality...</p>;
  } else if (!data) {
    content = <p>No data yet.</p>;
  } else {
    const advisory = buildAdvisory(user, data.airQuality?.waqi);
    tint = TINTS[advisory.tone] || "tint-blue";
    content = (
      <>
        <p>
          <strong>{advisory.title}</strong>
        </p>
        {advisory.messages.map((m) => (
          <p key={m} className="advice-line">
            {m}
          </p>
        ))}
      </>
    );
  }

  return (
    <section className={`card ${tint}`}>
      <h2>
        <ShieldCheck size={20} /> Health Advisory
      </h2>
      {content}
    </section>
  );
}

export default AdvisoryCard;