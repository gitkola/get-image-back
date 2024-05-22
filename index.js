const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3001;

const INTERNAL_SERVER_ERROR = "Internal server error";
const PROMPT_IS_REQUIRED = "Prompt is required";

function getImageUrl(prompt) {
  const encodedPrompt = encodeURIComponent(
    prompt,
    (size = { width: 320, height: 240 })
  );
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${size?.width}&height=${size?.height}&nologo=poll&nofeed=yes`;
}

app.use(bodyParser.json());
const allowedOrigin = "*";
app.use(
  cors({
    origin: allowedOrigin,
  })
);

app.post("/api/v1/prompt", async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body.prompt !== "string") {
      res.status(400).json({ error: PROMPT_IS_REQUIRED });
      return;
    }
    const imageUrl = getImageUrl(body.prompt);
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: INTERNAL_SERVER_ERROR });
  }
});

app.get("/", (req, res) => {
  res.send("get-image-back");
});

app.listen(port, () => {
  console.log(`get-image-back app listening at port: ${port}`);
});
