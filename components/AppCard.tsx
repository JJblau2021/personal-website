import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon } from "lucide-react"
import type { SubApp } from "@/app/data/apps"

interface AppCardProps {
  app: SubApp
}

const categoryColors: Record<SubApp["category"], string> = {
  games: "bg-primary/10 text-primary border-primary/20",
  tools: "bg-secondary/10 text-secondary border-secondary/20",
  interactive: "bg-accent/10 text-accent border-accent/20",
}

const categoryLabels: Record<SubApp["category"], string> = {
  games: "游戏",
  tools: "工具",
  interactive: "交互",
}

export function AppCard({ app }: AppCardProps) {
  return (
    <Link href={app.path} className="block group">
      <Card className="h-full overflow-hidden rounded-2xl pixel-hover cursor-pointer border-2 border-transparent bg-card shadow-md hover:border-primary/30 dark:hover:border-primary/50 transition-all duration-300">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex items-center justify-center">
          <div className="absolute inset-0 bg-dot-pattern opacity-30" />
          
          {app.thumbnail ? (
            <img
              src={app.thumbnail}
              alt={app.name}
              className="relative w-full h-full object-cover p-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="relative size-16 md:size-20 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <span className="text-2xl md:text-3xl font-bold text-primary drop-shadow-sm">
                {app.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-primary/25 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 md:p-4">
            <p className="text-xs md:text-sm text-foreground text-center line-clamp-2 md:line-clamp-3 leading-relaxed">
              {app.description}
            </p>
          </div>
        </div>

        <div className="p-2 md:p-3">
          <div className="flex items-center justify-between gap-2 mb-1 md:mb-2">
            <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors truncate">
              {app.name}
            </h3>
            <Badge
              variant="secondary"
              className={`text-xs shrink-0 rounded-lg border px-1.5 md:px-2 py-0.5 ${categoryColors[app.category]}`}
            >
              {categoryLabels[app.category]}
            </Badge>
          </div>

          <div className="flex items-center gap-1 text-xs md:text-sm font-medium text-primary group-hover:text-primary-light transition-colors">
            <span className="group-hover:translate-x-1 transition-transform duration-200">启动应用</span>
            <ArrowRightIcon className="size-3 md:size-3.5 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
