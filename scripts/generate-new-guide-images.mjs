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
    name: "sauna-crossfit-hyrox.jpg",
    prompt: "Modern athletic recovery sauna interior with warm cedar wood walls and benches, subtle athletic context with water bottle and folded towel visible on bench, soft steam rising gently, post-workout recovery atmosphere, warm amber lighting, professional sports facility photography, minimalist Scandinavian design, no people, clean minimal aesthetic, warm copper and honey color palette, 16:9 aspect ratio, ultra high quality",
  },
  {
    name: "sauna-sacred-space.jpg",
    prompt: "Traditional Finnish sauna interior with sacred peaceful atmosphere, soft natural light filtering through small window, traditional wooden bucket kiulu and ladle on bench, gentle steam wisps, subtle candlelight creating warm glow, ancient ritual feeling, warm amber and golden tones, professional architectural photography, spiritual meditative mood, no people, authentic Nordic aesthetic, 16:9 aspect ratio, ultra high quality",
  },
  {
    name: "sauna-after-lifting.jpg",
    prompt: "Modern premium sauna interior suggesting gym-adjacent recovery space, warm cedar wood walls and benches, soft steam visible, clean minimal aesthetic with subtle strength training recovery context, warm wood tones, professional wellness photography, contemporary fitness facility design, no people, warm amber lighting, minimalist Scandinavian aesthetic, 16:9 aspect ratio, ultra high quality",
  },
  {
    name: "when-not-to-sauna.jpg",
    prompt: "Thoughtful safety-focused image of traditional wooden sauna door slightly ajar viewed from outside, warm amber light glowing from within creating inviting but cautionary mood, suggestion of pause before entering, threshold moment, warm wood grain texture visible, professional architectural photography, contemplative atmosphere, not scary just thoughtful, no people, muted earth tones with warm cedar accents, 16:9 aspect ratio, ultra high quality",
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
  console.log("🔥 Generating new guide images with Gemini\n");
  console.log(`   Total images: ${guideImages.length}`);

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
