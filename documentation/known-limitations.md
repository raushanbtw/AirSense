# Known Limitations

Problems and limits I found while building Milestone 1.

## Location

- **Browser location can be wrong.** On my Linux computer the browser reported a position
  roughly 165 km from where I actually was. Desktop browsers without GPS estimate from the
  internet connection. The app shows the browser's reported accuracy and offers a place
  search and manual coordinates.
- **Place search is ambiguous.** Several places share a name (five places called Chatra),
  so the user must choose from a list that includes the state. A searched place is the
  centre of the town, which can be several kilometres from the user.

## Air quality data

- **Monitoring stations are sparse outside big cities.** For a location in Jharkhand,
  OpenAQ had no station within 25 km, and the nearest WAQI station was in another district
  (Aurangabad, roughly 55 km away by my estimate). For Chatra it was in Gaya, in Bihar.
  The AQI therefore describes that station's area, not the user's. The app shows the
  station name and distance, and warns when the station is more than 25 km away.
- **Two sources, two units.** OpenAQ gives µg/m³. WAQI gives AQI sub-index values. They are
  stored separately and cannot be compared directly.
- **Gases may be missing from OpenAQ.** At one station OpenAQ returned no NO2, CO or SO2.
  My guess is that only their ppb sensors had fresh data, and the app keeps only µg/m³.
  I have not confirmed this.
- **Readings lag.** Station data is often one to two hours old. The dashboard shows the
  measurement time, not the request time.
- **Mixed stations.** Pollutants in the OpenAQ table can come from different stations (for
  example PM2.5 from the nearest and PM10 from one 2.5 km away). Each row shows its own
  station and distance.
- **Same timestamp on two stations.** Two WAQI stations showed the same measurement time.
  This may be WAQI's update schedule, but I have not confirmed it.

## Weather

- A missing `rain` value is assumed to mean 0 mm.
- The place name shown is the nearest place in the provider's list, not necessarily the
  user's town.

## Traffic

- Coverage was tested at one location. Smaller roads in rural areas may have no data.
- Traffic has no measurement time, so the stored time is the time of my request.
- The congestion levels (`low` below 0.1, `moderate` below 0.3) are my own cut-offs.
- Every request stores a new traffic point, so traffic data grows quickly with use. There is
  no limit on storage frequency yet.

## Application and security

- **No authentication.** Anyone who can reach the API can create a user and read a user by
  ID. This is acceptable for local development only.
- **Local MongoDB has no password.** The container is only reachable on my computer. A
  deployed version would need authentication.
- **CORS** allows only `http://localhost:5173`.
- Secrets live in `backend/.env` and are excluded from Git. The InfluxDB token was
  pasted into a chat during development and should be replaced before any deployment.
- `npm install` in the frontend reported 4 moderate vulnerabilities in dependencies. I did
  not change them.
- The map shows stations only. There is no pollution heat layer.

## Testing

- HTTP 429 (rate limit) was not triggered.
- I did not write automated tests. Testing was done with curl, the browser and screenshots.
- Testing was done mostly in the Patna area, with a few checks near Chatra and Aurangabad.

## Not part of Milestone 1

These belong to later modules:

- AQI forecasting model (Module 2)
- Route advisory and travel plans (Module 3)
- Push notifications and trend charts (Module 3)
- Final integration and testing (Module 4)

- **Sign-in is by email only, with no password.** Anyone who knows an email address can open
  that profile, including its health settings, and edit it. The lookup also reveals whether
  an email is registered. This is acceptable for local development with test data only.
  Before real use it needs a password stored as a hash and a login token checked on every
  user request.