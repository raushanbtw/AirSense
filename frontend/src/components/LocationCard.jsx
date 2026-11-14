import { useState } from "react";
import { searchPlaces } from "../services/locationService";

function LocationCard({ coords, error, loading, onRequest, onManual }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

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
    <section className="card">
      <h2>Current Location</h2>

      {!coords && !loading && !error && (
        <p>Use your device location, or search for a place below.</p>
      )}

      {loading && <p>Getting your location...</p>}

      {error && <p className="error">{error}</p>}

      {coords && (
        <>
          {coords.label && (
            <p>
              <strong>{coords.label}</strong>
            </p>
          )}
          <p>
            Latitude: {coords.latitude.toFixed(4)}
            <br />
            Longitude: {coords.longitude.toFixed(4)}
          </p>
          <p className="small">
            {coords.manual
              ? "Set manually."
              : coords.accuracy != null
              ? `Browser accuracy: about ${Math.round(coords.accuracy)} m. A large number means an approximate location.`
              : ""}
          </p>
        </>
      )}

      <button onClick={onRequest} disabled={loading}>
        {coords && !coords.manual ? "Refresh location" : "Use my location"}
      </button>

      <h3 className="subhead">Search for a place</h3>
      <div className="manual">
        <input
          type="text"
          placeholder="Town or city, e.g. Chatra"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch()}
        />
        <button onClick={runSearch} disabled={searching}>
          {searching ? "Searching..." : "Search"}
        </button>
      </div>

      {searchError && <p className="error small">{searchError}</p>}

      {results.length > 0 && (
        <ul className="results">
          {results.map((place, i) => (
            <li key={`${place.latitude}-${place.longitude}-${i}`}>
              <button className="link" onClick={() => choosePlace(place)}>
                {[place.name, place.state, place.country].filter(Boolean).join(", ")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 className="subhead">Or enter coordinates</h3>
      <div className="manual">
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
        <button onClick={() => onManual(lat, lon)}>Use these</button>
      </div>
    </section>
  );
}

export default LocationCard;