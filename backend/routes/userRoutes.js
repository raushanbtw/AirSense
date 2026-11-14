const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

const userRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("age")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be between 1 and 120"),
  body("alertPreferences.aqiThreshold")
    .optional()
    .isInt({ min: 0, max: 500 })
    .withMessage("AQI threshold must be between 0 and 500"),
];

// Copy only the fields we allow
function pickUserFields(b) {
  const fields = {
    name: b.name,
    email: b.email,
    healthProfile: {
      asthma: Boolean(b.healthProfile?.asthma),
      elderly: Boolean(b.healthProfile?.elderly),
      children: Boolean(b.healthProfile?.children),
    },
    alertPreferences: {
      enabled: b.alertPreferences?.enabled !== false,
      aqiThreshold:
        b.alertPreferences?.aqiThreshold !== undefined
          ? Number(b.alertPreferences.aqiThreshold)
          : 100,
    },
  };
  if (b.age !== undefined && b.age !== null && b.age !== "") {
    fields.age = Number(b.age);
  }
  return fields;
}

function handleSaveError(error, res) {
  if (error.code === 11000) {
    return res.status(409).json({ error: "A user with this email already exists" });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: "Server error" });
}

// Register a new user
router.post("/", userRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.create(pickUserFields(req.body));
    res.status(201).json(user);
  } catch (error) {
    handleSaveError(error, res);
  }
});

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

// Update a user
router.put("/:id", userRules, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const fields = pickUserFields(req.body);
    user.set(fields);
    if (fields.age === undefined) user.age = undefined;

    await user.save();
    res.json(user);
  } catch (error) {
    handleSaveError(error, res);
  }
});
// Find a user by email ("sign in" without a password: development only)
router.post(
  "/lookup",
  [body("email").isEmail().withMessage("A valid email is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const email = String(req.body.email).trim().toLowerCase();
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "No profile found for this email" });
      }
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);
module.exports = router;