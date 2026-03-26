import { GithubIcon, HeartIcon, SparklesIcon } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t-2 border-border/50 bg-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />
      <div className="container mx-auto px-4 py-10 relative">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-primary animate-pulse" />
            <span className="font-semibold text-foreground">个人小应用集合</span>
            <SparklesIcon className="size-5 text-primary animate-pulse" />
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110 p-2 rounded-xl hover:bg-primary/5"
              aria-label="GitHub"
            >
              <GithubIcon className="size-5" />
            </a>
          </div>

          <div className="relative">
            <p className="text-sm text-muted-foreground">
              用
              <HeartIcon className="inline size-3 mx-1 text-rose-500 animate-pulse" />
              构建 · 全部应用运行于浏览器端
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
          </div>

          <p className="text-xs text-muted-foreground/60 pt-2">
            © {new Date().getFullYear()} · Next.js + Tailwind CSS v4
          </p>
        </div>
      </div>
    </footer>
  )
}