#!/usr/bin/env node

/**
 * Migrate gear-merged.json to new structure:
 * - Add slug field (URL-friendly ID)
 * - Convert link → purchaseLinks array
 */

import fs from 'fs';

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Read current data
const data = JSON.parse(fs.readFileSync('src/data/gear-merged.json', 'utf-8'));

let migrated = 0;
const slugs = new Set();

// Migrate each product
data.categories.forEach(category => {
  category.products.forEach(product => {
    // Generate slug if not present
    if (!product.slug) {
      let slug = slugify(product.name);

      // Ensure unique slug
      let counter = 1;
      let uniqueSlug = slug;
      while (slugs.has(uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      slugs.add(uniqueSlug);
      product.slug = uniqueSlug;
    } else {
      slugs.add(product.slug);
    }

    // Convert link to purchaseLinks if not already migrated
    if (product.link && !product.purchaseLinks) {
      product.purchaseLinks = [{
        name: 'Amazon',
        url: product.link,
        type: 'amazon'
      }];
      delete product.link;
      migrated++;
    }

    // Ensure purchaseLinks exists
    if (!product.purchaseLinks) {
      product.purchaseLinks = [];
    }
  });
});

// Update lastUpdated
data.lastUpdated = new Date().toISOString().split('T')[0];

// Save migrated data
fs.writeFileSync('src/data/gear-merged.json', JSON.stringify(data, null, 2));

console.log('='.repeat(50));
console.log(`Migrated ${migrated} products to new structure`);
console.log(`Total products: ${data.totalProducts}`);
console.log(`Unique slugs: ${slugs.size}`);
console.log('='.repeat(50));

// Print slug examples
console.log('\nSlug examples:');
data.categories.slice(0, 2).forEach(cat => {
  cat.products.slice(0, 3).forEach(p => {
    console.log(`  ${p.slug} -> ${p.name}`);
  });
});
