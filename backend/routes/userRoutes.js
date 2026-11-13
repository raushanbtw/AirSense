const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// Register a new user
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("age").optional().isInt({ min: 1, max: 120 }).withMessage("Age must be between 1 and 120"),
    body("alertPreferences.aqiThreshold")
      .optional()
      .isInt({ min: 0, max: 500 })
      .withMessage("AQI threshold must be between 0 and 500"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: "A user with this email already exists" });
      }
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get one user by ID
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;