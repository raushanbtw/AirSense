const express = require("express");
const { body, validationResult } = require("express-validator");

const router = express.Router();

router.post(
  "/",
  [
    body("latitude")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a number between -90 and 90"),
    body("longitude")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a number between -180 and 180"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const location = {
      latitude: Number(req.body.latitude),
      longitude: Number(req.body.longitude),
      receivedAt: new Date().toISOString(),
    };

    res.json(location);
  }
);

module.exports = router;