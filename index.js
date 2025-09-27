const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Sentiment = require("sentiment");
// const fetch = require("node-fetch");
const axios = require("axios");
require("dotenv").config();
const app = express();
// const sentiment = new Sentiment();
// const API_URL = import.meta.env.VITE_API_URL;
app.use(cors());
app.use(bodyParser.json());


app.post("/predict", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english",
      { inputs: text },
      {
        headers: {
          Authorization: "Bearer " + process.env.HF_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
