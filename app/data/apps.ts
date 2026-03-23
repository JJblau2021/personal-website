export type AppCategory = "games" | "tools" | "interactive"

export interface SubApp {
  id: string
  name: string
  description: string
  category: AppCategory
  thumbnail: string
  techStack: string[]
  path: string
  instructions?: string
}

export interface Category {
  id: string
  label: string
}

export const categories: Category[] = [
  { id: "all", label: "全部" },
  { id: "games", label: "小游戏" },
]

export const subApps: SubApp[] = [
  {
    id: "snake",
    name: "牧场贪吃蛇",
    description: "经典的牧场物语风格贪吃蛇游戏，在绿意盎然的农田中控制小蛇收集蔬菜水果，体验田园乐趣。",
    category: "games",
    thumbnail: "/snake.png",
    techStack: ["React", "TypeScript", "CSS"],
    path: "/apps/snake",
    instructions: "使用方向键或 WASD 控制小蛇的移动方向。吃蔬菜水果可让小蛇变长，尽量获得更高分数吧！注意不要撞到篱笆或自己的身体哦。",
  },
]

export function getAppById(id: string): SubApp | undefined {
  return subApps.find((app) => app.id === id)
}

export function getAppsByCategory(category: AppCategory | "all"): SubApp[] {
  if (category === "all") return subApps
  return subApps.filter((app) => app.category === category)
}

export function searchApps(query: string): SubApp[] {
  const lowerQuery = query.toLowerCase()
  return subApps.filter(
    (app) =>
      app.name.toLowerCase().includes(lowerQuery) ||
      app.description.toLowerCase().includes(lowerQuery) ||
      app.techStack.some((tech) => tech.toLowerCase().includes(lowerQuery))
  )
}
