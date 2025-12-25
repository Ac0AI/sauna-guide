#!/usr/bin/env node

/**
 * Generate gear product images using NanoBanana (Gemini Imagen)
 * Usage: GEMINI_API_KEY="..." node scripts/generate-gear-images-nb.mjs
 */

import { execSync } from "node:child_process";
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
  { slug: 'kolo-bucket-and-ladle-set', prompt: 'Professional product photo of a modern Finnish sauna bucket and ladle set, aluminum with bamboo handle, innovative Scandinavian design, white background, studio lighting, high quality commercial photography' },
  { slug: 'rento-pisara-bucket-and-ladle', prompt: 'Professional product photo of a premium Finnish biocomposite sauna bucket and ladle, dark elegant curved design, white background, studio lighting' },
  { slug: 'fischer-german-thermometer', prompt: 'Professional product photo of a classic round analog thermometer hygrometer combo, German precision brass and wood instrument, vintage elegant style, white background' },
  { slug: '15-minute-cedar-sand-timer', prompt: 'Professional product photo of a wooden hourglass sand timer, red cedar frame with glass tubes, white sand, wall mountable, white background' },
  { slug: 'olivine-diabase-sauna-stones', prompt: 'Professional product photo of dark gray volcanic sauna stones pile, smooth rounded olivine diabase rocks, natural texture, white background' },

  // Comfort
  { slug: 'by-itu-sauna-hat', prompt: 'Professional product photo of a handmade Finnish wool felt sauna hat, natural beige gray dome shape, artisan craft, white background' },
  { slug: 's-shaped-cedar-backrest', prompt: 'Professional product photo of an ergonomic S-curved wooden backrest, red cedar slats, sauna accessory, white background' },
  { slug: 'cedar-headrest-pillow', prompt: 'Professional product photo of a curved wooden headrest pillow, red cedar, ergonomic neck support design, white background' },
  { slug: 'bamboo-floor-mat', prompt: 'Professional product photo of a rolled bamboo floor mat, natural moso bamboo slats, spa style, white background' },
  { slug: 'turkish-cotton-peshtemal', prompt: 'Professional product photo of a folded Turkish cotton towel peshtemal, blue white stripes, lightweight luxury textile, white background' },
  { slug: 'waffle-weave-spa-robe', prompt: 'Professional product photo of a white cotton waffle weave bathrobe, elegant spa style, white background' },

  // Aromatherapy
  { slug: 'eucalyptus-essential-oil', prompt: 'Professional product photo of an amber glass essential oil bottle with dropper, eucalyptus leaves nearby, aromatherapy product, white background' },
  { slug: 'birch-essential-oil', prompt: 'Professional product photo of a dark glass essential oil bottle, birch bark decoration, Nordic style, white background' },
  { slug: 'lavender-essential-oil', prompt: 'Professional product photo of a glass essential oil bottle, dried lavender sprigs, aromatherapy product, white background' },
  { slug: 'birch-vihta-whisk', prompt: 'Professional product photo of a traditional Finnish birch vihta whisk bundle, dried birch leaves branches, natural twine, white background' },
  { slug: 'eucalyptus-vihta-whisk', prompt: 'Professional product photo of a fresh eucalyptus branch bundle vihta, green aromatic leaves, spa accessory, white background' },

  // Cold Therapy
  { slug: 'plunge-cold-tub', prompt: 'Professional product photo of a modern cold plunge tub, sleek white acrylic design, compact ice bath, gray background' },
  { slug: 'ice-barrel', prompt: 'Professional product photo of an upright barrel shaped cold plunge, dark charcoal color, compact design, white background' },
  { slug: 'penguin-chillers-setup', prompt: 'Professional product photo of a water chiller unit, industrial cooling equipment, white box with hoses connections, white background' },
  { slug: '100-gallon-stock-tank', prompt: 'Professional product photo of a galvanized steel stock tank, round metal tub, rustic farm style, white background' },

  // Tracking
  { slug: 'oura-ring-4', prompt: 'Professional product photo of a smart ring wearable, sleek titanium band, modern health tracker, white background, tech gadget' },
  { slug: 'whoop-4-0', prompt: 'Professional product photo of a fitness wearable band, black strap with sensor pod, health tracker device, white background' },
  { slug: 'apple-watch-ultra', prompt: 'Professional product photo of a premium titanium smartwatch, orange action button, rugged sports watch design, white background' },
  { slug: 'sauna-tracker-app', prompt: 'Professional product mockup of a smartphone showing fitness tracking app interface, sauna session data screen, white background' },

  // Recovery
  { slug: 'theragun-pro-plus', prompt: 'Professional product photo of a professional percussion massage gun, ergonomic handle, multiple attachments, white background' },
  { slug: 'hypervolt', prompt: 'Professional product photo of a sleek massage gun, metallic gray finish, modern design, white background' },
  { slug: 'lmnt-electrolytes', prompt: 'Professional product photo of electrolyte drink mix packets, colorful sachets box, hydration supplement, white background' },
  { slug: 'drip-drop', prompt: 'Professional product photo of oral rehydration packets, medical electrolyte mix sachets, white background' },

  // Red Light
  { slug: 'joovv-solo', prompt: 'Professional product photo of a red light therapy panel, vertical standing LED device glowing red, wellness equipment, dark background' },
  { slug: 'hooga-hg300', prompt: 'Professional product photo of a compact red light therapy panel, desktop LED device, red glow, white background' },

  // Infrared
  { slug: 'higherdose-infrared-blanket', prompt: 'Professional product photo of an infrared sauna blanket, black quilted material rolled up, wellness product, white background' },
  { slug: 'mihigh-infrared-blanket', prompt: 'Professional product photo of a portable infrared blanket, gray fabric folded, spa equipment, white background' },

  // Portable Saunas
  { slug: 'serenelife-portable-sauna', prompt: 'Professional product photo of a portable steam sauna tent, silver fabric pop up design, home spa, white background' },
  { slug: 'saunabox-smartsteam-kit', prompt: 'Professional product photo of a portable steam generator kit, compact control box with hose, white background' },
  { slug: 'sweat-tent', prompt: 'Professional product photo of a portable sauna tent, black fabric dome, pop up camping style sauna, white background' },

  // Barrel Saunas
  { slug: 'almost-heaven-barrel-sauna', prompt: 'Professional architectural photo of a wooden barrel sauna, cedar construction, rustic outdoor design, natural setting' },
  { slug: 'dundalk-leisurecraft', prompt: 'Professional architectural photo of a premium barrel sauna, Canadian red cedar, glass door, outdoor installation' },
  { slug: 'dynamic-santiago-infrared', prompt: 'Professional product photo of an indoor infrared sauna cabin, hemlock wood, glass door, 2 person size' },

  // Heaters
  { slug: 'harvia-legend-wood-burning', prompt: 'Professional product photo of a wood burning sauna heater, black steel stove with stones, Finnish traditional design' },
  { slug: 'harvia-electric-heater', prompt: 'Professional product photo of a modern electric sauna heater, cylindrical stainless steel Harvia design, white background' },
  { slug: 'tylo-pure-combi', prompt: 'Professional product photo of a combination steam dry sauna heater, modern wall mounted unit, white background' },

  // Tech
  { slug: 'ultimate-ears-wonderboom-2', prompt: 'Professional product photo of a waterproof Bluetooth speaker, round colorful portable audio device, white background' },
  { slug: 'ip68-led-strip-lights', prompt: 'Professional product photo of LED strip light roll, waterproof flexible RGB tape, white background' },
  { slug: 'himalayan-salt-lamp', prompt: 'Professional product photo of a pink Himalayan salt lamp, warm amber glow, natural crystal chunk, dark background' },
  { slug: 'smart-home-sauna-controller', prompt: 'Professional product photo of a digital sauna control panel, touchscreen thermostat interface, modern smart home device' },

  // Maintenance
  { slug: 'biozap-sauna-cleaner', prompt: 'Professional product photo of a spray bottle wood cleaner, eco friendly natural sauna care product, white background' },
  { slug: 'paraffin-wood-oil-treatment', prompt: 'Professional product photo of a wood oil treatment bottle, amber liquid sauna wood care, white background' },
  { slug: 'rainleaf-microfiber-towel', prompt: 'Professional product photo of a folded microfiber sports towel, compact travel size, quick dry fabric, white background' }
];

const outputDir = 'public/images/gear/products';

async function generateImage(product) {
  const outputPath = path.join(outputDir, `${product.slug}.png`);

  // Skip if already exists and is large enough (> 50KB)
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    if (stats.size > 50000) {
      console.log(`⏭️  Skip: ${product.slug} (exists, ${Math.round(stats.size/1024)}KB)`);
      return true;
    }
  }

  console.log(`🎨 Generating: ${product.slug}...`);

  try {
    execSync(
      `GEMINI_API_KEY="${GEMINI_API_KEY}" npx nanobanana "${product.prompt}" --output ${outputPath}`,
      {
        stdio: 'pipe',
        timeout: 60000,
        cwd: process.cwd()
      }
    );

    // Check if file was created and is valid
    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      console.log(`✅ Saved: ${product.slug} (${Math.round(stats.size/1024)}KB)`);
      return true;
    }

    console.log(`❌ No file created for ${product.slug}`);
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

    // Rate limit: wait 3 seconds between requests
    await new Promise(r => setTimeout(r, 3000));
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
