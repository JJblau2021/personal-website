<!-- BEGIN:global-rules -->
# 全局规则
- 所有回答使用中文
- 前端组件生成必须考虑暗夜模式（dark mode），确保颜色、对比度、阴影等在亮色和暗色主题下均表现良好
<!-- END:global-rules -->

<!-- BEGIN:project-rules -->
# 项目规则：personal-website

## 1. 技术栈遵循

- **Next.js 16.2.1 App Router**：使用 Server Components，客户端交互才加 `"use client"`
- **TypeScript strict mode**：禁止 `as any` / `@ts-ignore`，必须提供完整类型
- **Tailwind CSS v4**：CSS-first 配置，色彩使用 oklch 系统
- **shadcn/ui (base-nova)**：组件来自 `@/components/ui`，复用而非重复造轮子

## 2. 组件规范

### 客户端组件
```tsx
// ✅ 正确：只在真正需要浏览器 API 时使用
"use client"
import { useState, useEffect } from "react"
// ...

// ❌ 错误：能放在服务器组件里的不要加 "use client"
```

### 样式与动画
- 使用 `globals.css` 中已定义的工具类：
  - `.pixel-hover` - 悬停上浮 + 阴影
  - `.pixel-glow` - 发光效果
  - `.bg-dot-pattern` - 点阵背景
  - `.bg-gradient-mesh` - 渐变网格
  - `.scrollbar-hide` - 隐藏滚动条
  - 动画：`animate-pulse-slow`, `animate-float-slow`, `animate-pulse-subtle`
- 颜色使用 CSS 变量：`bg-primary`, `text-primary`, `bg-primary/10`（带透明度）
- 暗色适配：`dark:` 前缀或 `oklch()` 色彩

### 类型定义
```tsx
// ✅ 正确：从 data/apps.ts 导入类型
import type { SubApp, AppCategory } from "@/app/data/apps"

// ❌ 错误：内联重复定义
interface SubApp { ... }
```

## 3. 导入规则

- 路径别名：`@/*` 指向项目根目录
- 组件导入：`@/components/...`
- UI 组件：`@/components/ui/...`
- 工具函数：`@/lib/utils` → `cn()` 用于 class 合并

```tsx
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
```

## 4. 性能与最佳实践

- 避免不必要的客户端水化：搜索、主题切换等使用 `useEffect` + `mounted` 状态
- 图片使用 `next/image`，图标使用 `lucide-react`
- 动画优先使用 CSS（如 `animate-*`），Framer Motion 仅用于复杂交互动效
- 首屏不需交互的组件保持为 Server Component

## 5. 代码风格

- 组件函数命名：`PascalCase`（如 `AppCard`, `Navbar`）
- 工具函数命名：`camelCase`（如 `cn`, `getAppsByCategory`）
- Props 接口：`ComponentNameProps` 格式
- 条件 class 使用 `cn()` 合并，避免字符串模板
<!-- END:project-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
