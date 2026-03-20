"use client"

import { Mail, Github, Linkedin, Twitter, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const projects = [
  {
    name: "电商平台",
    description: "功能完善的电商平台，包含实时库存管理、支付处理和管理后台。",
    tech: ["Next.js", "Node.js", "PostgreSQL", "Stripe"],
    github: "#",
    demo: "#",
  },
  {
    name: "任务管理应用",
    description: "协作式任务管理工具，支持实时更新、团队工作空间和生产力分析。",
    tech: ["React", "GraphQL", "MongoDB", "Socket.io"],
    github: "#",
    demo: "#",
  },
  {
    name: "作品集生成器",
    description: "AI驱动的作品集生成器，根据用户输入创建个性化的作品集网站。",
    tech: ["Next.js", "OpenAI", "Vercel AI SDK", "Tailwind"],
    github: "#",
    demo: "#",
  },
]

const socialLinks = [
  { name: "GitHub", icon: Github, href: "https://github.com" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
]

function AnimatedSectionTitle({
  children,
  number,
}: {
  children: React.ReactNode
  number: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.h2
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-2xl font-bold text-[#0F172A] mb-8 flex items-center gap-3"
    >
      <span className="w-8 h-8 rounded-lg bg-[#DBEAFE] flex items-center justify-center text-sm">
        {number}
      </span>
      {children}
    </motion.h2>
  )
}

function AnimatedProjectCards() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {projects.map((project) => (
        <motion.div
          key={project.name}
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.4, ease: "easeOut" },
            },
          }}
        >
          <Card
            className="border-[#E2E8F0] hover:shadow-lg hover:border-[#2563EB]/30 hover:scale-[1.02] transition-all duration-200 group"
          >
            <CardHeader>
              <CardTitle className="group-hover:text-[#2563EB] transition-colors duration-200">
                {project.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#64748B] text-sm mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tech.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="bg-[#F8FAFC] text-[#64748B] hover:bg-[#DBEAFE] hover:text-[#2563EB] transition-all duration-200"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-3">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 flex-1 h-7 px-2.5 rounded-[10px] border border-[#E2E8F0] bg-background text-[0.8rem] font-medium hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-all duration-200"
                >
                  <Github className="h-3.5 w-3.5" />
                  代码
                </a>
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 flex-1 h-7 px-2.5 rounded-[10px] bg-[#2563EB] text-white text-[0.8rem] font-medium hover:bg-[#1D4ED8] transition-all duration-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  演示
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

function AnimatedContactCard() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-[#E2E8F0] max-w-2xl hover:shadow-lg hover:border-[#2563EB]/30 transition-all duration-200">
        <CardContent className="p-6 md:p-8">
          <p className="text-[#64748B] mb-6">
            有合作意向或任何问题？
            欢迎通过以下方式联系我。
          </p>

          <div className="space-y-4 mb-6">
            <a
              href="mailto:hello@example.com"
              className="flex items-center gap-3 text-[#0F172A] hover:text-[#2563EB] transition-colors duration-200 group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] flex items-center justify-center group-hover:bg-[#2563EB] transition-colors duration-200">
                <Mail className="h-5 w-5 text-[#2563EB] group-hover:text-white transition-colors duration-200" />
              </div>
              <span>hello@example.com</span>
            </a>
          </div>

          <div className="border-t border-[#E2E8F0] pt-6">
            <p className="text-sm text-[#64748B] mb-4">关注我</p>
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#DBEAFE] hover:text-[#2563EB] hover:border-[#2563EB]/30 hover:scale-110 transition-all duration-200"
                  aria-label={link.name}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function OthersPage() {
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
            其他
          </h1>
          <div className="w-12 h-1 bg-[#2563EB] mx-auto mb-6" />
          <p className="text-[#64748B]">
            精选项目、联系方式和社交链接
          </p>
        </motion.div>

        <section className="mb-16">
          <AnimatedSectionTitle number="01">
            精选项目
          </AnimatedSectionTitle>
          <AnimatedProjectCards />
        </section>

        <section>
          <AnimatedSectionTitle number="02">
            联系方式
          </AnimatedSectionTitle>
          <AnimatedContactCard />
        </section>
      </div>
    </div>
  )
}
