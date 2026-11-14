const express = require("express");
const { query, validationResult } = require("express-validator");
const { getTraffic } = require("../services/trafficService");

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
      const traffic = await getTraffic(lat, lon);
      res.json({ location: { latitude: lat, longitude: lon }, traffic });
    } catch (error) {
      console.error("Traffic error:", error.message);
      res.status(502).json({ error: error.message || "Could not get traffic data right now" });
    }
  }
);

module.exports = router;