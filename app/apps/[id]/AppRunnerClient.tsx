"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SubApp } from "@/app/data/apps"
import { SnakeGame } from "@/components/games/SnakeGame"
import {
  ArrowLeftIcon,
  MaximizeIcon,
  MinimizeIcon,
} from "lucide-react"

interface AppRunnerClientProps {
  app: SubApp
}

export function AppRunnerClient({ app }: AppRunnerClientProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const categoryLabels = {
    games: "游戏",
    tools: "工具",
    interactive: "交互",
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-2"
              render={<Link href="/" />}
              nativeButton={false}
            >
              <ArrowLeftIcon className="size-4" />
              返回
            </Button>

            <div className="h-6 w-px bg-border" />

            <h1 className="font-semibold">{app.name}</h1>

            <Badge variant="secondary" className="rounded-lg text-xs">
              {categoryLabels[app.category]}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="rounded-xl gap-2"
            >
              {isFullscreen ? (
                <>
                  <MinimizeIcon className="size-4" />
                  退出全屏
                </>
              ) : (
                <>
                  <MaximizeIcon className="size-4" />
                  全屏
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="flex gap-4 max-w-6xl mx-auto w-full">
          <div className="flex-1 bg-card rounded-2xl shadow-lg border border-border/50 flex items-center justify-center overflow-hidden aspect-video">
            {app.id === "snake" ? (
              <SnakeGame />
            ) : (
              <div className="text-center">
                <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-primary">
                    {app.name.charAt(0)}
                  </span>
                </div>
                <p className="text-lg font-medium mb-2">{app.name}</p>
              </div>
            )}
          </div>

          <div className="w-72 bg-card rounded-2xl shadow-lg border border-border/50 p-4 flex flex-col">
            {app.thumbnail && (
              <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-xl mb-4 overflow-hidden">
                <img
                  src={app.thumbnail}
                  alt={app.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h2 className="font-semibold text-lg mb-2">{app.name}</h2>

            {app.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {app.description}
              </p>
            )}

            {app.instructions && (
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-2">使用说明</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {app.instructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-background/50 py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            按 ESC 键退出全屏模式
          </p>
        </div>
      </footer>
    </div>
  )
}
