import { useState } from "react";

function validCoords(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

export default function useLocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Your browser does not support location access.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        if (!validCoords(latitude, longitude)) {
          setError("Received invalid coordinates. Please try again.");
        } else {
          setCoords({ latitude, longitude, accuracy, manual: false, label: null });
        }
        setLoading(false);
      },
      (err) => {
        const messages = {
          1: "Location permission was denied. Allow it in your browser settings and try again.",
          2: "Your location is currently unavailable. You can search for a place or enter coordinates below.",
          3: "The location request timed out. Please try again.",
        };
        setError(messages[err.code] || "An unknown location error occurred.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const setManualLocation = (lat, lon, label = null) => {
    const latitude = Number(lat);
    const longitude = Number(lon);

    if (String(lat).trim() === "" || String(lon).trim() === "" || !validCoords(latitude, longitude)) {
      setError("Enter a latitude between -90 and 90 and a longitude between -180 and 180.");
      return;
    }

    setError(null);
    setCoords({ latitude, longitude, accuracy: null, manual: true, label });
  };

  return { coords, error, loading, requestLocation, setManualLocation };
}