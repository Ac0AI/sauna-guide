import * as fs from "node:fs";
import * as path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Please set GEMINI_API_KEY environment variable");
  process.exit(1);
}

const imageConfig = {
  name: "guides/infrared-sauna-complete.jpg",
  prompt: "Modern infrared sauna interior with sleek light cedar wood walls and glowing infrared carbon panels emitting warm amber-red light, contemporary minimalist Scandinavian wellness design, gentle ambient warmth visible as soft glow from heating panels, no people visible, clean wooden bench with neatly folded white towel, glass door with soft natural light, professional architectural photography, clean lines and premium natural materials, warm earth tones with subtle red-orange accents from the infrared heating elements, serene and inviting atmosphere, 16:9 aspect ratio"
};

async function generateImage() {
  console.log(`Generating: ${imageConfig.name}...`);
  console.log(`Prompt: ${imageConfig.prompt}\n`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: imageConfig.prompt }]
          }]
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
  console.log("🎨 Generating Infrared Sauna Complete Guide Image with Gemini API\n");

  const success = await generateImage();

  if (success) {
    console.log("\n✅ Image generation complete!");
    console.log(`📁 Saved to: /Users/d/Egna Appar/sauna-guide/public/images/guides/infrared-sauna-complete.jpg`);
  } else {
    console.log("\n❌ Image generation failed");
    process.exit(1);
  }
}

main();
