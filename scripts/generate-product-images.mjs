#!/usr/bin/env node

/**
 * Generate individual product images using Imagen 4 API
 * Usage: GEMINI_API_KEY="..." node scripts/generate-product-images.mjs
 */

import * as fs from "node:fs";
import * as path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Please set GEMINI_API_KEY environment variable");
  process.exit(1);
}

// Product image prompts - clean product photography style
const products = [
  // Essentials
  { slug: 'kolo-bucket-and-ladle-set', prompt: 'Modern sauna bucket and ladle set, aluminum with bamboo handle, innovative Finnish design, product photography white background, studio lighting' },
  { slug: 'rento-pisara-bucket-and-ladle', prompt: 'Premium Finnish biocomposite sauna bucket and ladle, dark elegant design, curved modern shape, product photography white background' },
  { slug: 'sensorpush-ht1-thermometer', prompt: 'Small wireless digital thermometer sensor, white square IoT device, modern tech gadget, product photography white background' },
  { slug: 'fischer-german-thermometer', prompt: 'Classic round analog thermometer hygrometer combo, German precision brass and wood instrument, vintage elegant style, product photo' },
  { slug: '15-minute-cedar-sand-timer', prompt: 'Wooden hourglass sand timer, red cedar frame with glass tubes, white sand, wall mountable, product photography white background' },
  { slug: 'olivine-diabase-sauna-stones', prompt: 'Dark gray volcanic sauna stones pile, smooth rounded olivine diabase rocks, natural texture, product photography white background' },

  // Comfort
  { slug: 'by-itu-sauna-hat', prompt: 'Handmade Finnish wool felt sauna hat, natural beige gray dome shape, artisan craft, product photography white background' },
  { slug: 's-shaped-cedar-backrest', prompt: 'Ergonomic S-curved wooden backrest, red cedar slats, sauna accessory, product photography white background' },
  { slug: 'cedar-headrest-pillow', prompt: 'Curved wooden headrest pillow, red cedar, ergonomic neck support design, product photography white background' },
  { slug: 'bamboo-floor-mat', prompt: 'Rolled bamboo floor mat, natural moso bamboo slats, spa style, product photography white background' },
  { slug: 'turkish-cotton-peshtemal', prompt: 'Folded Turkish cotton towel peshtemal, blue white stripes, lightweight luxury textile, product photography white background' },
  { slug: 'waffle-weave-spa-robe', prompt: 'White cotton waffle weave bathrobe, elegant spa style, product photography neutral background' },

  // Aromatherapy
  { slug: 'eucalyptus-essential-oil', prompt: 'Amber glass essential oil bottle with dropper, eucalyptus leaves, aromatherapy product, white background studio photo' },
  { slug: 'birch-essential-oil', prompt: 'Dark glass essential oil bottle, birch bark decoration, Nordic style, product photography white background' },
  { slug: 'lavender-essential-oil', prompt: 'Glass essential oil bottle, dried lavender sprigs, aromatherapy product, white background photo' },
  { slug: 'birch-vihta-whisk', prompt: 'Traditional Finnish birch vihta whisk bundle, dried birch leaves branches, natural twine, product photography white background' },
  { slug: 'eucalyptus-vihta-whisk', prompt: 'Fresh eucalyptus branch bundle vihta, green aromatic leaves, spa accessory, product photography white background' },

  // Cold Therapy
  { slug: 'plunge-cold-tub', prompt: 'Modern cold plunge tub, sleek white acrylic design, compact ice bath, product photography gray background' },
  { slug: 'ice-barrel', prompt: 'Upright barrel shaped cold plunge, dark charcoal color, compact design, product photography white background' },
  { slug: 'morozko-forge', prompt: 'Premium stainless steel cold plunge tub, industrial design, professional ice bath, product photography gray background' },
  { slug: 'penguin-chillers-setup', prompt: 'Water chiller unit, industrial cooling equipment, white box with hoses connections, product photography white background' },
  { slug: '100-gallon-stock-tank', prompt: 'Galvanized steel stock tank, round metal tub, rustic farm style, product photography white background' },

  // Tracking
  { slug: 'oura-ring-4', prompt: 'Smart ring wearable, sleek titanium band, modern health tracker, product photography white background, tech gadget' },
  { slug: 'whoop-4-0', prompt: 'Fitness wearable band, black strap with sensor pod, health tracker device, product photography white background' },
  { slug: 'apple-watch-ultra', prompt: 'Premium titanium smartwatch, orange action button, rugged sports watch design, product photography white background' },
  { slug: 'sauna-tracker-app', prompt: 'Smartphone showing fitness tracking app interface, sauna session data screen, product mockup photo' },

  // Recovery
  { slug: 'theragun-prime', prompt: 'Percussion massage gun, matte black triangular ergonomic design, therapy device, product photography white background' },
  { slug: 'theragun-pro-plus', prompt: 'Professional percussion massage gun, ergonomic handle, multiple attachments, product photography white background' },
  { slug: 'hypervolt', prompt: 'Sleek massage gun, metallic gray finish, Hyperice style, product photography white background' },
  { slug: 'lmnt-electrolytes', prompt: 'Electrolyte drink mix packets, colorful sachets box, hydration supplement, product photography white background' },
  { slug: 'drip-drop', prompt: 'Oral rehydration packets, medical electrolyte mix sachets, product photography white background' },

  // Red Light
  { slug: 'joovv-solo', prompt: 'Red light therapy panel, vertical standing LED device glowing red, wellness equipment, product photo dark background' },
  { slug: 'mito-red-light-mitopro', prompt: 'Large red light therapy panel, wall mounted LED array, professional grade, product photo dark background with red glow' },
  { slug: 'hooga-hg300', prompt: 'Compact red light therapy panel, desktop LED device, red glow, product photography white background' },

  // Infrared
  { slug: 'higherdose-infrared-blanket', prompt: 'Infrared sauna blanket, black quilted material rolled up, wellness product, product photography white background' },
  { slug: 'mihigh-infrared-blanket', prompt: 'Portable infrared blanket, gray fabric folded, spa equipment, product photography white background' },
  { slug: 'sunlighten-solo-system', prompt: 'Personal infrared sauna dome, curved pod design for lying down, product photography gray background' },

  // Portable Saunas
  { slug: 'serenelife-portable-sauna', prompt: 'Portable steam sauna tent, silver fabric pop up design, home spa, product photography white background' },
  { slug: 'saunabox-smartsteam-kit', prompt: 'Portable steam generator kit, compact control box with hose, product photography white background' },
  { slug: 'sweat-tent', prompt: 'Portable sauna tent, black fabric dome, pop up camping style sauna, product photography white background' },

  // Barrel Saunas
  { slug: 'almost-heaven-barrel-sauna', prompt: 'Wooden barrel sauna, cedar construction, rustic outdoor design, architectural product photography' },
  { slug: 'dundalk-leisurecraft', prompt: 'Premium barrel sauna, Canadian red cedar, glass door, outdoor installation, product photography' },
  { slug: 'dynamic-santiago-infrared', prompt: 'Indoor infrared sauna cabin, hemlock wood, glass door, 2 person size, product photography' },

  // Heaters
  { slug: 'harvia-legend-wood-burning', prompt: 'Wood burning sauna heater, black steel stove with stones, Finnish traditional design, product photography' },
  { slug: 'harvia-electric-heater', prompt: 'Modern electric sauna heater, cylindrical stainless steel Harvia design, product photography white background' },
  { slug: 'tylo-pure-combi', prompt: 'Combination steam dry sauna heater, modern wall mounted unit, product photography white background' },

  // Tech
  { slug: 'ultimate-ears-wonderboom-2', prompt: 'Waterproof Bluetooth speaker, round colorful portable audio device, product photography white background' },
  { slug: 'ip68-led-strip-lights', prompt: 'LED strip light roll, waterproof flexible RGB tape, product photography white background' },
  { slug: 'himalayan-salt-lamp', prompt: 'Pink Himalayan salt lamp, warm amber glow, natural crystal chunk, product photography dark background' },
  { slug: 'smart-home-sauna-controller', prompt: 'Digital sauna control panel, touchscreen thermostat interface, modern smart home device, product photography' },

  // Maintenance
  { slug: 'biozap-sauna-cleaner', prompt: 'Spray bottle wood cleaner, eco friendly natural sauna care product, product photography white background' },
  { slug: 'paraffin-wood-oil-treatment', prompt: 'Wood oil treatment bottle, amber liquid sauna wood care, product photography white background' },
  { slug: 'rainleaf-microfiber-towel', prompt: 'Folded microfiber sports towel, compact travel size, quick dry fabric, product photography white background' }
];

