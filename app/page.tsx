"use client"

import { useState, useMemo, useEffect } from "react"
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    }
  }, [])

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
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 bg-gradient-mesh -z-10" />
      <div className="fixed inset-0 bg-dot-pattern opacity-40 -z-10 pointer-events-none" />
      
      <div className="fixed top-20 left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="fixed bottom-40 right-20 w-48 h-48 rounded-full bg-accent/5 blur-3xl -z-10" />
      <div className="fixed top-1/3 right-1/4 w-24 h-24 rounded-full bg-secondary/5 blur-2xl -z-10" />

      <Navbar onSearch={setSearchQuery} />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-10">
          <div className="mb-10 relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary-light to-accent rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight mb-3 pl-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              欢迎来到我的小工具箱
            </h1>
            <p className="text-muted-foreground text-lg pl-4 flex items-center gap-2">
              <LayersIcon className="size-5 text-primary" />
              探索我亲手打造的小游戏、工具和交互应用
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