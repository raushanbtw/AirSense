const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    age: { type: Number, min: 1, max: 120 },

    healthProfile: {
      asthma: { type: Boolean, default: false },
      elderly: { type: Boolean, default: false },
      children: { type: Boolean, default: false },
    },

    alertPreferences: {
      enabled: { type: Boolean, default: true },
      aqiThreshold: { type: Number, default: 100, min: 0, max: 500 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);