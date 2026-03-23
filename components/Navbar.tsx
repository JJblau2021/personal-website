"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SunIcon, MoonIcon, Gamepad2Icon, SearchIcon } from "lucide-react"

interface NavbarProps {
  onSearch: (query: string) => void
}

export function Navbar({ onSearch }: NavbarProps) {
  const [isDark, setIsDark] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    const theme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDarkMode = theme === "dark" || (!theme && prefersDark)
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newValue = !prev
      if (newValue) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      localStorage.setItem("theme", newValue ? "dark" : "light")
      return newValue
    })
  }, [])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchValue(value)
      onSearch(value)
    },
    [onSearch]
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Gamepad2Icon className="size-7 text-primary transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300" />
            <div className="absolute -top-1 -right-1 size-2.5 rounded-full bg-accent animate-pulse" />
          </div>
          <span className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
            我的小工具
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-3 max-w-md">
          <div className="relative w-full group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10">
              <SearchIcon className="size-4" />
            </div>
            <Input
              type="search"
              placeholder="搜索应用..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full rounded-2xl bg-muted/50 pl-10 pr-4 border-2 border-transparent focus:border-primary/50 focus:ring-0 focus:shadow-lg focus:shadow-primary/10 transition-all duration-200"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="shrink-0 rounded-2xl border-2 border-transparent hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 group"
            aria-label="切换主题"
          >
            {isDark ? (
              <SunIcon className="size-4 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
            ) : (
              <MoonIcon className="size-4 text-primary group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}