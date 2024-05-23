import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const DEFAULT_IMAGE_WIDTH = 640;
const DEFAULT_IMAGE_HEIGHT = 480;

const port = process.env.PORT || 3001;
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
    const { prompt, size } = body;
    const imageUrl = getImageUrl(prompt, size);
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

function getImageUrl(prompt, size = { width: DEFAULT_IMAGE_WIDTH, height: DEFAULT_IMAGE_HEIGHT }) {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${size?.width}&height=${size?.height}&nologo=poll&nofeed=yes`;
}

async function waitUntilImageIsReady(url) {
  const response = await axios.get(url);
  if (response.status !== 200) {
    throw new Error();
  }
  return true;
}
