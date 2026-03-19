import { GoogleGenAI } from '@google/genai'
import * as fs from 'node:fs'
import * as path from 'node:path'

const DEFAULT_MODEL = 'gemini-2.5-flash-image'

let client = null

function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Missing GEMINI_API_KEY. Set it in .env.local.')
    }

    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  }

  return client
}

export async function generateGeminiImage({
  prompt,
  outputPath,
  model = DEFAULT_MODEL,
}) {
  if (!prompt) {
    throw new Error('Image prompt is required')
  }

  if (!outputPath) {
    throw new Error('outputPath is required')
  }

  const ai = getClient()
  const absoluteOutputPath = path.isAbsolute(outputPath)
    ? outputPath
    : path.join(process.cwd(), outputPath)

  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true })

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseModalities: ['IMAGE', 'TEXT'] },
  })

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData?.data) {
      const buffer = Buffer.from(part.inlineData.data, 'base64')
      fs.writeFileSync(absoluteOutputPath, buffer)
      return {
        outputPath: absoluteOutputPath,
        sizeBytes: buffer.length,
      }
    }
  }

  const textResponse = response.candidates?.[0]?.content?.parts
    ?.filter((part) => typeof part.text === 'string')
    .map((part) => part.text)
    .join(' ')
    .trim()

  throw new Error(textResponse || 'Gemini did not return image data')
}
