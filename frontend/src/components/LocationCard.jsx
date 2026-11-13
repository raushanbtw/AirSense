function LocationCard({ coords, error, loading, onRequest }) {
  return (
    <section className="card">
      <h2>Current Location</h2>

      {!coords && !loading && !error && (
        <p>Allow location access to see air quality near you.</p>
      )}

      {loading && <p>Getting your location...</p>}

      {error && <p className="error">{error}</p>}

      {coords && (
        <p>
          Latitude: {coords.latitude.toFixed(4)}
          <br />
          Longitude: {coords.longitude.toFixed(4)}
        </p>
      )}

      <button onClick={onRequest} disabled={loading}>
        {coords ? "Refresh location" : "Use my location"}
      </button>
    </section>
  );
}

export default LocationCard;