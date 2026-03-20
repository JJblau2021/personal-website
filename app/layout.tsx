import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/nav"
import { Footer } from "@/components/footer"
import { AnimateProvider } from "@/components/providers/animate-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "JJ.dev | Full-stack Engineer",
  description: "Personal portfolio of a full-stack engineer building elegant solutions with modern technologies.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="min-h-full flex flex-col bg-white text-[#0F172A] antialiased">
        <Navigation />
        <main className="flex-1 pt-16">
          <AnimateProvider>
            {children}
          </AnimateProvider>
        </main>
        <Footer />
      </body>
    </html>
  )
}
