import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export interface ColorPalette {
  name: string
  hex: string
  role: string
}

export interface ColorScheme {
  palette: ColorPalette[]
  description: string
}

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("未配置 ANTHROPIC_API_KEY")
  }
  return new Anthropic({
    baseURL: "https://api.minimaxi.com/anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

type ContentBlock = {
  type: string
  text?: string
  thinking?: string
}

function extractTextFromContent(content: ContentBlock[]): string {
  for (const block of content) {
    if (block.type === "text" && block.text) {
      return block.text
    }
  }
  throw new Error("生成配色方案失败：未找到文本内容")
}

function parseColorResponse(text: string): ColorScheme {
  const firstBrace = text.indexOf("{")
  const lastBrace = text.lastIndexOf("}")
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("生成配色方案失败：无法解析返回数据")
  }
  const jsonStr = text.substring(firstBrace, lastBrace + 1)
  const data = JSON.parse(jsonStr)

  if (data.palette && Array.isArray(data.palette)) {
    return {
      palette: data.palette.map((c: { name: string; hex: string; role?: string }) => ({
        name: c.name,
        hex: c.hex,
        role: c.role || "secondary",
      })),
      description: data.description || "",
    }
  }

  if (data.colors && typeof data.colors === "object") {
    const palette: ColorPalette[] = []
    const roleMapping: Record<string, string> = {
      primary: "primary",
      secondary: "secondary",
      accent: "accent",
      surface: "background",
      text: "text",
      textMuted: "text",
      success: "accent",
      warning: "accent",
      error: "accent",
    }

    for (const [key, value] of Object.entries(data.colors)) {
      const color = value as { name: string; hex: string; usage?: string }
      palette.push({
        name: color.name || key,
        hex: color.hex,
        role: roleMapping[key] || "secondary",
      })
    }

    return {
      palette,
      description: data.description || "",
    }
  }

  throw new Error("生成配色方案失败：无法解析返回数据")
}

async function generateColorScheme(prompt: string): Promise<ColorScheme> {
  const client = getAnthropicClient()

  const message = await client.messages.create({
    model: "MiniMax-M2.5",
    max_tokens: 4096,
    system: `You are an expert color scheme designer. Generate a beautiful, harmonious color palette based on the user's description.

Output a JSON object with this structure:
{
  "palette": [
    {"name": "Color Name", "hex": "#RRGGBB", "role": "primary|secondary|accent|background|text"},
    ...
  ],
  "description": "Brief description in Chinese"
}

Rules:
- Provide 6-8 colors in the palette
- Colors must be harmonious
- Use proper hex format (#RRGGBB)
- Only output JSON`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text" as const,
            text: `生成一个配色方案，主题是：${prompt}`,
          },
        ],
      },
    ],
  })

  const text = extractTextFromContent(message.content)
  return parseColorResponse(text)
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "请提供有效的描述词" },
        { status: 400 }
      )
    }

    const scheme = await generateColorScheme(prompt)
    return NextResponse.json(scheme)
  } catch (error) {
    console.error("Color generation error:", error)
    const message =
      error instanceof Error ? error.message : "生成配色方案失败，请稍后重试"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
