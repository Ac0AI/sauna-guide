#!/usr/bin/env node

/**
 * Generate hero image for Ultimate Home Sauna Buying Guide
 * Usage: GEMINI_API_KEY="..." node scripts/generate-buying-guide-hero.mjs
 */

import * as fs from "node:fs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Please set GEMINI_API_KEY environment variable");
  process.exit(1);
}

const prompt =
  "Luxurious home sauna interior, warm golden cedar wood walls and tiered benches, " +
  "soft wisps of steam rising gently, a traditional Finnish wooden bucket and ladle resting " +
  "on the lower bench beside smooth river stones on a kiuas heater, ambient warm light " +
  "filtering through a small frosted window casting honey-toned glow across the grain of the wood, " +
  "a neatly folded linen towel on the upper bench, no people, clean and uncluttered space, " +
  "professional architectural interior photography, minimalist Scandinavian design, " +
  "color palette of warm amber, honey, charcoal, and natural cedar, " +
  "ultra high quality, 16:9 aspect ratio, inviting and premium feel";

const outputPath = "public/images/guides/ultimate-home-sauna-buying-guide.png";

async function main() {
  console.log("Generating home sauna buying guide hero image...\n");

  // Try Imagen 4 first (predict endpoint)
  console.log("Trying Imagen 4...");
  const imagenRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "16:9",
        },
      }),
    }
  );
  const imagenData = await imagenRes.json();

  if (imagenData.predictions?.[0]?.bytesBase64Encoded) {
    const buffer = Buffer.from(imagenData.predictions[0].bytesBase64Encoded, "base64");
    fs.writeFileSync(outputPath, buffer);
    console.log(`Saved: ${outputPath} (${Math.round(buffer.length / 1024)}KB)`);
    return;
  }

  if (imagenData.error) {
    console.log("Imagen 4 error:", imagenData.error.message);
  }

  // Fallback: Gemini 2.5 Flash Image (generateContent)
  console.log("\nTrying Gemini 2.5 Flash Image...");
  const flashRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate this image: ${prompt}` }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    }
  );
  const flashData = await flashRes.json();

  if (flashData.candidates?.[0]?.content?.parts) {
    for (const part of flashData.candidates[0].content.parts) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, "base64");
        fs.writeFileSync(outputPath, buffer);
        console.log(`Saved: ${outputPath} (${Math.round(buffer.length / 1024)}KB)`);
        return;
      }
    }
  }

  if (flashData.error) {
    console.log("Flash error:", flashData.error.message);
  } else {
    console.log("No image in response:", JSON.stringify(flashData, null, 2).substring(0, 500));
  }

  console.log("\nImage generation failed.");
  process.exit(1);
}

main();
