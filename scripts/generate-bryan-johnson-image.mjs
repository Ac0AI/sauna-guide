import * as fs from "node:fs";
import * as path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Please set GEMINI_API_KEY environment variable");
  process.exit(1);
}

const imageConfig = {
  name: "guides/bryan-johnson-protocol.jpg",
  prompt: "Futuristic high-tech sauna interior with sleek modern design, digital temperature displays showing 200F, infrared panels glowing subtle red, minimalist biohacker aesthetic, scientific monitoring equipment subtle in background, premium wellness technology, no people visible, dark moody lighting with warm amber accents, cyberpunk meets Scandinavian spa, 16:9 aspect ratio"
};

async function generateImage() {
  console.log(`Generating: ${imageConfig.name}...`);
  console.log(`Prompt: ${imageConfig.prompt}\n`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: imageConfig.prompt }]
          }],
          generationConfig: {
            responseModalities: ["IMAGE"]
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error(`✗ API Error:`, data.error);
      return false;
    }

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          const outputPath = path.join("public", "images", imageConfig.name);

          // Ensure directory exists
          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(outputPath, buffer);
          console.log(`✓ Saved: ${outputPath}`);
          console.log(`✓ Full path: /Users/d/Egna Appar/sauna-guide/${outputPath}`);
          return true;
        }
      }
    }

    console.log(`✗ No image data in response`);
    console.log("Full response:", JSON.stringify(data, null, 2));
    return false;
  } catch (error) {
    console.error(`✗ Error generating image:`, error.message);
    return false;
  }
}

async function main() {
  console.log("Generating Bryan Johnson Protocol sauna image with Gemini API...\n");

  const guidesDir = path.join("public", "images", "guides");
  if (!fs.existsSync(guidesDir)) {
    fs.mkdirSync(guidesDir, { recursive: true });
    console.log(`Created directory: ${guidesDir}\n`);
  }

  const success = await generateImage();

  if (success) {
    console.log("\n✓ SUCCESS: Image generated and saved!");
  } else {
    console.log("\n✗ FAILED: Could not generate image");
    process.exit(1);
  }
}

main();
