# API Endpoints

Base URL: `http://localhost:5000/api`

All responses are JSON. Validation problems return HTTP 400 with an `errors` list. If an
external provider fails, the server returns HTTP 502, or lists the provider as unavailable
(see `/environment`).

## Summary

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Check that the server runs |
| POST | `/users` | Register a user with a health profile |
| GET | `/users/:id` | Get a user by ID |
| POST | `/location` | Validate coordinates |
| GET | `/geocode?q=` | Find places by name |
| GET | `/air-quality?lat=&lon=` | OpenAQ and WAQI air quality |
| GET | `/weather?lat=&lon=` | Current weather |
| GET | `/traffic?lat=&lon=` | Traffic flow on the nearest road |
| GET | `/environment?lat=&lon=` | All of the above combined, and stored |

`lat` must be between -90 and 90, and `lon` between -180 and 180.

## GET /health

```json
{ "status": "ok" }
```

## POST /users

Request:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "age": 21,
  "healthProfile": { "asthma": true },
  "alertPreferences": { "aqiThreshold": 100 }
}
```

Response (201):

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "age": 21,
  "healthProfile": { "asthma": true, "elderly": false, "children": false },
  "alertPreferences": { "enabled": true, "aqiThreshold": 100 },
  "_id": "6af6ead11d79b71f85d56fa3",
  "createdAt": "2026-11-13T10:47:45.842Z",
  "updatedAt": "2026-11-13T10:47:45.842Z"
}
```

Errors:

| Status | When |
|---|---|
| 400 | Missing name, invalid email, age outside 1 to 120, threshold outside 0 to 500 |
| 409 | A user with this email already exists |

## GET /users/:id

Returns the same object as above.

| Status | When |
|---|---|
| 400 | The ID is not a valid ID |
| 404 | No user with this ID |

## POST /location

Request: `{ "latitude": 25.5941, "longitude": 85.1376 }`

Response: the coordinates as numbers plus `receivedAt` (ISO time). A 400 is returned when
either value is missing, not a number, or out of range.

## GET /geocode?q=Chatra

`q` must be 2 to 100 characters. Several places can share a name, so the state is included.

```json
{
  "places": [
    { "name": "Chatra", "state": "Jharkhand", "country": "IN", "latitude": 24.2056663, "longitude": 84.8707742 },
    { "name": "Chatra", "state": "Madhya Pradesh", "country": "IN", "latitude": 22.8151796, "longitude": 80.3272992 }
  ]
}
```

## GET /air-quality?lat=25.5941&lon=85.1376

Both providers are called at the same time. If one fails, it is `null` and the reason is in
`sourceErrors`. If both fail, the status is 502.

```json
{
  "location": { "latitude": 25.5941, "longitude": 85.1376 },
  "openaq": {
    "source": "openaq",
    "pollutants": {
      "pm25": {
        "value": 45, "unit": "µg/m³", "timestamp": "2026-11-14T06:15:00Z",
        "station": "IGSC Planetarium Complex, Patna - BSPCB", "stationId": 5652,
        "distanceKm": 0
      }
    },
    "stationsChecked": ["IGSC Planetarium Complex, Patna - BSPCB"]
  },
  "waqi": {
    "source": "waqi",
    "aqi": 132,
    "dominantPollutant": "pm25",
    "pollutantUnit": "AQI sub-index",
    "pollutants": { "pm25": 132, "no2": 1.3, "o3": 13.5, "co": 1.6, "so2": 4.9 },
    "station": { "name": "IGSC Planetarium Complex, Patna, India", "latitude": 25.6103665,
                 "longitude": 85.1327137, "distanceKm": 1.8 },
    "timestamp": "2026-11-14T05:30:00.000Z"
  },
  "sourceErrors": []
}
```

Notes:

- OpenAQ values are raw concentrations in µg/m³. WAQI values are AQI sub-indices, not
  concentrations. They are not interchangeable.
- A pollutant the nearest station does not measure is taken from the next nearest station
  (at most 3 stations, within 25 km). `distanceKm` says how far.
- Missing pollutants are left out, never filled with zero.
- The OpenAQ pollutants also carry `stationLatitude` and `stationLongitude` for the map.
- The `distanceKm` value in the example WAQI station is illustrative.

## GET /weather?lat=25.5941&lon=85.1376

```json
{
  "location": { "latitude": 25.5941, "longitude": 85.1376 },
  "weather": {
    "source": "openweathermap",
    "temperature": 27.98, "humidity": 57, "pressure": 1014, "windSpeed": 1.54,
    "rainfall": 0, "visibility": 3000, "condition": "haze", "stationName": "Patna",
    "timestamp": "2026-11-14T07:45:23.000Z",
    "units": { "temperature": "°C", "humidity": "%", "pressure": "hPa",
               "windSpeed": "m/s", "rainfall": "mm", "visibility": "m" }
  }
}
```

If the provider sends no `rain` value, rainfall is reported as 0 mm.

## GET /traffic?lat=25.5941&lon=85.1376

```json
{
  "location": { "latitude": 25.5941, "longitude": 85.1376 },
  "traffic": {
    "source": "tomtom",
    "currentSpeed": 28, "freeFlowSpeed": 28, "speedUnit": "km/h",
    "currentTravelTime": 127, "freeFlowTravelTime": 127,
    "congestionRatio": 0, "congestionLevel": "low",
    "confidence": 1, "roadClosure": false, "roadClass": "FRC4",
    "timestamp": "2026-11-14T08:09:08.867Z"
  }
}
```

`congestionRatio` is `1 - currentSpeed / freeFlowSpeed`. The level is `low` below 0.1,
`moderate` below 0.3, and `heavy` otherwise. These cut-offs are my own choice, not a TomTom
standard. The timestamp is the time of the request, because TomTom sends no measurement time.

## GET /environment?lat=25.5941&lon=85.1376

Calls OpenAQ, WAQI, OpenWeatherMap and TomTom at the same time, converts all timestamps to
UTC, and stores the result in InfluxDB.

```json
{
  "location": { "latitude": 25.5941, "longitude": 85.1376 },
  "collectedAt": "2026-11-14T08:09:09.804Z",
  "airQuality": { "openaq": { "...": "..." }, "waqi": { "...": "..." } },
  "weather": { "...": "..." },
  "traffic": { "...": "..." },
  "unavailable": [],
  "errors": [],
  "storage": { "pointsWritten": 11, "error": null }
}
```

- A failed provider is `null`, is listed in `unavailable`, and its message is in `errors`.
- If all four fail, the status is 502 with an `errors` list.
- A storage failure does not break the response. It is reported in `storage.error`.