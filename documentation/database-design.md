# Database Design and Verification

AirSense uses two databases, because it stores two different kinds of data.

| Database | Stores | Why this one |
|---|---|---|
| MongoDB | User profiles and health sensitivity settings | Records that look like a form |
| InfluxDB 2 | Air quality, weather and traffic readings over time | Time-stamped data that arrives continuously |

Both run locally in Docker (`mongo:7` and `influxdb:2`). MongoDB was first hosted on
Atlas, but my home IP address kept changing and Atlas blocked the connection, so I moved
to a local container.

## MongoDB: `users` collection

- Created a test user through `POST /users` and read it back from the `users` collection
  with `mongosh`. The health profile defaults (`elderly` and `children` false), the alert
  settings and the `createdAt` and `updatedAt` times were stored. A second request with the
  same email was rejected with a duplicate error, and an empty body, a malformed ID and an
  unknown ID each returned the expected error.

## InfluxDB: bucket `environment_data` (organization `AirSense`)

| Measurement | Tags | Fields |
|---|---|---|
| `air_quality` | `source`, `pollutant`, `unit`, `station`, `location_key` | `value` |
| `weather` | `source`, `station`, `location_key` | `temperature`, `humidity`, `pressure`, `wind_speed`, `rainfall`, `visibility` |
| `traffic` | `source`, `road_class`, `location_key` | `current_speed`, `free_flow_speed`, `current_travel_time`, `free_flow_travel_time`, `congestion_ratio`, `confidence`, `road_closure` |

Design decisions:

- **`location_key`** is the latitude and longitude rounded to 2 decimals (about 1 km), so
  nearby requests group together. Raw coordinates change constantly and make poor tags.
- **Units are kept apart.** OpenAQ readings are raw concentrations in µg/m³ (`source =
  openaq`). WAQI values are AQI sub-indices (`source = waqi`, `unit = AQI`). They are
  different quantities and must never be mixed in one series, or the forecasting model
  would learn from them as if they were the same.
- **Timestamps are stored in UTC.** Each provider formats times differently, so they are
  converted before saving. Air quality and weather keep the provider's measurement time.
  TomTom sends no measurement time, so traffic points use the time of my request.
- **Missing values are skipped, never stored as zero.** If a station has no PM10 sensor,
  there is simply no PM10 point.
- Repeating a request does not duplicate air quality or weather points while the station
  timestamp is unchanged, because InfluxDB overwrites identical points. Traffic gets a new
  point on every request.

## Verification

Checked in the InfluxDB Data Explorer on 14 November 2026.

Row counts over the last 24 hours (each field is its own row):

| Measurement | Source | Unit | Rows |
|---|---|---|---|
| `air_quality` | openaq | µg/m³ | 12 |
| `air_quality` | waqi | AQI | 32 |
| `weather` | openweathermap | none | 42 |
| `traffic` | tomtom | none | 91 |

What I checked:

- OpenAQ and WAQI readings are in separate series with different units.
- WAQI values (AQI 134 to 153, pollutants 0.7 to 73) are plausible, with no negative or
  absurd values.
- Each place I queried has its own `location_key`.
- Timestamps are in UTC.
- TODO: confirm the real point counts for weather and traffic with the Flux `count()` query
  (my arithmetic suggests 7 weather points and 13 traffic points, but I have not confirmed it).
- TODO: paste the MongoDB result here (the stored test user, with its health profile and
  timestamps), and the result of the duplicate-email test.

Screenshots are in `evidence/database/`.

## Findings and limitations

- **The station can be far from the place.** For Chatra, Jharkhand, the nearest WAQI
  station was in Gaya, which is in Bihar. For my other test location it was Gurdeo Nagar,
  Aurangabad, roughly 55 km away by my estimate. The AQI describes that station's area,
  not the user's own. The app shows the station name and distance and warns when the
  station is more than 25 km away.
- **OpenAQ has nothing within 25 km** of my second test location, so there are no OpenAQ
  rows for it. This is a coverage limit, not an error.
- **Readings lag.** Station data is often one to two hours old, and the dashboard shows the
  measurement time, not just the time of the request.
- **Traffic data grows quickly.** Every request writes a new traffic point. I have not
  added a limit on how often it is stored.
- **Open question:** two different WAQI stations showed the same measurement time
  (05:32 UTC). That may be WAQI's hourly update schedule, but I have not confirmed it.