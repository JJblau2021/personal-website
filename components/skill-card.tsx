"use client"

import { cn } from "@/lib/utils"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface SkillCardProps {
  name: string
  icon?: React.ReactNode
  proficiency?: number
  category?: string
  className?: string
}

export function SkillCard({
  name,
  icon,
  proficiency,
  category,
  className,
}: SkillCardProps) {
  const barRef = useRef(null)
  const isInView = useInView(barRef, { once: true, margin: "-50px" })

  return (
    <motion.div
      className={cn(
        "group relative bg-white rounded-xl border border-[#E2E8F0] p-4 transition-all duration-200 hover:shadow-lg hover:border-[#2563EB]/30 hover:-translate-y-1",
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#DBEAFE] flex items-center justify-center text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors duration-200">
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-[#0F172A] truncate">
              {name}
            </h4>
            {category && (
              <span className="text-xs text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded">
                {category}
              </span>
            )}
          </div>

          {proficiency !== undefined && (
            <div ref={barRef} className="w-full bg-[#F8FAFC] rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-full bg-[#2563EB] rounded-full transition-all duration-500 group-hover:bg-[#1D4ED8]"
                initial={{ width: 0 }}
                animate={isInView ? { width: `${proficiency}%` } : { width: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
