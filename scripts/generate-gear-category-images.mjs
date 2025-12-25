import * as fs from "node:fs";
import * as path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Please set GEMINI_API_KEY environment variable");
  process.exit(1);
}

// Category images with atmospheric, editorial-style prompts
const categoryImages = [
  {
    id: "essentials",
    name: "essentials.jpg",
    prompt: "Elegant flat lay of traditional Finnish sauna accessories on warm cedar wood surface, wooden bucket with ladle, sand timer, thermometer, volcanic sauna stones arranged artfully, soft natural lighting from window, minimalist Scandinavian aesthetic, warm honey and amber tones, professional product photography, editorial style, no text, 16:9"
  },
  {
    id: "comfort",
    name: "comfort.jpg",
    prompt: "Luxurious sauna comfort items arranged on cedar bench, soft white linen towels neatly folded, natural wood headrest, sauna pillow, felt slippers, organic cotton robe draped elegantly, warm ambient lighting, spa atmosphere, Scandinavian minimalism, warm earth tones, professional lifestyle photography, no text, 16:9"
  },
  {
    id: "aromatherapy",
    name: "aromatherapy.jpg",
    prompt: "Beautiful arrangement of sauna aromatherapy products, glass bottles of eucalyptus and birch essential oils, fresh birch vihta bundle, wooden bowl with aromatic herbs, gentle steam wisps, cedar wood background, soft diffused lighting, natural spa aesthetic, green and amber color palette, professional product photography, no text, 16:9"
  },
  {
    id: "cold-therapy",
    name: "cold-therapy.jpg",
    prompt: "Modern cold plunge tub with crystal clear water outdoors, wooden deck setting, morning mist, snow-capped mountains in background, ice cubes floating, minimalist Scandinavian design, contrast therapy concept, cool blue and warm wood tones, professional architectural photography, serene atmosphere, no text, 16:9"
  },
  {
    id: "tracking",
    name: "tracking.jpg",
    prompt: "Modern wellness tracking devices on cedar sauna bench, sleek smartwatch showing heart rate, digital thermometer with app display, elegant and minimal tech aesthetic, warm wood background contrasting with modern devices, soft warm lighting, clean product photography style, no text, 16:9"
  },
  {
    id: "recovery",
    name: "recovery.jpg",
    prompt: "Premium recovery tools arranged on wooden surface, massage gun, foam roller, compression boots, muscle balm jar, clean white towel, post-sauna recovery concept, modern wellness aesthetic, warm neutral tones, professional product photography, minimalist composition, no text, 16:9"
  },
  {
    id: "red-light",
    name: "red-light.jpg",
    prompt: "Red light therapy panel glowing with deep red and near-infrared light in dark sauna room, warm therapeutic ambiance, modern biohacking meets traditional wellness, dramatic lighting contrast, sleek minimal design, professional photography, warm red and amber tones, no text, 16:9"
  },
  {
    id: "infrared",
    name: "infrared.jpg",
    prompt: "Modern infrared sauna interior with glowing carbon panels, light cedar wood walls, contemporary minimalist design, warm amber-red glow from heating elements, empty bench with folded towel, glass door, professional architectural photography, premium spa aesthetic, no text, 16:9"
  },
  {
    id: "portable-saunas",
    name: "portable-saunas.jpg",
    prompt: "Portable sauna tent set up in cozy home setting, person-sized fabric sauna with visible steam, modern apartment interior, warm ambient lighting, convenient home wellness concept, lifestyle photography, warm inviting atmosphere, earth tones, no text, 16:9"
  },
  {
    id: "barrel-saunas",
    name: "barrel-saunas.jpg",
    prompt: "Beautiful cedar barrel sauna in scenic outdoor setting, golden hour lighting, surrounded by nature, steam rising from chimney, rustic yet elegant design, Nordic landscape aesthetic, warm wood tones against green forest, professional architectural photography, no text, 16:9"
  },
  {
    id: "heaters",
    name: "heaters.jpg",
    prompt: "Premium Finnish sauna heater with glowing volcanic stones, steam rising from water being poured, warm amber light from heated rocks, traditional sauna interior, dramatic lighting, professional product photography, warm orange and amber tones, authentic sauna atmosphere, no text, 16:9"
  },
  {
    id: "tech",
    name: "tech.jpg",
    prompt: "Modern sauna control panel with digital display and smartphone app interface, smart home integration concept, sleek minimalist design, warm wood background, LED indicators glowing softly, premium tech aesthetic, clean product photography, warm neutral tones, no text, 16:9"
  },
  {
    id: "maintenance",
    name: "maintenance.jpg",
    prompt: "Sauna cleaning and maintenance supplies arranged neatly, natural wood oil bottle, soft brush, organic cleaning solution, fresh cedar shavings, maintenance tools on clean wooden surface, professional product photography, natural and clean aesthetic, warm earth tones, no text, 16:9"
  }
];

async function generateImage(imageConfig) {
  console.log(`\n🎨 Generating: ${imageConfig.name}`);
  console.log(`   Category: ${imageConfig.id}`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: imageConfig.prompt }]
          }],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"]
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error(`   ✗ API Error:`, data.error.message);
      return false;
    }

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");
          const outputPath = path.join("public", "images", "gear", imageConfig.name);

          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(outputPath, buffer);
          const sizeKB = (buffer.length / 1024).toFixed(1);
          console.log(`   ✓ Saved: ${outputPath} (${sizeKB} KB)`);
          return true;
        }
      }
    }

    console.log(`   ✗ No image in response`);
    return false;
  } catch (error) {
    console.error(`   ✗ Error:`, error.message);
    return false;
  }
}

async function main() {
  console.log("🔥 Generating Gear Category Images with Gemini\n");
  console.log(`   Total categories: ${categoryImages.length}`);

  const gearDir = path.join("public", "images", "gear");
  if (!fs.existsSync(gearDir)) {
    fs.mkdirSync(gearDir, { recursive: true });
  }

  let successCount = 0;
  for (const imageConfig of categoryImages) {
    const success = await generateImage(imageConfig);
    if (success) successCount++;

    // Rate limiting - wait between requests
    if (categoryImages.indexOf(imageConfig) < categoryImages.length - 1) {
      console.log("   ⏳ Waiting 3s...");
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ Complete: ${successCount}/${categoryImages.length} images generated`);
  console.log(`📁 Output: public/images/gear/`);
}

main();
