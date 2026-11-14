
# External APIs

AirSense uses four external services. Each runs in its own file under `backend/services/`,
so a failure in one does not affect the others.

| Service | Used for | Authentication | File |
|---|---|---|---|
| OpenAQ v3 | Raw pollutant concentrations from monitoring stations | `X-API-Key` header | `openaqService.js` |
| WAQI | Overall AQI and pollutant sub-indices | Token in the query string | `waqiService.js` |
| OpenWeatherMap | Weather, and place-name search (geocoding) | `appid` query parameter | `weatherService.js`, `geocodeService.js` |
| TomTom Traffic Flow | Speed and congestion on the nearest road | `key` query parameter | `trafficService.js` |

All keys are read from `backend/.env`. Requests time out after 8 seconds.

## OpenAQ

- **Why:** raw concentrations in µg/m³ from government monitoring stations.
- **How it works:** find stations within 25 km, take the nearest three, read each
  station's latest values, and match each reading to a pollutant using the station's
  sensor list. Only µg/m³ readings are kept (stations also report some gases in ppb).
  Readings older than 24 hours or negative are ignored.
- **Fallback:** if the nearest station lacks a pollutant, the next nearest station supplies
  it. The response shows which station and how far.
- **Limits:** TODO: check your OpenAQ account page for the current rate limits.
- **Observed:** at one test location the nearest station had no PM10 sensor, and a station
  2.5 km away supplied it. At another location there was no station within 25 km.

## WAQI

- **Why:** a single overall AQI for the nearest station, as a cross-check against OpenAQ.
- **Important:** the pollutant values are AQI sub-index values, not concentrations. They are
  stored with `unit = AQI`.
- **Limits:** TODO: note the limits from the email or page that came with your token.
- **Observed:** WAQI always returns its nearest station, however far away. For Chatra,
  Jharkhand, that was a station in Gaya, Bihar.

## OpenWeatherMap

- **Why:** temperature, humidity, wind, pressure, rainfall and conditions. Weather affects
  air quality, so it is needed for the forecasting module.
- **Also used for:** searching places by name (the manual location feature).
- **Limits:** TODO: note the free plan limits shown in your account.
- **Observed:** the response omits `rain` when it is not raining. The app treats that as
  0 mm. The place name returned is the nearest place in their list, which may not be the
  user's own town.

## TomTom Traffic Flow

### Provider comparison

| Provider | Notes | Status |
|---|---|---|
| TomTom Traffic Flow | Current speed against free-flow speed on the nearest road. Free plan, no credit card | **Chosen** |
| HERE Traffic | Similar flow data, free plan | Not tested |
| Google Maps | Traffic-aware route times, needs a billing account | Not tested, billing is a barrier |

### Notes on TomTom

- **Why chosen:** simple request, one location in and one reading out, and no billing needed.
- **Limits:** the pricing page and the newer documentation gave different free limits (a
  daily non-tile allowance on one, a monthly figure on the other). TODO: write the limit
  shown in your own TomTom dashboard.
- **Coverage:** tested at Patna (the nearest road was a smaller road, class FRC4) and
  returned data. I did not test coverage across other areas.
- **Observed:** the response has no measurement time, so stored traffic points use the time
  of my request.

## Failure testing

Each wrong value was set for one run only, in the command line, so `.env` was not changed.

|      Test    |   |       What I did	       |    |             Result              |

Bad weather key	   Started with a wrong key	      Weather unavailable,the rest worked
Bad WAQI token	   Same	WAQI unavailable,         the rest worked
All keys wrong	   Same	HTTP 502 with 4 errors,   server stayed up

Observation: with an invalid WAQI token the message says "no data for this location". The
real cause is the token.
