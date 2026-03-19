#!/usr/bin/env node

/**
 * Gemini Image Generator for Sauna Guide
 *
 * Usage:
 *   node --env-file=.env.local scripts/generate-image.mjs "prompt" output.jpg
 *   node --env-file=.env.local scripts/generate-image.mjs --from-file prompts.json
 *   pnpm run generate-image "prompt" output.jpg
 *
 * Uses @google/genai SDK with gemini-2.5-flash-image model.
 * Images are saved to public/images/<output>.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { generateGeminiImage } from './lib/gemini-image.mjs'

const MODEL = 'gemini-2.5-flash-image'
const DELAY_MS = 3000 // delay between requests to avoid rate limiting

async function generateImage(prompt, outputName) {
  const outputPath = path.join('public', 'images', outputName)
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  console.log(`  Generating: ${outputName}...`)

  const result = await generateGeminiImage({
    prompt,
    outputPath,
    model: MODEL,
  })
  const sizeKB = (result.sizeBytes / 1024).toFixed(1)
  console.log(`  ✓ Saved: ${outputPath} (${sizeKB} KB)`)
  return true
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--')

  // Mode 1: --from-file prompts.json
  if (args[0] === '--from-file') {
    const file = args[1]
    if (!file) {
      console.error('Usage: generate-image.mjs --from-file <prompts.json>')
      console.error('JSON format: [{ "name": "guides/example.jpg", "prompt": "..." }, ...]')
      process.exit(1)
    }
    const prompts = JSON.parse(fs.readFileSync(file, 'utf-8'))
    const items = Array.isArray(prompts) ? prompts : prompts.images || [prompts]

    console.log(`\n🔥 Generating ${items.length} images with ${MODEL}\n`)

    let success = 0
    for (const item of items) {
      try {
        const ok = await generateImage(item.prompt, item.name)
        if (ok) success++
      } catch (e) {
        console.log(`  ✗ Error: ${e.message}`)
      }
      if (items.indexOf(item) < items.length - 1) {
        await new Promise((r) => setTimeout(r, DELAY_MS))
      }
    }

    console.log(`\n✅ Done: ${success}/${items.length} images generated\n`)
    return
  }

  // Mode 2: generate-image.mjs "prompt" output.jpg
  if (args.length >= 2) {
    const prompt = args[0]
    const output = args[1]
    console.log(`\n🔥 Generating image with ${MODEL}\n`)
    try {
      await generateImage(prompt, output)
    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`)
      process.exit(1)
    }
    return
  }

  console.error('Usage:')
  console.error('  generate-image.mjs "prompt text" output-path.jpg')
  console.error('  generate-image.mjs --from-file prompts.json')
  console.error('')
  console.error('Output paths are relative to public/images/')
  console.error('JSON format: [{ "name": "guides/example.jpg", "prompt": "..." }]')
  process.exit(1)
}

main()
