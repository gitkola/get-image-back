import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const port = process.env.PORT || 3002;
const app = express();

const INTERNAL_SERVICE_ERROR = "Internal service error";
const PROMPT_IS_REQUIRED = "Prompt is required";

app.use(bodyParser.json());
app.use(cors({ origin: "*" }));

app.post("/api/v1/prompt", async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body?.prompt !== "string") {
      console.log(PROMPT_IS_REQUIRED);
      res.status(400).json({ error: PROMPT_IS_REQUIRED });
      return;
    }
    const { prompt } = body;
    const imageUrl = getImageUrl(prompt);
    console.log({ prompt, imageUrl });
    const imageIsReady = await waitUntilImageIsReady(imageUrl);
    if (!imageIsReady) {
      console.log(INTERNAL_SERVICE_ERROR);
      res.status(500).json({ error: INTERNAL_SERVICE_ERROR });
      return;
    }
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: INTERNAL_SERVICE_ERROR });
  }
});

app.get("/", (req, res) => res.send("get-image-back"));
app.listen(port, () => console.log(`get-image-back on port: ${port}`));

//-------------------------------------------------Utils-------------------------------------------------//

function getImageUrl(prompt) {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}`;
}

async function waitUntilImageIsReady(url) {
  const response = await axios.get(url);
  if (response.status !== 200) {
    throw new Error();
  }
  return true;
}
