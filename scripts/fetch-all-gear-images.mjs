#!/usr/bin/env node

/**
 * Fetch product images for ALL gear products using Firecrawl
 * Scrapes manufacturer/retailer websites for real product photos
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-bc24f10a07104dc9a7eb377a19ee8fad';
const OUTPUT_DIR = 'public/images/gear/products';

// Product URLs - prioritized list of products to fetch
// Format: "Product Name": ["url1", "url2", ...] (tries in order)
const PRODUCT_SOURCES = {
  // === ESSENTIALS ===
  "KOLO Bucket and Ladle Set": [
    "https://www.amazon.com/KOLO-Sauna-Bucket-Ladle-Set/dp/B08KZQB8ZL"
  ],
  "Rento Pisara Bucket and Ladle": [
    "https://www.amazon.com/Rento-Aluminium-Sauna-Bucket-Champagne/dp/B01N7XZPK2"
  ],
  "SensorPush HT1 Thermometer": [
    "https://www.amazon.com/SensorPush-Wireless-Thermometer-Hygrometer-Android/dp/B01AEQ9X9I"
  ],
  "Fischer German Thermometer": [
    "https://www.amazon.com/Fischer-Sauna-Thermometer-Hygrometer/dp/B000F8O9F8"
  ],
  "15-Minute Cedar Sand Timer": [
    "https://www.amazon.com/Sauna-Sand-Timer-Minutes-Cedar/dp/B07YDXC3Z2"
  ],
  "Olivine Diabase Sauna Stones": [
    "https://www.amazon.com/Sauna-Rocks-Olivine-Diabase-Stones/dp/B08QZ3VLTM"
  ],

  // === COMFORT & RELAXATION ===
  "by itu Sauna Hat": [
    "https://www.amazon.com/itu-Sauna-Hat-Wool-Felt/dp/B09XYPQVVD"
  ],
  "S-Shaped Cedar Backrest": [
    "https://www.amazon.com/Cedar-Sauna-Backrest-S-Shape/dp/B07H8HZ7V1"
  ],
  "Cedar Headrest Pillow": [
    "https://www.amazon.com/Sauna-Headrest-Cedar-Wood-Pillow/dp/B07H8J6JFN"
  ],
  "Bamboo Floor Mat": [
    "https://www.amazon.com/Bamboo-Bath-Floor-Mat-Bathroom/dp/B07YZRQS7M"
  ],
  "Turkish Cotton Peshtemal": [
    "https://www.amazon.com/Turkish-Peshtemal-Towel-Cotton-Beach/dp/B07V6GLMXZ"
  ],
  "Waffle Weave Spa Robe": [
    "https://www.amazon.com/Waffle-Weave-Bathrobe-Lightweight-Kimono/dp/B07WVQVGGN"
  ],

  // === AROMATHERAPY ===
  "Eucalyptus Essential Oil": [
    "https://www.amazon.com/Eucalyptus-Essential-Oil-Therapeutic-Grade/dp/B00P6O7J5U"
  ],
  "Birch Essential Oil": [
    "https://www.amazon.com/Birch-Essential-Oil-Sweet-Therapeutic/dp/B01D8N3GDC"
  ],
  "Birch Vihta Whisk": [
    "https://www.amazon.com/Finnish-Birch-Vihta-Sauna-Whisk/dp/B07BFVQXW5"
  ],

  // === COLD THERAPY (some already fetched) ===
  "Penguin Chillers Setup": [
    "https://www.amazon.com/Penguin-Chillers-Glycol-Chiller-Homebrew/dp/B07BQZBFNP",
    "https://penguinchillers.com/products/"
  ],
  "Morozko Forge": [
    "https://morozkoforge.com/products/morozko-forge-cold-plunge"
  ],
  "100-Gallon Stock Tank": [
    "https://www.amazon.com/Rubbermaid-Commercial-Products-Stock-Tank/dp/B000HHO24M"
  ],

  // === TRACKING & WEARABLES ===
  "Whoop 4.0": [
    "https://www.amazon.com/WHOOP-4-0-Month-Membership-Optimization/dp/B09Z1F6YS6"
  ],

  // === RECOVERY TOOLS ===
  "Theragun Prime": [
    "https://www.therabody.com/us/en-us/theragun-prime.html"
  ],
  "Hypervolt": [
    "https://www.amazon.com/Hyperice-Hypervolt-Percussion-Massage-Device/dp/B07PXQMD6R"
  ],
  "LMNT Electrolytes": [
    "https://www.amazon.com/LMNT-Recharge-Electrolyte-Hydration-Powder/dp/B082WVNX4S"
  ],
  "Drip Drop": [
    "https://www.amazon.com/DripDrop-ORS-Electrolyte-Hydration-Dehydration/dp/B00OB0ZUXU"
  ],

  // === RED LIGHT THERAPY ===
  "Joovv Solo": [
    "https://joovv.com/products/joovv-solo"
  ],
  "Hooga HG300": [
    "https://www.amazon.com/Hooga-Red-Light-Therapy-Device/dp/B07WQYF9N1"
  ],

  // === INFRARED BLANKETS ===
  "HigherDOSE Infrared Blanket": [
    "https://www.sephora.com/product/higherdose-infrared-sauna-blanket-P454825",
    "https://www.amazon.com/HigherDOSE-Infrared-Sauna-Blanket-Black/dp/B07QD7SBXZ"
  ],
  "MiHigh Infrared Blanket": [
    "https://www.amazon.com/MiHIGH-Infrared-Portable-Sauna-Blanket/dp/B08KZQC5VH"
  ],
  "Sunlighten Solo System": [
    "https://www.sunlighten.com/solo-system/"
  ],

  // === PORTABLE SAUNAS ===
  "SereneLife Portable Sauna": [
    "https://www.amazon.com/SereneLife-Portable-Infrared-Sauna-Spa/dp/B017YG9E92"
  ],
  "SaunaBox SmartSteam Kit": [
    "https://www.amazon.com/Sauna-Box-Portable-Steam-Generator/dp/B08NF6W1Y4"
  ],

  // === BARREL SAUNAS ===
  "Almost Heaven Barrel Sauna": [
    "https://www.amazon.com/Almost-Heaven-Saunas-Audra-Person/dp/B07DWJKZ9K"
  ],
  "Dundalk Leisurecraft": [
    "https://www.amazon.com/Dundalk-Leisurecraft-Canadian-Timber-Harmony/dp/B07PZ5F6CX"
  ],
  "Dynamic Santiago Infrared": [
    "https://www.amazon.com/Dynamic-Barcelona-Person-Infrared-Sauna/dp/B01N2JJ4Z3"
  ],

  // === SAUNA HEATERS ===
  "Harvia Legend Wood-Burning": [
    "https://www.amazon.com/Harvia-Legend-Wood-Burning-Sauna-Heater/dp/B00TY1WHSC"
  ],
  "Tylo Pure Combi": [
    "https://www.amazon.com/Tylo-Combi-RC-Sauna-Heater/dp/B07FN1K1RG"
  ],

  // === TECH & AUDIO ===
  "Ultimate Ears WONDERBOOM 2": [
    "https://www.amazon.com/Ultimate-Ears-WONDERBOOM-Bluetooth-Speaker/dp/B07NFLF43P"
  ],
  "Bose SoundLink Micro": [
    "https://www.amazon.com/Bose-SoundLink-Micro-Bluetooth-Speaker/dp/B074KKF4CF"
  ],
  "IP68 LED Strip Lights": [
    "https://www.amazon.com/Waterproof-LED-Strip-Lights-IP68/dp/B07VBWVFFV"
  ],
  "Himalayan Salt Lamp": [
    "https://www.amazon.com/Himalayan-Glow-Natural-Crystal-Dimmer/dp/B00VRJRCWK"
  ],

  // === CARE & MAINTENANCE ===
  "BioZap Sauna Cleaner": [
    "https://www.amazon.com/BioZap-Sauna-Cleaner-Wood-Safe/dp/B07Z7PJSXV"
  ],
  "Paraffin Wood Oil Treatment": [
    "https://www.amazon.com/Sauna-Wood-Oil-Paraffin-Treatment/dp/B01MYXQY1K"
  ],
  "Rainleaf Microfiber Towel": [
    "https://www.amazon.com/Rainleaf-Microfiber-Towel-Perfect-Camping/dp/B00FEN9URI"
  ]
};

async function firecrawlScrape(url) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      url: url,
      formats: ['html'],
      onlyMainContent: false,
      waitFor: 3000
    });

    const req = https.request({
      hostname: 'api.firecrawl.dev',
      port: 443,
      path: '/v1/scrape',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Parse error'));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function extractImageUrls(html, baseUrl) {
  const images = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1];

    // Skip icons and tiny images
    if (src.includes('logo') || src.includes('icon') || src.includes('favicon')) continue;
    if (src.includes('1x1') || src.includes('pixel') || src.includes('sprite')) continue;
    if (src.includes('svg') || src.includes('.gif')) continue;
    if (src.includes('loading') || src.includes('placeholder')) continue;

    // Make absolute URL
    if (src.startsWith('//')) {
      src = 'https:' + src;
    } else if (src.startsWith('/')) {
      const urlObj = new URL(baseUrl);
      src = urlObj.origin + src;
    }

    // Keep product-like images
    if (src.includes('product') || src.includes('cdn') || src.includes('shopify') ||
        src.includes('media-amazon') || src.includes('m.media') ||
        src.includes('cloudinary') || src.includes('imgix') ||
        src.includes('images-na') || src.includes('ssl-images') ||
        (src.includes('.jpg') || src.includes('.png') || src.includes('.webp'))) {
      images.push(src);
    }
  }

  return [...new Set(images)]; // Remove duplicates
}

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const request = (targetUrl, redirects = 0) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));

      let urlObj;
      try {
        urlObj = new URL(targetUrl);
      } catch (e) {
        return reject(new Error('Invalid URL'));
      }

      https.get({
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'image/*,*/*'
        }
      }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          return request(response.headers.location, redirects + 1);
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`HTTP ${response.statusCode}`));
        }

        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          // Only save if it's a real image (> 5KB)
          if (buffer.length > 5000) {
            fs.writeFileSync(outputPath, buffer);
            resolve(buffer.length);
          } else {
            reject(new Error('Image too small'));
          }
        });
        response.on('error', reject);
      }).on('error', reject);
    };

    request(url);
  });
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

