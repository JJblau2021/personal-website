"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SunIcon, MoonIcon, Gamepad2Icon, SearchIcon } from "lucide-react"

interface NavbarProps {
  onSearch: (query: string) => void
}

export function Navbar({ onSearch }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchValue(value)
      onSearch(value)
    },
    [onSearch]
  )

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border/50 transition-all duration-300 ${
      scrolled 
        ? "bg-background/60 dark:bg-black/20 backdrop-blur-md supports-[backdrop-filter]:bg-background/40" 
        : "bg-background/80 dark:bg-black/30 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60"
    }`}>
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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary group-hover:text-primary group-hover:cursor-pointer transition-colors z-10">
              <SearchIcon className="size-4" />
            </div>
            <Input
              type="search"
              placeholder="搜索应用..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm pl-10 pr-4 border-2 border-border/50 dark:border-white/10 group-hover:border-primary/50 dark:group-hover:border-primary group-hover:bg-primary/5 dark:group-hover:bg-primary/10 group-hover:shadow-lg group-hover:shadow-primary/10 focus:border-primary/50 focus:ring-0 focus:shadow-lg focus:shadow-primary/10 transition-all duration-200 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="shrink-0 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border-2 border-border/50 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10 hover:cursor-pointer transition-all duration-200 group"
            aria-label="切换主题"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <SunIcon className="size-4 text-primary group-hover:rotate-12 transition-transform duration-200" />
              ) : (
                <MoonIcon className="size-4 text-primary group-hover:-rotate-12 transition-transform duration-200" />
              )
            ) : (
              <div className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}