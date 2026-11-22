import { TrendingUp } from "lucide-react";
import { aqiCategory } from "../utils/aqiColors";

export function TrendCard() {
  return (
    <section className="card tint-grey">
      <h2>
        <TrendingUp size={20} /> AQI Trend
      </h2>
      <p>
        A trend chart will appear here once enough history is stored and the forecast model
        exists (Milestone 2).
      </p>
    </section>
  );
}

export function ForecastCard({ currentAqi }) {
  const now = aqiCategory(currentAqi);
  const later = ["+3h", "+6h", "+12h", "+24h"];

  return (
    <section className="card tint-grey">
      <h2>AQI Forecast</h2>

      <div className="fc-grid">
        <div className="fc-box">
          <span>Now</span>
          <strong>{typeof currentAqi === "number" ? currentAqi : "--"}</strong>
          <div className="fc-bar" style={{ background: now.color }} />
        </div>

        {later.map((label) => (
          <div key={label} className="fc-box muted">
            <span>{label}</span>
            <strong>--</strong>
            <div className="fc-bar" style={{ background: "#cbd2d9" }} />
          </div>
        ))}
      </div>

      <p className="tiny">Forecast values will come from the LSTM and GRU models in Milestone 2.</p>
    </section>
  );
}