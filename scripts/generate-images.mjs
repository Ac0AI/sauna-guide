import * as fs from "node:fs";
import * as path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Please set GEMINI_API_KEY environment variable");
  process.exit(1);
}

const images = [
  {
    name: "hero-sauna.png",
    prompt: "Luxurious Finnish sauna interior with warm cedar wood walls and benches, soft steam rising gently, ambient warm lighting from hidden sources, traditional wooden bucket and ladle visible, no people, professional architectural photography, minimalist Scandinavian design, warm copper and honey color palette, ultra high quality, 2K resolution",
  },
  {
    name: "contrast-therapy.png",
    prompt: "Beautiful outdoor Nordic scene showing a wooden barrel sauna next to a cold plunge pool surrounded by snow, steam rising from the sauna, frozen lake in background, golden hour lighting, no people visible, premium wellness photography, Scandinavian minimalist aesthetic, muted earth tones with warm wood accents, 2K resolution",
  },
  {
    name: "sauna-protocols.png",
    prompt: "Modern home sauna space with infrared panels and traditional Finnish sauna bench, clean minimalist design, warm ambient lighting, no people, premium architectural interior photography, Scandinavian Japanese fusion aesthetic, charcoal and warm wood tones, 2K resolution",
  },
  {
    name: "newsletter-preview.png",
    prompt: "Aesthetic flat lay of a premium newsletter on tablet device next to a cup of herbal tea and eucalyptus branches, warm morning light streaming through window, cozy wellness atmosphere, no people visible, premium lifestyle photography, muted earth tones and warm neutrals, 2K resolution",
  }
];

async function generateImage(imageConfig) {
  console.log(`Generating: ${imageConfig.name}...`);

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
      console.error(`✗ API Error for ${imageConfig.name}:`, data.error.message);
      return false;
    }

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          const outputPath = path.join("public", "images", imageConfig.name);
          fs.writeFileSync(outputPath, buffer);
          console.log(`✓ Saved: ${outputPath}`);
          return true;
        }
      }
    }

    console.log(`✗ No image data in response for ${imageConfig.name}`);
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log("Response:", data.candidates[0].content.parts[0].text.substring(0, 300));
    }
    return false;
  } catch (error) {
    console.error(`✗ Error generating ${imageConfig.name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("Starting image generation with Gemini 3 Pro (Nano Banana Pro)...\n");

  const outputDir = path.join("public", "images");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let successCount = 0;
  for (const imageConfig of images) {
    const success = await generateImage(imageConfig);
    if (success) successCount++;
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`\nCompleted: ${successCount}/${images.length} images generated`);
}

main();
