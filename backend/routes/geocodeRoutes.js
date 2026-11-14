const express = require("express");
const { query, validationResult } = require("express-validator");
const { searchPlaces } = require("../services/geocodeService");

const router = express.Router();

router.get(
  "/",
  [query("q").trim().isLength({ min: 2, max: 100 }).withMessage("q must be 2 to 100 characters")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const places = await searchPlaces(req.query.q.trim());
      res.json({ places });
    } catch (error) {
      console.error("Geocode error:", error.message);
      res.status(502).json({ error: "Place search is unavailable right now" });
    }
  }
);

module.exports = router;