const outputDir = 'public/images/gear/products';

async function generateImage(product) {
  const outputPath = path.join(outputDir, `${product.slug}.png`);

  // Skip if already exists and is large enough
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    if (stats.size > 50000) {
      console.log(`⏭️  Skip: ${product.slug} (exists, ${Math.round(stats.size/1024)}KB)`);
      return true;
    }
  }

  console.log(`🎨 Generating: ${product.slug}...`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: product.prompt }],
          parameters: { sampleCount: 1, aspectRatio: "1:1" }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error(`❌ API Error: ${data.error.message}`);
      return false;
    }

    if (data.predictions?.[0]?.bytesBase64Encoded) {
      const buffer = Buffer.from(data.predictions[0].bytesBase64Encoded, "base64");

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Saved: ${product.slug} (${Math.round(buffer.length/1024)}KB)`);
      return true;
    }

    console.log(`❌ No image data for ${product.slug}`);
    return false;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n🔥 Generating ${products.length} product images...\n`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const product of products) {
    const result = await generateImage(product);
    if (result) success++;
    else failed++;

    // Rate limit: wait 2 seconds between requests
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Done! Success: ${success}, Failed: ${failed}`);
  console.log('='.repeat(50));

  // Update gear-merged.json with image paths
  if (success > 0) {
    console.log('\nUpdating gear-merged.json with image paths...');
    const gearData = JSON.parse(fs.readFileSync('src/data/gear-merged.json', 'utf-8'));

    let updated = 0;
    gearData.categories.forEach(cat => {
      cat.products.forEach(p => {
        const imagePath = `/images/gear/products/${p.slug}.png`;
        const fullPath = `public${imagePath}`;
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          if (stats.size > 50000) {
            p.image = imagePath;
            updated++;
          }
        }
      });
    });

    fs.writeFileSync('src/data/gear-merged.json', JSON.stringify(gearData, null, 2));
    console.log(`✅ Updated ${updated} products with image paths`);
  }
}

main();
