import { useState } from "react";
import { LocateFixed, MapPin, Search } from "lucide-react";
import HeroImage from "./HeroImage";
import { aqiCategory, aqiMood, formatTime } from "../utils/aqiColors";
import { searchPlaces } from "../services/locationService";

function HeroBanner({
  coords,
  locationError,
  locationLoading,
  onRequest,
  onManual,
  waqi,
  envLoading,
  envError,
  previewAqi,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const realAqi = typeof waqi?.aqi === "number" ? waqi.aqi : null;
  const aqi = previewAqi ?? realAqi;
  const category = aqiCategory(aqi);
  const mood = aqiMood(aqi);
  const distance = waqi?.station?.distanceKm;

  const runSearch = async () => {
    const q = query.trim();
    if (q.length < 2) {
      setSearchError("Type at least 2 characters.");
      return;
    }

    setSearching(true);
    setSearchError(null);
    setResults([]);

    try {
      const places = await searchPlaces(q);
      if (places.length === 0) {
        setSearchError("No places found. Try another spelling, or add the state name.");
      }
      setResults(places);
    } catch (err) {
      setSearchError(err.response?.data?.error || "Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const choosePlace = (place) => {
    const label = [place.name, place.state, place.country].filter(Boolean).join(", ");
    onManual(place.latitude, place.longitude, label);
    setResults([]);
    setQuery("");
  };

  return (
    <section className={`hero mood-${mood}`}>
      <HeroImage mood={mood} />
      <div className="hero-shade" />

      <div className="hero-body">
        <div className="hero-aqi">
          <span className="hero-label">Current AQI</span>
          <span className="hero-number">{aqi ?? "--"}</span>
          <span className="hero-pill" style={{ background: category.color }}>
            {category.label}
          </span>
          {previewAqi !== null && <span className="hero-preview">Preview, not real data</span>}
        </div>

        <div className="hero-main">
          <div className="hero-place">
            <MapPin size={18} />
            <strong>
              {coords ? coords.label || "Selected location" : "No location selected"}
            </strong>
          </div>

          <p className="hero-sub">
            {coords
              ? `Lat: ${coords.latitude.toFixed(4)}° | Lon: ${coords.longitude.toFixed(4)}°`
              : "Search for a place or detect your location."}
            {coords && coords.accuracy != null &&
              ` | browser accuracy about ${Math.round(coords.accuracy)} m`}
          </p>

          {waqi && (
            <p className="hero-sub">
              Station: {waqi.station?.name}
              {typeof distance === "number" && ` (${distance} km away)`} | measured{" "}
              {formatTime(waqi.timestamp)}
            </p>
          )}
          {envLoading && <p className="hero-sub">Loading data...</p>}
          {envError && <p className="hero-error">{envError}</p>}
          {locationError && <p className="hero-error">{locationError}</p>}

          {/* The text box alone in its pill, and two separate buttons beside it */}
          <div className="search-row">
            <div className="searchbar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search location (city, area or landmark)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
            </div>

            <button
              type="button"
              className="search-btn detect"
              onClick={onRequest}
              disabled={locationLoading}
            >
              <LocateFixed size={16} />
              {locationLoading ? "Locating..." : "Detect Current Location"}
            </button>

            <button
              type="button"
              className="search-btn go"
              onClick={runSearch}
              disabled={searching}
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {searchError && <p className="hero-error">{searchError}</p>}

          {results.length > 0 && (
            <ul className="results hero-results">
              {results.map((place, i) => (
                <li key={`${place.latitude}-${place.longitude}-${i}`}>
                  <button type="button" className="link" onClick={() => choosePlace(place)}>
                    {[place.name, place.state, place.country].filter(Boolean).join(", ")}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <details className="hero-details">
            <summary>Enter coordinates instead</summary>
            <div className="coords">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
              <input
                type="text"
                inputMode="decimal"
                placeholder="Longitude"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
              />
              <button type="button" onClick={() => onManual(lat, lon)}>
                Use these
              </button>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;