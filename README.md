
# AirSense

A location-aware air quality dashboard. It combines air quality, weather and traffic data
for a chosen place and stores the readings for later forecasting.

## Project Structure

- frontend/ – User interface
- backend/ – Backend APIs and server
- documentation/ – Project documentation

## Technologies

- Frontend: React.js
- Backend: Node.js and Express.js
- Database: MongoDB and InfluxDB
- AI/ML: Python


**Status:** Milestone 1 (data integration and dashboard) is complete. Forecasting and route
advice come in later milestones.


## Documentation

- [Setup guide](documentation/setup-guide.md)
- [API endpoints](documentation/api-endpoints.md)
- [External APIs](documentation/external-apis.md)
- [Database design](documentation/database-design.md)
- [Known limitations](documentation/known-limitations.md)

## Quick start

See the [setup guide](documentation/setup-guide.md). In short: start MongoDB and InfluxDB
with Docker, fill in `backend/.env`, then run `node server.js` in `backend` and
`npm run dev` in `frontend`, and open http://localhost:5173.