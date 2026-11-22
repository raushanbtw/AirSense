import { Wind, Activity, HeartPulse, CalendarDays, Map as MapIcon } from "lucide-react";
import useLocation from "../hooks/useLocation";
import useEnvironment from "../hooks/useEnvironment";
import HeroBanner from "../components/HeroBanner";
import Section from "../components/Section";
import PollutantCards from "../components/PollutantCards";
import StatsRow from "../components/StatsRow";
import AdvisoryCard from "../components/AdvisoryCard";
import TrafficCard from "../components/TrafficCard";
import PollutionMap from "../components/PollutionMap";
import { TrendCard, ForecastCard } from "../components/PlaceholderCards";

// Testing aid: add ?previewAqi=30 to the address to see the banner for that AQI
function readPreview() {
  const raw = new URLSearchParams(window.location.search).get("previewAqi");
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= 500 ? value : null;
}

function Dashboard({ user }) {
  const location = useLocation();
  const environment = useEnvironment(location.coords);
  const hasLocation = Boolean(location.coords);
  const data = environment.data;
  const waqi = data?.airQuality?.waqi;
  const currentAqi = typeof waqi?.aqi === "number" ? waqi.aqi : null;

  return (
    <main className="dash">
      <HeroBanner
        coords={location.coords}
        locationError={location.error}
        locationLoading={location.loading}
        onRequest={location.requestLocation}
        onManual={location.setManualLocation}
        waqi={waqi}
        envLoading={environment.loading}
        envError={environment.error}
        previewAqi={readPreview()}
      />

      <Section title="Air Pollutants" icon={Wind}>
        <PollutantCards data={data} />
      </Section>

      <Section title="Stats" icon={Activity}>
        <StatsRow data={data} />
      </Section>

      <Section title="Health & Traffic" icon={HeartPulse}>
        <div className="cat-row">
          <AdvisoryCard
            user={user}
            data={data}
            loading={environment.loading}
            hasLocation={hasLocation}
          />
          <TrafficCard
            traffic={data?.traffic}
            hasLocation={hasLocation}
            loading={environment.loading}
          />
        </div>
      </Section>

      <Section title="24-Hour Forecast" icon={CalendarDays}>
        <div className="cat-row">
          <ForecastCard currentAqi={currentAqi} />
          <TrendCard />
        </div>
      </Section>

      <Section title="Pollution Map" icon={MapIcon}>
        <PollutionMap coords={location.coords} data={data} />
      </Section>
    </main>
  );
}

export default Dashboard;