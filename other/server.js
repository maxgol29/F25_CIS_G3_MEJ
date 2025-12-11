import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

app.get("/restaurants", async (req, res) => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.4241,-98.4936&radius=3218&type=restaurant&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