async function processProduct(productName, urls) {
  const slug = slugify(productName);
  console.log(`\n📦 ${productName}`);

  for (const url of urls) {
    console.log(`   Trying: ${url.slice(0, 60)}...`);

    try {
      const result = await firecrawlScrape(url);

      if (!result.success) {
        console.log(`   ✗ Scrape failed`);
        continue;
      }

      const html = result.data?.html || '';
      const images = extractImageUrls(html, url);
      console.log(`   Found ${images.length} potential images`);

      if (images.length === 0) continue;

      // Try to download the first good image
      for (const imgUrl of images.slice(0, 5)) {
        try {
          const ext = imgUrl.includes('.png') ? 'png' : 'jpg';
          const outputPath = path.join(OUTPUT_DIR, `${slug}.${ext}`);
          const size = await downloadImage(imgUrl, outputPath);
          console.log(`   ✓ Downloaded: ${(size/1024).toFixed(1)}KB`);
          return { name: productName, path: `/images/gear/products/${slug}.${ext}` };
        } catch (err) {
          continue;
        }
      }
    } catch (error) {
      console.log(`   ✗ Error: ${error.message}`);
    }
  }

  console.log(`   ✗ Could not find any valid image`);
  return null;
}

async function main() {
  console.log('🔥 Fetching ALL gear product images with Firecrawl\n');
  console.log(`   Products to fetch: ${Object.keys(PRODUCT_SOURCES).length}`);
  console.log(`   Output directory: ${OUTPUT_DIR}\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];
  let success = 0;
  let skipped = 0;

  for (const [productName, urls] of Object.entries(PRODUCT_SOURCES)) {
    // Check if image already exists
    const slug = slugify(productName);
    const existingJpg = path.join(OUTPUT_DIR, `${slug}.jpg`);
    const existingPng = path.join(OUTPUT_DIR, `${slug}.png`);

    if (fs.existsSync(existingJpg) || fs.existsSync(existingPng)) {
      console.log(`\n⏭️  ${productName} (already exists)`);
      skipped++;
      continue;
    }

    const result = await processProduct(productName, urls);
    if (result) {
      results.push(result);
      success++;
    }

    // Rate limiting - be nice to the API
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Downloaded: ${success}`);
  console.log(`⏭️  Skipped (existing): ${skipped}`);
  console.log(`❌ Failed: ${Object.keys(PRODUCT_SOURCES).length - success - skipped}`);
  console.log('='.repeat(60));

  // Output results for updating gear-merged.json
  if (results.length > 0) {
    console.log('\n📝 New images to add to gear-merged.json:\n');
    results.forEach(r => {
      console.log(`  "${r.name}": "${r.path}"`);
    });

    // Save results to a JSON file for easy processing
    fs.writeFileSync('scripts/new-gear-images.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Saved to scripts/new-gear-images.json');
  }
}

main().catch(console.error);
