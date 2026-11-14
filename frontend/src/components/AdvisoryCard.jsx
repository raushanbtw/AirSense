import { buildAdvisory } from "../utils/advisory";

function AdvisoryCard({ user, data, loading, hasLocation }) {
  if (!hasLocation) {
    return (
      <section className="card">
        <h2>Health Advisory</h2>
        <p>Share your location to see an advisory.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="card">
        <h2>Health Advisory</h2>
        <p>Checking air quality...</p>
      </section>
    );
  }

  if (!data) return null;

  const advisory = buildAdvisory(user, data.airQuality?.waqi);

  return (
    <section className="card">
      <h2>Health Advisory</h2>
      <p>
        <strong>{advisory.title}</strong>
      </p>
      <div className={advisory.tone === "warn" ? "warning" : "note"}>
        {advisory.messages.map((m) => (
          <p key={m}>{m}</p>
        ))}
      </div>
    </section>
  );
}

export default AdvisoryCard;