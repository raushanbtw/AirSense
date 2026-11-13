import { useState } from "react";

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
        const { latitude, longitude } = position.coords;

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          Math.abs(latitude) > 90 ||
          Math.abs(longitude) > 180
        ) {
          setError("Received invalid coordinates. Please try again.");
        } else {
          setCoords({ latitude, longitude });
        }
        setLoading(false);
      },
      (err) => {
        const messages = {
          1: "Location permission was denied. Allow it in your browser settings and try again.",
          2: "Your location is currently unavailable.",
          3: "The location request timed out. Please try again.",
        };
        setError(messages[err.code] || "An unknown location error occurred.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return { coords, error, loading, requestLocation };
}