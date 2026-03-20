"use client"

import Link from "next/link"
import { ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, Variants } from "framer-motion"

interface HeroProps {
  name?: string
  title?: string
  tagline?: string
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const gradientVariants: Variants = {
  animate: {
    background: [
      "radial-gradient(circle at 30% 50%, rgba(219, 234, 254, 0.4) 0%, transparent 50%)",
      "radial-gradient(circle at 70% 30%, rgba(219, 234, 254, 0.4) 0%, transparent 50%)",
      "radial-gradient(circle at 30% 50%, rgba(219, 234, 254, 0.4) 0%, transparent 50%)",
    ],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "linear",
    },
  },
}

export function Hero({
  name = "John Doe",
  title = "Full-stack Engineer",
  tagline = "Building elegant solutions with modern technologies",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#DBEAFE] via-white to-[#F8FAFC] -z-10"
        variants={gradientVariants}
        animate="animate"
      />
      <div className="absolute top-20 right-0 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#60A5FA]/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <motion.div
          className="max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-4" variants={itemVariants}>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#DBEAFE] text-[#2563EB] hover:scale-105 transition-transform duration-200">
              你好，欢迎来访
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold text-[#0F172A] mb-4"
            variants={itemVariants}
          >
            我是 <span className="text-[#2563EB]">{name}</span>
          </motion.h1>

          <motion.h2
            className="text-xl md:text-2xl text-[#64748B] mb-6"
            variants={itemVariants}
          >
            {title}
          </motion.h2>

          <motion.p
            className="text-lg text-[#64748B] mb-8 max-w-2xl"
            variants={itemVariants}
          >
            {tagline}
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            variants={itemVariants}
          >
            <Link href="/resume">
              <Button
                size="lg"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#2563EB]/25"
              >
                查看履历
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/others">
              <Button
                size="lg"
                variant="outline"
                className="border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-all duration-200 hover:scale-105"
              >
                联系我
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
