require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectMongo = require("./config/db");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/location", require("./routes/locationRoutes"));

connectMongo();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));