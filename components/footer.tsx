import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#F8FAFC] border-t border-[#E2E8F0] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span>© {currentYear} JJBlau2021. All rights reserved.</span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-[#2563EB] fill-[#2563EB]" /> using Next.js
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors duration-200"
            >
              GitHub
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors duration-200"
            >
              LinkedIn
            </Link>
            <Link
              href="#"
              className="text-sm text-[#64748B] hover:text-[#2563EB] transition-colors duration-200"
            >
              回到顶部
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
