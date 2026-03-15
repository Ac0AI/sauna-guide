#!/usr/bin/env node

/**
 * Score all pages and output a quality report.
 *
 * Usage:
 *   node scripts/score-pages.mjs
 *   node scripts/score-pages.mjs --type saunas
 *   node scripts/score-pages.mjs --type brands
 *   node scripts/score-pages.mjs --min-score 60
 */

import fs from 'node:fs'
import { scoreSauna, scoreBrand, generateReport } from './lib/scoring.mjs'

const args = process.argv.slice(2)
const typeFilter = args.includes('--type') ? args[args.indexOf('--type') + 1] : null
const minScore = args.includes('--min-score') ? parseInt(args[args.indexOf('--min-score') + 1], 10) : null

function loadSaunas() {
  const data = JSON.parse(fs.readFileSync('src/data/saunas.json', 'utf-8'))
  return data.saunas || []
}

function loadBrands() {
  const data = JSON.parse(fs.readFileSync('src/data/manufacturers.json', 'utf-8'))
  return data.manufacturers || []
}

function printReport(report) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  ${report.label}`)
  console.log(`${'='.repeat(60)}`)
  console.log(`  Total: ${report.totalItems} | Avg score: ${report.avgScore}/100`)
  console.log(`  Publish-ready (>=60): ${report.publishReady} | Needs work (<40): ${report.needsWork}`)
  console.log()

  for (const item of report.items) {
    const bar = '\u2588'.repeat(Math.round(item.score / 5)) + '\u2591'.repeat(20 - Math.round(item.score / 5))
    const flag = item.score < 40 ? '  !!' : item.score >= 60 ? '  OK' : ''
    console.log(`  ${bar} ${item.score.toString().padStart(3)}/100  ${item.name}${flag}`)

    if (minScore && item.score < minScore && item.missing.length > 0) {
      const topMissing = item.missing.slice(0, 3).map((m) => m.field).join(', ')
      console.log(`           Missing: ${topMissing}`)
    }
  }
}

// Main
const reports = []

if (!typeFilter || typeFilter === 'saunas') {
  const saunas = loadSaunas()
  reports.push(generateReport(saunas, scoreSauna, 'Sauna Pages'))
}

if (!typeFilter || typeFilter === 'brands') {
  const brands = loadBrands()
  reports.push(generateReport(brands, scoreBrand, 'Brand Pages'))
}

for (const report of reports) {
  printReport(report)
}

// Write JSON report
const outputPath = 'src/data/quality-scores.json'
fs.writeFileSync(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), reports }, null, 2))
console.log(`\nReport saved to ${outputPath}`)
