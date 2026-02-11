const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/predict", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      "https://api.upstage.ai/v1/solar/chat/completions",
      {
        model: "solar-pro",
        messages: [
          {
            role: "system",
            content:
              'You are an expert sentiment analyst. Analyze the following text and determine if the sentiment is POSITIVE, NEGATIVE, or NEUTRAL. Return a JSON object with keys \'label\' (string) and \'score\' (number between 0 and 1 representing confidence). Do not include any other text. Example: {"label": "POSITIVE", "score": 0.95}',
          },
          {
            role: "user",
            content: text,
          },
        ],
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SOLAR_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const content = response.data.choices[0].message.content;

    // Parse the JSON string from the response
    let sentimentData;
    try {
      // Handle potential markdown code blocks if the model wraps the json
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        sentimentData = JSON.parse(jsonMatch[0]);
      } else {
        sentimentData = JSON.parse(content);
      }
    } catch (e) {
      console.error("Error parsing JSON from LLM:", content);
      // Fallback or retry logic could go here, for now return error
      return res.status(500).json({ error: "Failed to parse model response" });
    }

    // Format for frontend (frontend expects array of objects in data[0] or just the object if we change frontend)
    // The current frontend does: const sentiment = data[0].reduce(...)
    // To minimize frontend changes safely, or improve frontend, let's just return the object and update frontend.
    // The frontend code is: const sentiment = data[0].reduce(...)
    // This expects data to be [[{label, score}, {label, score}]].
    // Let's UPDATE the frontend to be simpler: receive { label, score }.

    res.json(sentimentData);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
