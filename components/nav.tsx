"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/", label: "首页", labelEn: "Home" },
  { href: "/skills", label: "技能", labelEn: "Skills" },
  { href: "/resume", label: "履历", labelEn: "Resume" },
  { href: "/others", label: "其他", labelEn: "Others" },
]

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-white/50"
      )}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors duration-200"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="inline-block"
            >
              JJ<span className="text-[#2563EB]">Blau2021</span>
            </motion.span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg",
                    isActive
                      ? "text-[#2563EB]"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                  )}
                >
                  {item.label}
                  <span className="ml-1 text-xs text-[#94A3B8]">{item.labelEn}</span>
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#2563EB] rounded-full"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>
                </Link>
              )
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-[#E2E8F0]">
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg",
                          isActive
                            ? "text-[#2563EB] bg-[#DBEAFE]"
                            : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                        )}
                      >
                        {item.label}
                        <span className="ml-2 text-xs text-[#94A3B8]">{item.labelEn}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
