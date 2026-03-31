import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "Vibe Coding Tools",
    template: "%s | Vibe Coding Tools",
  },
  description:
    "A collection of fun mini-games and useful tools, including Snake, JSON Viewer, Image Compressor, and more.",
  keywords: [
    "mini games",
    "tools",
    "snake",
    "json viewer",
    "image compressor",
    "online tools",
  ],
  authors: [{ name: "Developer" }],
  openGraph: {
    title: "Vibe Tools",
    description:
      "A collection of fun mini-games and useful tools",
    type: "website",
    locale: "en_US",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
