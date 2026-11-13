const express = require("express");
const { query, validationResult } = require("express-validator");
const { getWaqiAirQuality } = require("../services/waqiService");
const { getOpenAqAirQuality } = require("../services/openaqService");

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

    // allSettled: if one source fails, the other still works
    const [openaqResult, waqiResult] = await Promise.allSettled([
      getOpenAqAirQuality(lat, lon),
      getWaqiAirQuality(lat, lon),
    ]);

    const openaq = openaqResult.status === "fulfilled" ? openaqResult.value : null;
    const waqi = waqiResult.status === "fulfilled" ? waqiResult.value : null;

    const sourceErrors = [
      ["openaq", openaqResult],
      ["waqi", waqiResult],
    ]
      .filter(([, r]) => r.status === "rejected")
      .map(([source, r]) => {
        console.error(`${source} error:`, r.reason.message);
        return { source, message: r.reason.message };
      });

    if (!openaq && !waqi) {
      return res.status(502).json({
        error: "Could not get air quality data right now",
        sourceErrors,
      });
    }

    res.json({
      location: { latitude: lat, longitude: lon },
      openaq,
      waqi,
      sourceErrors,
    });
  }
);

module.exports = router;