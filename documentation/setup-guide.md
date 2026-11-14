# Setup Guide

How to install and run AirSense. These are the steps.

## Requirements

| Tool |               | Used for |
| Git |                 Version control |
| Node.js and npm |     Backend (Express) and frontend (React with Vite) |
| Docker |              Running MongoDB and InfluxDB locally |

Check them:

```bash
git --version
node --version
npm --version
docker --version
```

## Project structure

```
AirSense/
├── backend/          Express API, services, database connections
├── frontend/         React dashboard (Vite)
├── documentation/    These documents and evidence screenshots
└── README.md
```

## 1. Clone the repository

```bash
git clone https://github.com/raushanbtw/AirSense.git
cd AirSense
```

## 2. Start the databases (Docker)

First time only:

```bash
docker run -d --name influxdb -p 8086:8086 -v influxdb-data:/var/lib/influxdb2 influxdb:2
docker run -d --name mongodb -p 27017:27017 -v mongo-data:/data/db mongo:7
```

After a reboot:

```bash
docker start influxdb mongodb
docker ps
```

Both containers should show `Up`.

### Docker permission note (Arch Linux)

If `docker ps` says `permission denied`, add your user to the docker group and log out and in:

```bash
sudo usermod -aG docker $USER
```

If the Docker service fails with `Failed to create bridge docker0`, the running kernel may be
older than the installed one after a system update. Rebooting fixed it for me.

### Set up InfluxDB

1. Open http://localhost:8086 and click **Get Started**.
2. Create a user, organization `AirSense`, and bucket `environment_data`.
3. Copy the API token shown. It is displayed only once. A new token can be created under
   **Load Data**, then **API Tokens**.

## 3. Get the API keys

| Service | Where | Notes |
|---|---|---|
| OpenAQ | explore.openaq.org/register | The key is emailed to you |
| WAQI | aqicn.org/data-platform/token | Token arrives by email |
| OpenWeatherMap | openweathermap.org | New keys can take a while to activate |
| TomTom | developer.tomtom.com | Check that the Traffic API is enabled for the key |

## 4. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `backend/.env`. No spaces around `=`, no quotes:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/airsense
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=
INFLUX_ORG=AirSense
INFLUX_BUCKET=environment_data
OPENAQ_API_KEY=
WAQI_TOKEN=
WEATHER_API_KEY=
TRAFFIC_API_KEY=
```

`.env` is listed in `.gitignore` and must never be committed. `.env.example` has the same
names with empty values and is safe to commit.

## 5. Configure the frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

`frontend/.env` contains:

```
VITE_API_URL=http://localhost:5000/api
```

Do not put secrets in this file. Anything starting with `VITE_` is visible in the browser.

## 6. Run the application

Terminal 1, backend:

```bash
cd backend
node server.js
```

Expected output:

```
Server running on port 5000
MongoDB connected
```

Terminal 2, frontend:

```bash
cd frontend
npm run dev
```

Open http://localhost:5173.

## 7. Check that it works

```bash
curl http://localhost:5000/api/health
curl "http://localhost:5000/api/environment?lat=25.5941&lon=85.1376"
```

The first returns `{"status":"ok"}`. The second returns air quality, weather and traffic.

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| `MongoDB connection failed` | The MongoDB container is not running. Run `docker start mongodb` |
| Environment endpoint reports `unavailable` sources | Check the matching key in `backend/.env`, and the error printed in the backend terminal |
| `EAI_AGAIN` or timeout errors on every provider | No internet or DNS problem on the computer |
| Page is blank | Open the browser console (`F12`). A file may contain a pasted `cat >` command or may be empty |
| Browser shows the wrong location | Use the search box or coordinate fields in the Current Location card |
| `Cannot GET /api/...` | The backend was not restarted after a new route was added |