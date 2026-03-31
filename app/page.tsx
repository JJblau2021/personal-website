"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/Navbar"
import { CategoryTabs } from "@/components/CategoryTabs"
import { AppGrid } from "@/components/AppGrid"
import { Footer } from "../components/Footer"
import { subApps, getAppsByCategory, searchApps } from "@/app/data/apps"
import type { AppCategory } from "@/app/data/apps"
import { LayersIcon } from "lucide-react"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<AppCategory | "all">("all")

  const filteredApps = useMemo(() => {
    let apps = activeCategory === "all" ? subApps : getAppsByCategory(activeCategory)

    if (searchQuery.trim()) {
      apps = searchApps(searchQuery).filter((app) =>
        activeCategory === "all" ? true : app.category === activeCategory
      )
    }

    return apps
  }, [searchQuery, activeCategory])

  return (
    <div className="min-h-screen flex flex-col relative bg-vignette">
      <div className="fixed inset-0 bg-gradient-mesh -z-10" />
      <div className="fixed inset-0 bg-animated-gradient -z-[5]" />
      
      <div className="fixed top-[-10%] left-[10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-violet-400/40 via-purple-400/25 to-fuchsia-400/15 dark:from-orange-400/20 dark:via-rose-400/12 dark:to-pink-300/8 -z-10 animate-pulse-slow" style={{ filter: 'blur(80px)' }} />
      <div className="fixed bottom-[-15%] right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-pink-400/35 via-rose-400/20 to-purple-400/10 dark:from-rose-500/18 dark:via-orange-400/12 dark:to-amber-300/8 -z-10 animate-float-slow" style={{ filter: 'blur(70px)' }} />
      <div className="fixed top-[40%] right-[-5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-blue-400/30 via-indigo-400/15 to-violet-400/10 dark:from-pink-500/15 dark:via-rose-400/8 dark:to-orange-300/5 -z-10" style={{ filter: 'blur(60px)' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-indigo-400/20 via-blue-400/15 to-cyan-400/10 dark:from-amber-400/6 dark:via-orange-300/5 dark:to-rose-400/4 -z-[1] animate-pulse-subtle" style={{ filter: 'blur(120px)' }} />

      <Navbar onSearch={setSearchQuery} />

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <section className="container mx-auto px-4 py-10">
          <div className="mb-10 relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary-light to-accent rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight mb-3 pl-4 text-foreground">
              欢迎来到 <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">Vibe Coding Tools</span>
            </h1>
            <p className="text-muted-foreground text-lg pl-4 flex items-center gap-2">
              <LayersIcon className="size-5 text-primary" />
              探索各种有趣的小游戏和实用工具
            </p>
          </div>

          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <div className="mt-8">
            <AppGrid apps={filteredApps} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}