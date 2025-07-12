// ai.js

import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 6969;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🧠 ZEX AI Core is running. Type fast. Think faster.");
});

app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "ZEX has no brain (API key missing)." });
  }

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ error: "Missing or invalid prompt." });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/cypher-alpha:free",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://zex.dortz.zone", // optional
          "X-Title": "ZEX-Core", // optional
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("No reply from model");

    res.json({ reply });

  } catch (err) {
    console.error("ZEX ERROR:", err?.response?.data || err.message);
    res.status(500).json({ error: "ZEX exploded while thinking." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ZEX is online at http://localhost:${PORT}`);
});