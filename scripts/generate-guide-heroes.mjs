import * as fs from "node:fs";
import * as path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Please set GEMINI_API_KEY environment variable");
  process.exit(1);
}

const images = [
  {
    name: "guides/how-long-to-stay-in-sauna.jpg",
    prompt:
      "Editorial photography of the interior of a traditional Finnish sauna, a person sitting alone on the upper wooden bench in relaxed contemplation, back partially visible, wearing a white towel, warm golden steam drifting through the air, soft amber light filtering through a small wooden-framed window, rough-hewn spruce and cedar walls, smooth wooden bench slats, traditional sauna bucket and ladle on the lower bench, authentic texture everywhere — grain in the wood, droplets of condensation on surfaces, slow unhurried mood, the feeling of taking your time in the heat, no rush, deeply peaceful, Scandinavian editorial photography style, warm honey and amber color palette, cinematic depth of field, ultra high quality, 1200x630 landscape format",
  },
  {
    name: "guides/sauna-before-or-after-workout.jpg",
    prompt:
      "Editorial lifestyle photography showing active recovery transition: a neatly folded gym towel and a small water bottle placed on a traditional wooden sauna bench, a pair of training shoes just visible on the floor beside the bench, steam drifting across warm cedar wood walls, soft warm amber light, the composition suggests someone has just finished a workout and stepped into the sauna, athletic meets ritual, the mood is quiet earned rest after physical effort, no people visible, authentic Finnish sauna interior with hot stones kiuas glowing faintly in the background, warm wood tones with subtle contrast of the gym towel fabric texture, premium wellness editorial photography, Scandinavian minimalist aesthetic, 1200x630 landscape format, ultra high quality",
  },
  {
    name: "guides/sauna-detox-myth.jpg",
    prompt:
      "Dramatic editorial close-up photograph of water being ladled onto dark volcanic sauna stones, the moment of contact, steam erupting violently upward in a dense white cloud, the glowing red-orange heat of the stones visible beneath, rough iron and stone texture, a traditional wooden ladle handle in frame, the sauna heater kiuas filling most of the frame, authentic Finnish public sauna atmosphere — not a spa, not polished, real and raw, walls of weathered dark spruce behind, the image has a documentary quality, honest and elemental rather than wellness-marketing soft-focus, dramatic chiaroscuro lighting with deep shadows and bright steam catching the light, no people, photojournalistic sauna photography, warm embers and cool steam tones, 1200x630 landscape format, ultra high quality",
  },
];

async function generateImage(imageConfig) {
  console.log(`Generating: ${imageConfig.name}...`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: imageConfig.prompt }],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error(`  API Error for ${imageConfig.name}:`, data.error.message);
      // Try fallback model
      return await generateImageFallback(imageConfig);
    }

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          const outputPath = path.join(
            "/Users/dpr/Desktop/Egna Appar/Projekt/sauna-guide/public/images",
            imageConfig.name
          );

          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(outputPath, buffer);
          console.log(`  Saved: ${outputPath}`);
          return true;
        }
      }
    }

    console.log(`  No image data in response for ${imageConfig.name}`);
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log(
        "  Response text:",
        data.candidates[0].content.parts[0].text.substring(0, 300)
      );
    }
    console.log("  Full response keys:", Object.keys(data));
    return false;
  } catch (error) {
    console.error(`  Error generating ${imageConfig.name}:`, error.message);
    return false;
  }
}

async function generateImageFallback(imageConfig) {
  console.log(`  Trying fallback model for: ${imageConfig.name}...`);

  const models = [
    "gemini-3-pro-image-preview",
    "imagen-3.0-generate-002",
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: imageConfig.prompt }] }],
            generationConfig: { responseModalities: ["IMAGE"] },
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        console.log(`  Model ${model} error: ${data.error.message}`);
        continue;
      }

      if (data.candidates?.[0]?.content?.parts) {
        for (const part of data.candidates[0].content.parts) {
          if (part.inlineData) {
            const buffer = Buffer.from(part.inlineData.data, "base64");
            const outputPath = path.join(
              "/Users/dpr/Desktop/Egna Appar/Projekt/sauna-guide/public/images",
              imageConfig.name
            );
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(outputPath, buffer);
            console.log(`  Saved via ${model}: ${outputPath}`);
            return true;
          }
        }
      }
    } catch (err) {
      console.log(`  Model ${model} threw: ${err.message}`);
    }
  }

  return false;
}

async function main() {
  console.log("Generating 3 guide hero images...\n");

  let successCount = 0;
  for (const imageConfig of images) {
    const success = await generateImage(imageConfig);
    if (success) successCount++;
    if (successCount < images.length) {
      console.log("  Waiting 4s before next request...\n");
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  console.log(`\nDone: ${successCount}/${images.length} images generated`);
  console.log(
    "Images saved to: public/images/guides/"
  );
}

main();
