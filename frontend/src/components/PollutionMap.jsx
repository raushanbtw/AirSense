import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { formatTime } from "../utils/aqiColors";

const NAMES = { pm25: "PM2.5", pm10: "PM10", no2: "NO2", o3: "O3", co: "CO", so2: "SO2" };

const stationIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "user-marker",
});

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function collectStations(data) {
  const stations = new Map();

  const openaq = data?.airQuality?.openaq;
  if (openaq) {
    for (const [pollutant, p] of Object.entries(openaq.pollutants)) {
      if (!isNum(p.stationLatitude) || !isNum(p.stationLongitude)) continue;
      const key = `openaq-${p.stationId}`;
      if (!stations.has(key)) {
        stations.set(key, {
          key,
          name: p.station,
          latitude: p.stationLatitude,
          longitude: p.stationLongitude,
          source: "OpenAQ",
          distanceKm: p.distanceKm,
          time: p.timestamp,
          readings: [],
        });
      }
      stations
        .get(key)
        .readings.push(`${NAMES[pollutant] || pollutant}: ${p.value} ${p.unit}`);
    }
  }

  const waqi = data?.airQuality?.waqi;
  if (waqi && isNum(waqi.station?.latitude) && isNum(waqi.station?.longitude)) {
    const readings = [];
    if (isNum(waqi.aqi)) readings.push(`AQI: ${waqi.aqi}`);
    for (const [name, value] of Object.entries(waqi.pollutants)) {
      readings.push(`${NAMES[name] || name}: ${value} (AQI sub-index)`);
    }
    stations.set("waqi", {
      key: "waqi",
      name: waqi.station.name,
      latitude: waqi.station.latitude,
      longitude: waqi.station.longitude,
      source: "WAQI",
      distanceKm: waqi.station.distanceKm,
      time: waqi.timestamp,
      readings,
    });
  }

  return [...stations.values()];
}

function Recenter({ latitude, longitude }) {
  const map = useMap();
  useEffect(() => {
    map.setView([latitude, longitude], 11);
  }, [latitude, longitude, map]);
  return null;
}

// Keeps the map correct when its box changes size (sidebar hide/show, page switch)
function ResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function PollutionMap({ coords, data }) {
  if (!coords) {
    return (
      <section className="card map-card tint-white">
        <p>Share your location to see the map.</p>
      </section>
    );
  }

  const stations = collectStations(data);

  return (
    <section className="card map-card tint-white">
      <MapContainer
        center={[coords.latitude, coords.longitude]}
        zoom={11}
        className="map"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Recenter latitude={coords.latitude} longitude={coords.longitude} />
                <ResizeWatcher />

        <Marker position={[coords.latitude, coords.longitude]} icon={userIcon}>
          <Popup>{coords.label || "Selected location"}</Popup>
        </Marker>

        {stations.map((s) => (
          <Marker key={s.key} position={[s.latitude, s.longitude]} icon={stationIcon}>
            <Popup>
              <strong>{s.name}</strong>
              <br />
              Source: {s.source}
              {isNum(s.distanceKm) && <> · {s.distanceKm} km away</>}
              <br />
              {s.readings.map((r) => (
                <span key={r}>
                  {r}
                  <br />
                </span>
              ))}
              Measured {formatTime(s.time)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="small">
        The darker-blue pin is your selected location. Other pins are monitoring stations
        that supplied the readings above.{" "}
        {stations.length === 0 && "No station positions are available for this location."}
      </p>
    </section>
  );
}

export default PollutionMap;
