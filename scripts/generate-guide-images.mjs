#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Please set GEMINI_API_KEY environment variable");
  process.exit(1);
}

const guideImages = [
  {
    name: "longevity-protocol.jpg",
    prompt: "Serene Finnish lakeside sauna at golden hour, steam rising from a wooden sauna building by a calm lake, elderly person's silhouette visible through window, symbol of longevity and peace, professional landscape photography, warm amber and copper tones, no text, 16:9 aspect ratio, 2K resolution",
  },
  {
    name: "contrast-therapy.jpg",
    prompt: "Dramatic split composition showing hot sauna steam on left side transitioning to icy cold plunge water on right side, fire orange glow versus icy blue, professional wellness photography, minimal Scandinavian aesthetic, no people visible, artistic contrast, 16:9 aspect ratio, 2K resolution",
  },
  {
    name: "male-fertility.jpg",
    prompt: "Abstract minimalist wellness concept, thermometer and ice motif, warm amber sauna wood textures combined with cool blue ice elements, professional scientific illustration style, tasteful and clinical, no people, subtle masculine aesthetic, 16:9 aspect ratio, 2K resolution",
  },
  {
    name: "sauna-for-women.jpg",
    prompt: "Elegant spa sauna scene with soft feminine aesthetic, eucalyptus branches hanging, rose quartz stones, soft blush pink and warm cedar wood tones, peaceful empowering atmosphere, professional wellness photography, Scandinavian minimalism, no people visible, 16:9 aspect ratio, 2K resolution",
  },
  {
    name: "infrared-vs-traditional.jpg",
    prompt: "Side by side comparison split screen, left side traditional Finnish wood sauna with glowing rocks and steam, right side modern infrared sauna with glowing red panels, clean professional product photography, educational style, warm lighting, 16:9 aspect ratio, 2K resolution",
  },
  {
    name: "sauna-safety.jpg",
    prompt: "Clean professional sauna safety concept, beautiful sauna interior with visible thermometer, glass of water, first aid heart symbol subtly integrated, warm earth tones with calming green accents, professional healthcare aesthetic, no people, reassuring mood, 16:9 aspect ratio, 2K resolution",
  },
  {
    name: "sauna-mistakes.jpg",
    prompt: "Humorous editorial illustration of sauna mistakes, melting smartphone, inappropriate gym clothes on hook, clock showing too long, playful warm amber color palette, editorial illustration style from premium magazine, comedic but tasteful, 16:9 aspect ratio, 2K resolution",
  },
  {
    name: "sauna-etiquette.jpg",
    prompt: "Elegant traditional Finnish sauna interior with iconic wooden bucket kiulu and ladle, birch vihta branches, respectful quiet atmosphere, soft steam wisps, professional architectural photography, warm amber lighting, authentic Nordic aesthetic, no people, 16:9 aspect ratio, 2K resolution",
  },
  {
    name: "world-sauna-cultures.jpg",
    prompt: "Artistic travel collage montage of world sauna cultures, Finnish lakeside wooden sauna, Russian banya with felt hats, Japanese onsen with zen garden, Turkish hammam domed ceiling with star lights, Korean jjimjilbang stone room, multicultural celebration, travel photography style, warm colors, 16:9 aspect ratio, 2K resolution",
  },
];

async function generateImage(imageConfig) {
  console.log(`\n🖼️  Generating: ${imageConfig.name}`);
  console.log(`   Prompt: ${imageConfig.prompt.substring(0, 60)}...`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Generate an image: ${imageConfig.prompt}` }]
          }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
            responseMimeType: "text/plain"
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error(`   ❌ API Error:`, data.error.message);
      return false;
    }

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          const outputPath = path.join("public", "images", "guides", imageConfig.name);
          fs.writeFileSync(outputPath, buffer);
          console.log(`   ✅ Saved: ${outputPath}`);
          return true;
        }
      }
    }

    console.log(`   ❌ No image data in response`);
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log("   Response:", data.candidates[0].content.parts[0].text.substring(0, 200));
    }
    return false;
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return false;
  }
}

async function main() {
  console.log("🔥 Generating guide images with Gemini\n");
  console.log(`   Total guides: ${guideImages.length}`);

  // Ensure directory exists
  const outputDir = path.join("public", "images", "guides");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const guide of guideImages) {
    const result = await generateImage(guide);
    if (result) success++;
    else failed++;
    // Wait between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`\n📊 Results: ${success} succeeded, ${failed} failed`);
}

main().catch(console.error);
