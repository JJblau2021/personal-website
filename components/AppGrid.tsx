import { AppCard } from "./AppCard"
import type { SubApp } from "@/app/data/apps"

interface AppGridProps {
  apps: SubApp[]
}

export function AppGrid({ apps }: AppGridProps) {
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          未找到匹配的应用
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          尝试其他关键词或分类
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  )
}
