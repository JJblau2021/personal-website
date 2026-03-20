"use client"

import { TimelineEntry } from "@/components/timeline"
import { Badge } from "@/components/ui/badge"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const workExperience = [
  {
    date: "2022 - 至今",
    title: "高级全栈工程师",
    subtitle: "科技公司",
    bullets: [
      "主导面向客户的Web应用开发，服务用户超过10万",
      "使用Node.js和Docker设计微服务架构",
      "指导初级开发人员并进行代码审查",
      "通过优化将应用性能提升40%",
    ],
  },
  {
    date: "2020 - 2022",
    title: "全栈开发工程师",
    subtitle: "创业公司",
    bullets: [
      "构建和维护基于React的管理后台",
      "使用Express和PostgreSQL开发RESTful API",
      "使用GitHub Actions实现CI/CD流水线",
      "与跨职能团队合作完成产品发布",
    ],
  },
  {
    date: "2018 - 2020",
    title: "前端开发工程师",
    subtitle: "数字代理公司",
    bullets: [
      "为各类客户创建响应式Web应用",
      "与设计团队合作实现像素级精确的UI",
      "优化前端性能和可访问性",
      "使用ESLint和Prettier保持代码质量",
    ],
  },
]

const education = [
  {
    date: "2014 - 2018",
    title: "计算机科学学士",
    subtitle: "理工大学",
    bullets: [
      "以优异成绩毕业（GPA: 3.8/4.0）",
      "专注于软件工程和Web开发",
      "参与多次黑客马拉松和编程竞赛",
      "担任编程入门课程助教",
    ],
  },
]

const certifications = [
  { name: "AWS认证开发者", year: "2023" },
  { name: "Google Cloud专业认证", year: "2022" },
  { name: "Meta前端开发认证", year: "2021" },
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

function AnimatedTimelineContainer({
  children,
}: {
  children: React.ReactNode
}) {
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
      className="border-l-2 border-[#E2E8F0] ml-4"
    >
      {children}
    </motion.div>
  )
}

function AnimatedTimelineEntry(props: {
  date: string
  title: string
  subtitle?: string
  bullets?: string[]
  isLast?: boolean
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -30 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      }}
    >
      <TimelineEntry {...props} />
    </motion.div>
  )
}

function AnimatedCertifications() {
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
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {certifications.map((cert) => (
        <motion.div
          key={cert.name}
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.4, ease: "easeOut" },
            },
          }}
          className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 hover:border-[#2563EB]/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-[#0F172A]">{cert.name}</h3>
              <p className="text-sm text-[#64748B] mt-1">{cert.year}</p>
            </div>
              <Badge variant="secondary" className="bg-[#DBEAFE] text-[#2563EB]">
                已认证
              </Badge>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default function ResumePage() {
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
            履历
          </h1>
          <div className="w-12 h-1 bg-[#2563EB] mx-auto mb-6" />
          <p className="text-[#64748B]">
            我的职业历程和教育背景
          </p>
        </motion.div>

        <section className="mb-16">
          <AnimatedSectionTitle number="01">
            工作经历
          </AnimatedSectionTitle>
          <AnimatedTimelineContainer>
            {workExperience.map((exp, index) => (
              <AnimatedTimelineEntry
                key={exp.title}
                date={exp.date}
                title={exp.title}
                subtitle={exp.subtitle}
                bullets={exp.bullets}
                isLast={index === workExperience.length - 1}
              />
            ))}
          </AnimatedTimelineContainer>
        </section>

        <section className="mb-16">
          <AnimatedSectionTitle number="02">
            教育背景
          </AnimatedSectionTitle>
          <AnimatedTimelineContainer>
            {education.map((edu, index) => (
              <AnimatedTimelineEntry
                key={edu.title}
                date={edu.date}
                title={edu.title}
                subtitle={edu.subtitle}
                bullets={edu.bullets}
                isLast={index === education.length - 1}
              />
            ))}
          </AnimatedTimelineContainer>
        </section>

        <section>
          <AnimatedSectionTitle number="03">
            证书认证
          </AnimatedSectionTitle>
          <AnimatedCertifications />
        </section>
      </div>
    </div>
  )
}
