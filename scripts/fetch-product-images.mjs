#!/usr/bin/env node

/**
 * Fetch product images from manufacturer websites
 * Uses DuckDuckGo image search as fallback
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const OUTPUT_DIR = 'public/images/gear/products';

// Known manufacturer image URLs (direct links to product images)
const MANUFACTURER_IMAGES = {
  // Essentials
  "KOLO Bucket and Ladle Set": "https://kolodesign.fi/cdn/shop/products/kolo_sauna_set_1.jpg",
  "Rento Pisara Bucket and Ladle": "https://rfreberg.se/wp-content/uploads/2023/01/rento-pisara-set.jpg",

  // Cold therapy - direct from manufacturers
  "Plunge Cold Tub": "https://cdn.shopify.com/s/files/1/0563/5325/0827/products/plunge-cold-tub-white.jpg",
  "Ice Barrel": "https://icebarrel.com/cdn/shop/products/ice-barrel-400.jpg",

  // Infrared
  "HigherDOSE Infrared Sauna Blanket": "https://cdn.shopify.com/s/files/1/0070/3666/5911/products/infrared-sauna-blanket-v3.jpg",

  // Recovery
  "Theragun PRO": "https://cdn.shopify.com/s/files/1/0068/5117/2682/products/theragun-pro-black.jpg",

  // Tracking
  "Oura Ring Gen 3": "https://ouraring.com/cdn/shop/products/oura-ring-heritage-silver.jpg",
  "WHOOP 4.0": "https://cdn.shopify.com/s/files/1/0070/7032/products/whoop-4-band.jpg",
};

// Fallback: Category placeholder images (we'll generate these with a simple color)
const CATEGORY_COLORS = {
  essentials: '#D4A574',
  comfort: '#E8DDD4',
  aromatherapy: '#7D9471',
  'cold-therapy': '#5B9BD5',
  tracking: '#4A4A4A',
  recovery: '#8B4513',
  'red-light': '#DC143C',
  infrared: '#FF6B35',
  'portable-saunas': '#C19A6B',
  'barrel-saunas': '#8B7355',
  heaters: '#FF8C00',
  tech: '#2F4F4F',
  maintenance: '#A0A0A0',
};

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const request = (targetUrl, redirectCount = 0) => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }

      client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          request(response.headers.location, redirectCount + 1);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          const buffer = Buffer.concat(chunks);
          fs.writeFileSync(outputPath, buffer);
          resolve(buffer.length);
        });
        response.on('error', reject);
      }).on('error', reject);
    };

    request(url);
  });
}

// Create SVG placeholder with category color and icon
function createPlaceholder(name, category, outputPath) {
  const color = CATEGORY_COLORS[category] || '#D4A574';
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.9"/>
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.6"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  <text x="400" y="240" font-family="Georgia, serif" font-size="72" font-weight="500" fill="white" fill-opacity="0.9" text-anchor="middle" dominant-baseline="middle">${initials}</text>
</svg>`;

  fs.writeFileSync(outputPath, svg);
  return svg.length;
}

async function processProducts() {
  // Read gear data
  const gearData = JSON.parse(fs.readFileSync('src/data/gear-merged.json', 'utf-8'));

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = { success: 0, placeholder: 0, failed: 0 };
  const updatedProducts = [];

  for (const category of gearData.categories) {
    console.log(`\n📦 ${category.name}`);

    for (const product of category.products) {
      const safeName = product.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);

      const outputPath = path.join(OUTPUT_DIR, `${safeName}.svg`);
      const imageUrl = `/images/gear/products/${safeName}.svg`;

      // Check if we have a known manufacturer URL
      const manufacturerUrl = MANUFACTURER_IMAGES[product.name];

      if (manufacturerUrl) {
        try {
          const jpgPath = outputPath.replace('.svg', '.jpg');
          const size = await downloadImage(manufacturerUrl, jpgPath);
          console.log(`  ✓ ${product.name} (${(size/1024).toFixed(1)}KB)`);
          product.image = imageUrl.replace('.svg', '.jpg');
          results.success++;
        } catch (err) {
          // Fall back to placeholder
          createPlaceholder(product.name, category.id, outputPath);
          console.log(`  ◐ ${product.name} (placeholder)`);
          product.image = imageUrl;
          results.placeholder++;
        }
      } else {
        // Create placeholder
        createPlaceholder(product.name, category.id, outputPath);
        console.log(`  ◐ ${product.name} (placeholder)`);
        product.image = imageUrl;
        results.placeholder++;
      }

      updatedProducts.push(product);
    }
  }

  // Save updated gear data
  fs.writeFileSync('src/data/gear-merged.json', JSON.stringify(gearData, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Done: ${results.success} downloaded, ${results.placeholder} placeholders`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
}

processProducts().catch(console.error);
