"use client"

import { categories } from "@/app/data/apps"
import type { AppCategory } from "@/app/data/apps"
import { Button } from "@/components/ui/button"

interface CategoryTabsProps {
  activeCategory: AppCategory | "all"
  onCategoryChange: (category: AppCategory | "all") => void
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {categories.map((category) => {
        const isActive = activeCategory === category.id
        return (
          <Button
            key={category.id}
            variant={isActive ? "default" : "outline"}
            onClick={() => onCategoryChange(category.id as AppCategory | "all")}
            className={`
              rounded-2xl whitespace-nowrap px-5 py-2.5 text-sm font-medium
              transition-all duration-200 ease-out
              ${isActive 
                ? "bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5" 
                : "border-2 border-transparent hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10"
              }
            `}
          >
            <span className="relative z-10">{category.label}</span>
          </Button>
        )
      })}
    </div>
  )
}