#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('Please set GEMINI_API_KEY or GOOGLE_AI_API_KEY')
  process.exit(1)
}

const guideImages = [
  {
    file: 'sauna-breathing-techniques-guide.jpg',
    prompt:
      'Scandinavian wooden sauna interior at dusk, soft steam ribbons, close-up composition centered on calm breathing motif using subtle condensation waves in warm light, minimal and elegant, editorial wellness photography, no people, no text, cinematic but natural, 16:9',
  },
  {
    file: 'morning-vs-evening-sauna.jpg',
    prompt:
      'Split-scene editorial image: left side sunrise sauna glow with cool morning tones, right side evening candle-lit sauna ambience with deep amber tones, same minimalist Nordic sauna interior, visual comparison concept, no people, no text, premium magazine style, 16:9',
  },
  {
    file: 'home-sauna-cost-guide-2026.jpg',
    prompt:
      'Modern home sauna planning scene: compact indoor sauna corner, measuring tape, wood samples, design notebook, clean Scandinavian interior, practical homeowner vibe, warm neutral palette, no people, no text, realistic architectural photography, 16:9',
  },
  {
    file: 'sauna-heart-rate-zones-guide.jpg',
    prompt:
      'Athletic recovery sauna interior with subtle wearable health tracker concept, steam and warm cedar textures, focused performance-wellness mood, minimalist composition, no visible logos, no text, professional sports editorial photography, 16:9',
  },
]

async function generateImage(item) {
  console.log(`Generating ${item.file}...`)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate an image: ${item.prompt}` }] }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          responseMimeType: 'text/plain',
        },
      }),
    }
  )

  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${response.status}`)
  }

  const parts = data?.candidates?.[0]?.content?.parts || []
  const imagePart = parts.find((p) => p.inlineData?.data)

  if (!imagePart) {
    throw new Error('No image in model response')
  }

  const buffer = Buffer.from(imagePart.inlineData.data, 'base64')
  const outDir = path.join('public', 'images', 'guides')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, item.file)
  fs.writeFileSync(outPath, buffer)
  console.log(`Saved ${outPath}`)
}

async function main() {
  let ok = 0
  for (const item of guideImages) {
    try {
      await generateImage(item)
      ok += 1
    } catch (err) {
      console.error(`Failed ${item.file}:`, err.message)
    }
    await new Promise((resolve) => setTimeout(resolve, 3500))
  }
  console.log(`Done. ${ok}/${guideImages.length} generated.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
