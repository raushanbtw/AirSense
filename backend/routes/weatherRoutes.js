const express = require("express");
const { query, validationResult } = require("express-validator");
const { getWeather } = require("../services/weatherService");

const router = express.Router();

router.get(
  "/",
  [
    query("lat").isFloat({ min: -90, max: 90 }).withMessage("lat must be between -90 and 90"),
    query("lon").isFloat({ min: -180, max: 180 }).withMessage("lon must be between -180 and 180"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    try {
      const weather = await getWeather(lat, lon);
      res.json({ location: { latitude: lat, longitude: lon }, weather });
    } catch (error) {
      console.error("Weather error:", error.message);
      const status = error.response?.status === 401 ? 502 : 502;
      res.status(status).json({ error: "Could not get weather data right now" });
    }
  }
);

module.exports = router;