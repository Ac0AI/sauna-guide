#!/usr/bin/env node

/**
 * Simple tests for gear utility functions
 * Run with: node scripts/test-gear-utils.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load the gear data directly since we can't import TypeScript
const __dirname = dirname(fileURLToPath(import.meta.url));
const gearData = JSON.parse(readFileSync(join(__dirname, '../src/data/gear-merged.json'), 'utf-8'));

// Simple slugify function (same as in gear.ts)
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Test runner
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${error.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined, got ${actual}`);
      }
    },
    toBeArray() {
      if (!Array.isArray(actual)) {
        throw new Error(`Expected array, got ${typeof actual}`);
      }
    }
  };
}

// Get all products (simulating getAllProducts)
function getAllProducts() {
  return gearData.categories.flatMap(cat =>
    cat.products.map(p => ({ ...p, category: cat.id }))
  );
}

// Tests
console.log('\nGear Utilities Tests\n' + '='.repeat(40));

test('gearData has categories', () => {
  expect(gearData.categories).toBeArray();
  expect(gearData.categories.length).toBeGreaterThan(0);
});

test('getAllProducts returns array of products', () => {
  const products = getAllProducts();
  expect(products).toBeArray();
  expect(products.length).toBeGreaterThan(50);
});

test('all products have required fields', () => {
  const products = getAllProducts();
  products.forEach(p => {
    expect(p.slug).toBeDefined();
    expect(p.name).toBeDefined();
    expect(p.brand).toBeDefined();
    expect(p.price).toBeDefined();
    expect(p.purchaseLinks).toBeArray();
  });
});

test('all slugs are unique', () => {
  const products = getAllProducts();
  const slugs = products.map(p => p.slug);
  const uniqueSlugs = new Set(slugs);
  expect(uniqueSlugs.size).toBe(slugs.length);
});

test('slugify generates correct slugs', () => {
  expect(slugify('KOLO Bucket and Ladle Set')).toBe('kolo-bucket-and-ladle-set');
  expect(slugify('by itu Sauna Hat')).toBe('by-itu-sauna-hat');
  expect(slugify('100-Gallon Stock Tank')).toBe('100-gallon-stock-tank');
});

test('getProductBySlug returns correct product', () => {
  const products = getAllProducts();
  const product = products.find(p => p.slug === 'sensorpush-ht1-thermometer');
  expect(product).toBeDefined();
  expect(product.name).toBe('SensorPush HT1 Thermometer');
});

test('purchaseLinks have valid structure', () => {
  const products = getAllProducts();
  products.forEach(p => {
    if (p.purchaseLinks.length > 0) {
      p.purchaseLinks.forEach(link => {
        expect(link.name).toBeDefined();
        expect(link.url).toBeDefined();
        expect(['amazon', 'manufacturer', 'retailer'].includes(link.type)).toBe(true);
      });
    }
  });
});

test('categories have products', () => {
  gearData.categories.forEach(cat => {
    expect(cat.products.length).toBeGreaterThan(0);
  });
});

// Summary
console.log('\n' + '='.repeat(40));
console.log(`Tests: ${passed + failed} total, ${passed} passed, ${failed} failed`);
console.log('='.repeat(40));

process.exit(failed > 0 ? 1 : 0);
