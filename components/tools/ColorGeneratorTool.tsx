"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SparklesIcon,
  CheckIcon,
  RefreshCwIcon,
  Loader2Icon,
  CopyIcon,
} from "lucide-react"

interface ColorPalette {
  name: string
  hex: string
  role: string
}

interface ColorScheme {
  palette: ColorPalette[]
  description: string
}

type ColorFormat = "HEX" | "RGB" | "HSL" | "oklch"

const PRESET_PROMPTS = [
  "科技感蓝色调",
  "温暖的日落",
  "森林自然绿",
  "梦幻紫罗兰",
  "极简黑白灰",
  "活力糖果色",
  "深海神秘感",
  "复古胶片感",
]

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  const rf = r / 255
  const gf = g / 255
  const bf = b / 255

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

  const lr = toLinear(rf)
  const lg = toLinear(gf)
  const lb = toLinear(bf)

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

  const lL = Math.cbrt(l)
  const mL = Math.cbrt(m)
  const sL = Math.cbrt(s)

  const L = 0.2104542553 * lL + 0.793617785 * mL - 0.0040720468 * sL
  const a = 1.9779984951 * lL - 2.428592205 * mL + 0.4505937099 * sL
  const bVal = 0.0259040371 * lL + 0.7827717662 * mL - 0.808675766 * sL

  const c = Math.sqrt(a * a + bVal * bVal)
  let h = Math.atan2(bVal, a) * (180 / Math.PI)
  if (h < 0) h += 360

  return {
    l: Math.round(L * 100),
    c: Math.round(c * 100 * 100) / 100,
    h: Math.round(h),
  }
}

function formatColor(hex: string, format: ColorFormat): string {
  if (format === "HEX") return hex.toUpperCase()

  const { r, g, b } = hexToRgb(hex)

  if (format === "RGB") {
    return `rgb(${r}, ${g}, ${b})`
  }

  if (format === "HSL") {
    const { h, s, l } = rgbToHsl(r, g, b)
    return `hsl(${h}, ${s}%, ${l}%)`
  }

  if (format === "oklch") {
    const { l, c, h } = rgbToOklch(r, g, b)
    return `oklch(${l}% ${c} ${h})`
  }

  return hex
}

export function ColorGeneratorTool() {
  const [prompt, setPrompt] = useState("")
  const [colorScheme, setColorScheme] = useState<ColorScheme | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)
  const [colorFormat, setColorFormat] = useState<ColorFormat>("HEX")

  const generateScheme = useCallback(async (userPrompt: string) => {
    if (!userPrompt.trim()) return

    setIsLoading(true)
    setError(null)
    setColorScheme(null)

    try {
      const response = await fetch("/api/color-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "生成失败")
      }

      const data: ColorScheme = await response.json()
      setColorScheme(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handlePresetClick = (preset: string) => {
    setPrompt(preset)
    generateScheme(preset)
  }

  const copyToClipboard = async (hex: string, index: number) => {
    try {
      const text = formatColor(hex, colorFormat)
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      setError("复制失败")
    }
  }

  const copyAllColors = async () => {
    if (!colorScheme) return
    try {
      const lines = colorScheme.palette.map(
        (color) => `${color.name}: ${formatColor(color.hex, colorFormat)}`
      )
      const text = `-- Color Palette (${colorFormat})\n${lines.join("\n")}`
      await navigator.clipboard.writeText(text)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    } catch {
      setError("复制失败")
    }
  }

  const getContrastColor = (hex: string): string => {
    const { r, g, b } = hexToRgb(hex)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? "#000000" : "#FFFFFF"
  }

  const roleLabels: Record<string, string> = {
    primary: "主色",
    secondary: "辅色",
    accent: "强调",
    background: "背景",
    text: "文字",
    dark: "深色",
    light: "浅色",
  }

  const formatButtons: ColorFormat[] = ["HEX", "RGB", "HSL", "oklch"]

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <SparklesIcon className="size-6 text-primary" />
          <h2 className="text-2xl font-bold">AI 智能配色</h2>
        </div>
        <p className="text-muted-foreground">
          输入描述词，AI 为你生成完美的配色方案
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              placeholder="输入描述词，如「科技感蓝色调」「温暖日落」..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  generateScheme(prompt)
                }
              }}
              className="flex-1 text-base h-12"
              disabled={isLoading}
            />
            <Button
              onClick={() => generateScheme(prompt)}
              disabled={isLoading || !prompt.trim()}
              size="lg"
              className="h-12 px-6"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  生成中
                </>
              ) : (
                <>
                  <SparklesIcon className="size-4 mr-2" />
                  生成
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">快捷开始：</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((preset) => (
            <Badge
              key={preset}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
              onClick={() => handlePresetClick(preset)}
            >
              {preset}
            </Badge>
          ))}
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2Icon className="size-12 animate-spin text-primary" />
              <p className="text-muted-foreground">AI 正在思考配色方案...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {colorScheme && !isLoading && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <SparklesIcon className="size-5 text-primary" />
                  AI 配色方案
                </CardTitle>
                <div className="flex gap-1">
                  {formatButtons.map((fmt) => (
                    <Button
                      key={fmt}
                      variant={colorFormat === fmt ? "default" : "outline"}
                      size="sm"
                      onClick={() => setColorFormat(fmt)}
                      className="h-8 px-3 text-xs"
                    >
                      {fmt}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {colorScheme.description}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colorScheme.palette.map((color, index) => (
              <Card
                key={index}
                className="overflow-hidden group cursor-pointer"
                onClick={() => copyToClipboard(color.hex, index)}
              >
                <div
                  className="h-28 flex items-center justify-center relative"
                  style={{ backgroundColor: color.hex }}
                >
                  <span
                    className="font-mono text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center"
                    style={{ color: getContrastColor(color.hex) }}
                  >
                    {formatColor(color.hex, colorFormat)}
                  </span>
                  {copiedIndex === index && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                    >
                      <CheckIcon
                        className="size-8"
                        style={{ color: getContrastColor(color.hex) }}
                      />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <p className="font-medium text-sm truncate">{color.name}</p>
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-muted-foreground font-mono truncate">
                        {formatColor(color.hex, colorFormat)}
                      </code>
                      <Badge variant="secondary" className="text-xs shrink-0 ml-1">
                        {roleLabels[color.role] || color.role}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={copyAllColors}
              className="gap-2"
            >
              {copiedAll ? (
                <>
                  <CheckIcon className="size-4" />
                  已复制
                </>
              ) : (
                <>
                  <CopyIcon className="size-4" />
                  复制全部
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => generateScheme(prompt)}
              className="gap-2"
            >
              <RefreshCwIcon className="size-4" />
              重新生成
            </Button>
          </div>
        </div>
      )}

      {!colorScheme && !isLoading && !error && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                <SparklesIcon className="size-8 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">开始生成你的配色方案</p>
                <p className="text-sm text-muted-foreground">
                  输入描述词或选择一个预设标签
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
