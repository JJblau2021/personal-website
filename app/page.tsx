"use client"

import { Code2, Layers, Database, Globe } from "lucide-react"
import { Hero } from "@/components/hero"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const stats = [
  { icon: Code2, label: "年开发经验", value: "5+", numericValue: 5 },
  { icon: Layers, label: "完成项目", value: "30+", numericValue: 30 },
  { icon: Database, label: "技术栈", value: "20+", numericValue: 20 },
  { icon: Globe, label: "满意客户", value: "15+", numericValue: 15 },
]

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {value}
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.3 }}
      >
        {suffix}
      </motion.span>
    </motion.span>
  )
}

export default function HomePage() {
  const aboutRef = useRef(null)
  const statsRef = useRef(null)
  const isAboutInView = useInView(aboutRef, { once: true, margin: "-100px" })
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" })

  return (
    <>
      <Hero
        name="JJBlau2021"
        title="全栈工程师"
        tagline="使用现代技术构建优雅的解决方案。热爱整洁代码、用户体验和持续学习。"
      />

      <section className="bg-[#F8FAFC] py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={aboutRef}
            initial="hidden"
            animate={isAboutInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "easeOut" },
              },
            }}
          >
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
                关于我
              </h2>
              <div className="w-12 h-1 bg-[#2563EB] mx-auto mb-6" />
            </div>

            <Card className="max-w-3xl mx-auto border-[#E2E8F0] shadow-sm">
              <CardContent className="p-6 md:p-8">
                <p className="text-[#64748B] leading-relaxed mb-4">
                  我是一名热情的全栈工程师，拥有超过5年的Web应用开发经验。
                  我专注于React、Next.js和Node.js，致力于创建高性能、可访问、
                  用户友好的界面。
                </p>
                <p className="text-[#64748B] leading-relaxed mb-4">
                  编写代码之余，我喜欢探索新技术、参与开源项目，
                  或者品尝一杯咖啡。我相信编写简洁、可维护的代码能带来真正的改变。
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Badge variant="secondary" className="bg-[#DBEAFE] text-[#2563EB] hover:bg-[#DBEAFE] hover:scale-105 transition-transform duration-200 cursor-default">
                    TypeScript
                  </Badge>
                  <Badge variant="secondary" className="bg-[#DBEAFE] text-[#2563EB] hover:bg-[#DBEAFE] hover:scale-105 transition-transform duration-200 cursor-default">
                    React
                  </Badge>
                  <Badge variant="secondary" className="bg-[#DBEAFE] text-[#2563EB] hover:bg-[#DBEAFE] hover:scale-105 transition-transform duration-200 cursor-default">
                    Node.js
                  </Badge>
                  <Badge variant="secondary" className="bg-[#DBEAFE] text-[#2563EB] hover:bg-[#DBEAFE] hover:scale-105 transition-transform duration-200 cursor-default">
                    Next.js
                  </Badge>
                  <Badge variant="secondary" className="bg-[#DBEAFE] text-[#2563EB] hover:bg-[#DBEAFE] hover:scale-105 transition-transform duration-200 cursor-default">
                    PostgreSQL
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isStatsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center mb-12"
            ref={undefined}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
              数据概览
            </h2>
            <div className="w-12 h-1 bg-[#2563EB] mx-auto" />
          </motion.div>

          <motion.div
            ref={statsRef}
            initial="hidden"
            animate={isStatsInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: "easeOut" },
                  },
                }}
              >
                <Card
                  className="border-[#E2E8F0] text-center group hover:border-[#2563EB]/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <stat.icon className="h-8 w-8 text-[#2563EB] mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                    <div className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-1">
                      <AnimatedNumber value={stat.numericValue} suffix="+" />
                    </div>
                    <div className="text-sm text-[#64748B]">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
