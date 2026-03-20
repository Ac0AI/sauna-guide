import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env.local manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY not found in environment or .env.local");
  process.exit(1);
}

const imageConfig = {
  name: "guides/sauna-reset.jpg",
  outputPath: "/Users/dpr/Desktop/Egna Appar/Projekt/sauna-guide/public/images/guides/sauna-reset.jpg",
  prompt: `Serene Finnish sauna interior in near-darkness, a lone figure sits in silhouette on a wooden bench, back to the viewer, head slightly bowed in quiet contemplation, gentle wisps of steam rising through the warm amber glow of a single low lamp, cedar wood walls radiating warmth, soft diffused light catching the grain of the wood, the air heavy and still, an atmosphere of deep meditative calm and nervous system release, no performance — only stillness and letting go, premium editorial wellness photography, Scandinavian minimalist aesthetic, muted earth tones with warm honey and charcoal shadows, cinematic negative space, ultra high quality, 16:9 aspect ratio, 2K resolution`,
};

async function generateImage(config) {
  console.log(`Generating: ${config.name}...`);
  console.log(`Prompt length: ${config.prompt.length} chars\n`);

  const models = [
    "gemini-2.0-flash-preview-image-generation",
    "gemini-3-pro-image-preview",
    "imagen-3.0-generate-002",
  ];

  for (const model of models) {
    console.log(`Trying model: ${model}`);

    let requestBody;
    let endpoint;

    if (model.startsWith("imagen")) {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${GEMINI_API_KEY}`;
      requestBody = {
        instances: [{ prompt: config.prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "16:9",
        },
      };
    } else {
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      requestBody = {
        contents: [{ parts: [{ text: config.prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.error) {
        console.error(`  API Error (${model}):`, data.error.message);
        continue;
      }

      // Handle Gemini response
      if (data.candidates?.[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inlineData) {
            const buffer = Buffer.from(part.inlineData.data, "base64");
            const dir = path.dirname(config.outputPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(config.outputPath, buffer);
            console.log(`\nSaved to: ${config.outputPath}`);
            return true;
          }
        }
        const textPart = data.candidates[0].content.parts.find((p) => p.text);
        if (textPart) {
          console.log(`  Text response: ${textPart.text.substring(0, 200)}`);
        }
      }

      // Handle Imagen response
      if (data.predictions?.[0]?.bytesBase64Encoded) {
        const buffer = Buffer.from(data.predictions[0].bytesBase64Encoded, "base64");
        const dir = path.dirname(config.outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(config.outputPath, buffer);
        console.log(`\nSaved to: ${config.outputPath}`);
        return true;
      }

      console.log(`  No image data in response from ${model}`);
      console.log("  Raw response:", JSON.stringify(data).substring(0, 400));
    } catch (err) {
      console.error(`  Fetch error (${model}):`, err.message);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  return false;
}

const success = await generateImage(imageConfig);
if (success) {
  console.log("\nImage generation complete.");
} else {
  console.error("\nAll models failed. Check API key and model availability.");
  process.exit(1);
}
