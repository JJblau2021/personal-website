"use client"

import {
  Code2,
  Database,
  Server,
  Wrench,
  Globe,
  Terminal,
  GitBranch,
  Figma,
  Layers,
} from "lucide-react"
import { SkillCard } from "@/components/skill-card"
import { Badge } from "@/components/ui/badge"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const skillCategories = [
  {
    title: "前端",
    icon: Code2,
    skills: [
      { name: "React", proficiency: 95 },
      { name: "Next.js", proficiency: 90 },
      { name: "TypeScript", proficiency: 92 },
      { name: "Tailwind CSS", proficiency: 95 },
      { name: "Vue.js", proficiency: 75 },
    ],
  },
  {
    title: "后端",
    icon: Server,
    skills: [
      { name: "Node.js", proficiency: 90 },
      { name: "Express", proficiency: 88 },
      { name: "Python", proficiency: 80 },
      { name: "FastAPI", proficiency: 75 },
      { name: "GraphQL", proficiency: 82 },
    ],
  },
  {
    title: "数据库",
    icon: Database,
    skills: [
      { name: "PostgreSQL", proficiency: 88 },
      { name: "MongoDB", proficiency: 85 },
      { name: "Redis", proficiency: 78 },
      { name: "Prisma", proficiency: 90 },
    ],
  },
  {
    title: "DevOps",
    icon: Wrench,
    skills: [
      { name: "Docker", proficiency: 85 },
      { name: "CI/CD", proficiency: 82 },
      { name: "AWS", proficiency: 75 },
      { name: "Linux", proficiency: 80 },
    ],
  },
]

const techStack = [
  { name: "React", icon: Code2 },
  { name: "Next.js", icon: Globe },
  { name: "TypeScript", icon: Terminal },
  { name: "Node.js", icon: Server },
  { name: "Python", icon: Terminal },
  { name: "PostgreSQL", icon: Database },
  { name: "MongoDB", icon: Database },
  { name: "Docker", icon: Layers },
  { name: "Git", icon: GitBranch },
  { name: "Figma", icon: Figma },
  { name: "Tailwind", icon: Layers },
  { name: "GraphQL", icon: Globe },
]

export default function SkillsPage() {
  const headerRef = useRef(null)
  const categoriesRef = useRef(null)
  const techStackRef = useRef(null)

  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" })
  const isCategoriesInView = useInView(categoriesRef, { once: true, margin: "-100px" })
  const isTechStackInView = useInView(techStackRef, { once: true, margin: "-100px" })

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
            技能专长
          </h1>
          <div className="w-12 h-1 bg-[#2563EB] mx-auto mb-6" />
          <p className="text-[#64748B]">
            多年专业经验积累的技术技能与能力全面概览
          </p>
        </motion.div>

        <motion.div
          ref={categoriesRef}
          initial="hidden"
          animate={isCategoriesInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="space-y-12"
        >
          {skillCategories.map((category) => (
            <motion.section
              key={category.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" },
                },
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] flex items-center justify-center">
                  <category.icon className="h-5 w-5 text-[#2563EB]" />
                </div>
                <h2 className="text-xl font-semibold text-[#0F172A]">
                  {category.title}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.skills.map((skill) => (
                  <SkillCard
                    key={skill.name}
                    name={skill.name}
                    proficiency={skill.proficiency}
                    category={category.title}
                  />
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>

        <motion.section
          ref={techStackRef}
          initial="hidden"
          animate={isTechStackInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.2,
              },
            },
          }}
          className="mt-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isTechStackInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">
              技术栈
            </h2>
            <p className="text-[#64748B]">
              日常工作中使用的技术
            </p>
          </motion.div>
          <motion.div
            className="flex flex-wrap justify-center gap-3"
          >
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.3, ease: "easeOut" },
                  },
                }}
              >
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#DBEAFE] transition-all duration-200 cursor-default hover:scale-105"
                >
                  <tech.icon className="h-4 w-4 mr-2" />
                  {tech.name}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  )
}
