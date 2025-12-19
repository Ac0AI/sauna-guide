import * as fs from "node:fs";
import * as path from "node:path";

const GEMINI_API_KEY = "REDACTED_API_KEY";

const imageConfig = {
  name: "guides/best-saunas-2026.jpg",
  prompt: "Stunning architectural sauna collage featuring iconic world-class saunas, Löyly Helsinki wooden wave structure, floating fjord sauna in Norway, luxury spa interior with infinity views, modern Scandinavian design meets ancient traditions, golden hour lighting, travel bucket list aesthetic, premium editorial photography style, warm amber and natural wood tones, 16:9 aspect ratio"
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
      console.error(`✗ API Error:`, data.error.message);
      console.error(`Error details:`, JSON.stringify(data.error, null, 2));
      return false;
    }

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          const outputPath = path.join("/Users/d/Egna Appar/sauna-guide/public/images", imageConfig.name);

          // Ensure directory exists
          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
          }

          fs.writeFileSync(outputPath, buffer);
          console.log(`✓ Successfully saved: ${outputPath}`);
          console.log(`✓ Image size: ${(buffer.length / 1024).toFixed(2)} KB`);
          return true;
        }
      }
    }

    console.log(`✗ No image data in response`);
    console.log("Full response:", JSON.stringify(data, null, 2));
    return false;
  } catch (error) {
    console.error(`✗ Error generating image:`, error.message);
    console.error(error);
    return false;
  }
}

async function main() {
  console.log("🎨 Generating Best Saunas 2026 Image with Gemini API\n");

  const success = await generateImage();

  if (success) {
    console.log("\n✅ Image generation complete!");
    console.log(`📁 Saved to: /Users/d/Egna Appar/sauna-guide/public/images/guides/best-saunas-2026.jpg`);
  } else {
    console.log("\n❌ Image generation failed");
    process.exit(1);
  }
}

main();
