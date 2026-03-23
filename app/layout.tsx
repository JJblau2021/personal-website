import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "我的小工具 - 个人应用集合",
    template: "%s | 我的小工具",
  },
  description:
    "探索我亲手打造的小游戏、工具和交互应用集合平台，包含贪吃蛇、计算器、倒计时等有趣的小工具。",
  keywords: [
    "个人作品",
    "小工具",
    "小游戏",
    "贪吃蛇",
    "计算器",
    "在线工具",
  ],
  authors: [{ name: "开发者" }],
  openGraph: {
    title: "我的小工具 - 个人应用集合",
    description:
      "探索我亲手打造的小游戏、工具和交互应用集合平台",
    type: "website",
    locale: "zh_CN",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
