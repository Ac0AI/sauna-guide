#!/usr/bin/env node

/**
 * Validate gear data structure and integrity
 */

import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/gear-merged.json', 'utf-8'));

let errors = [];
let warnings = [];
const slugs = new Set();

console.log('Validating gear data...\n');

// Check categories
data.categories.forEach(category => {
  if (!category.id) errors.push(`Category missing id: ${JSON.stringify(category)}`);
  if (!category.name) errors.push(`Category missing name: ${category.id}`);
  if (!category.products || !Array.isArray(category.products)) {
    errors.push(`Category ${category.id} has no products array`);
    return;
  }

  // Check products
  category.products.forEach(product => {
    const ctx = `[${category.id}/${product.name || 'UNNAMED'}]`;

    // Required fields
    if (!product.slug) errors.push(`${ctx} Missing slug`);
    if (!product.name) errors.push(`${ctx} Missing name`);
    if (!product.brand) errors.push(`${ctx} Missing brand`);
    if (!product.price) errors.push(`${ctx} Missing price`);
    if (!product.description) errors.push(`${ctx} Missing description`);
    if (!product.why) errors.push(`${ctx} Missing why`);

    // Slug uniqueness
    if (product.slug) {
      if (slugs.has(product.slug)) {
        errors.push(`${ctx} Duplicate slug: ${product.slug}`);
      }
      slugs.add(product.slug);
    }

    // Purchase links
    if (!product.purchaseLinks || product.purchaseLinks.length === 0) {
      warnings.push(`${ctx} No purchase links`);
    } else {
      product.purchaseLinks.forEach((link, i) => {
        if (!link.name) errors.push(`${ctx} Purchase link ${i} missing name`);
        if (!link.url) errors.push(`${ctx} Purchase link ${i} missing url`);
        if (!['amazon', 'manufacturer', 'retailer'].includes(link.type)) {
          errors.push(`${ctx} Purchase link ${i} invalid type: ${link.type}`);
        }
      });
    }

    // Image check
    if (!product.image) {
      warnings.push(`${ctx} No image`);
    } else if (product.image.startsWith('/images/')) {
      const imagePath = `public${product.image}`;
      if (!fs.existsSync(imagePath)) {
        warnings.push(`${ctx} Image file not found: ${imagePath}`);
      }
    }
  });
});

// Summary
console.log('='.repeat(50));
console.log('Validation Results');
console.log('='.repeat(50));
console.log(`Categories: ${data.categories.length}`);
console.log(`Products: ${slugs.size}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log('='.repeat(50));

if (errors.length > 0) {
  console.log('\nERRORS:');
  errors.forEach(e => console.log(`  ❌ ${e}`));
}

if (warnings.length > 0) {
  console.log('\nWARNINGS:');
  warnings.slice(0, 20).forEach(w => console.log(`  ⚠️  ${w}`));
  if (warnings.length > 20) {
    console.log(`  ... and ${warnings.length - 20} more`);
  }
}

if (errors.length === 0) {
  console.log('\n✅ All validations passed!');
  process.exit(0);
} else {
  console.log('\n❌ Validation failed with errors');
  process.exit(1);
}
