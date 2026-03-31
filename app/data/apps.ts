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
  { id: "tools", label: "工具" },
]

export const subApps: SubApp[] = [
  {
    id: "color-generator",
    name: "AI 颜色生成器",
    description: "基于 AI 智能分析，输入描述词即可生成精美的配色方案。支持科技感、温暖、活力等多种风格。",
    category: "tools",
    thumbnail: "/colorGenerator.png",
    techStack: ["React", "TypeScript", "MiniMax API"],
    path: "/apps/color-generator",
    instructions: "在输入框中输入描述词（如「科技感」「日落」「森林」），点击生成按钮。AI 将为你生成 5-8 个颜色的完整配色方案，包括主色、辅色和强调色。",
  },
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
  {
    id: "tetris",
    name: "经典俄罗斯方块",
    description: "经典的俄罗斯方块游戏，下落方块、消除行、获得高分。回忆童年时光，挑战最高分！",
    category: "games",
    thumbnail: "/tetris.png",
    techStack: ["React", "TypeScript"],
    path: "/apps/tetris",
    instructions: "← → 方向键移动方块，↑ 旋转，↓ 加速下落。空格键硬降。对战模式：双人对战，看谁先完成 5 行！",
  },
  {
    id: "survival-guide",
    name: "大厂员工生存指南",
    description: "通过多轮选项问答，决定你在大厂的命运。不同选择会会影响健康、精神、人缘和职级数值。",
    category: "games",
    thumbnail: "/survivalGuide.png",
    techStack: ["React", "TypeScript", "状态机"],
    path: "/apps/survival-guide",
    instructions: "阅读故事并选择你的行动。不同选择会影响角色的各项属性，最终走向不同的结局。",
  },
  {
    id: "json-tool",
    name: "JSON 预览器",
    description: "输入 JSON 字符串，即可获得树形结构预览，支持格式化、压缩和复制。",
    category: "tools",
    thumbnail: "/jsonTool.png",
    techStack: ["React", "TypeScript", "Tailwind"],
    path: "/apps/json-tool",
    instructions: "在左侧输入框粘贴 JSON，右侧将自动预览树形结构。支持格式化（缩进）、压缩（去除空格）和一键复制。",
  },
  {
    id: "image-compress",
    name: "图片压缩器",
    description: "上传图片，快速压缩减小文件体积，支持调整压缩质量。",
    category: "tools",
    thumbnail: "/imageCompress.png",
    techStack: ["React", "TypeScript", "Canvas API"],
    path: "/apps/image-compress",
    instructions: "拖拽或上传图片，选择压缩质量，点击压缩按钮。压缩后可预览效果并下载。",
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
