const express = require("express");
const { query, validationResult } = require("express-validator");
const { getEnvironment } = require("../services/environmentService");
const { storeEnvironment } = require("../services/storageService");

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

    const environment = await getEnvironment(lat, lon);

    // Every source failed: report a real error
    if (environment.unavailable.length === 4) {
      return res.status(502).json({
        error: "Could not get environmental data right now",
        errors: environment.errors,
      });
    }

    // Save to InfluxDB. A storage problem must not break the response.
    let pointsWritten = 0;
    let storageError = null;
    try {
      pointsWritten = await storeEnvironment(environment);
    } catch (error) {
      storageError = error.message;
      console.error("Storage error:", error.message);
    }

    res.json({ ...environment, storage: { pointsWritten, error: storageError } });
  }
);

module.exports = router;