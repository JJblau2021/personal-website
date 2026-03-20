"use client"

import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface TimelineEntryProps {
  date: string
  title: string
  subtitle?: string
  description?: string
  bullets?: string[]
  isLast?: boolean
}

export function TimelineEntry({
  date,
  title,
  subtitle,
  description,
  bullets,
  isLast = false,
}: TimelineEntryProps) {
  const lineRef = useRef(null)
  const isInView = useInView(lineRef, { once: true, margin: "-50px" })

  return (
    <div className="relative pl-8 sm:pl-12">
      <motion.div
        ref={lineRef}
        className={cn(
          "absolute left-3 sm:left-4 top-2 w-0.5 bg-[#E2E8F0]",
          isLast ? "h-8" : "h-full"
        )}
        initial={{ height: 0 }}
        animate={isInView ? { height: isLast ? 32 : "100%" } : { height: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      />

      <div className="absolute left-0 sm:left-1 top-2 w-6 h-6 rounded-full bg-white border-2 border-[#2563EB] flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
      </div>

      <div className="pb-8 group">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FAFC] text-xs font-medium text-[#64748B] mb-3">
          <Calendar className="h-3 w-3" />
          {date}
        </div>

        <h3 className="text-lg font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors duration-200">
          {title}
        </h3>

        {subtitle && (
          <p className="text-[#64748B] font-medium mt-1">{subtitle}</p>
        )}

        {description && (
          <p className="text-[#64748B] mt-2 text-sm leading-relaxed">
            {description}
          </p>
        )}

        {bullets && bullets.length > 0 && (
          <ul className="mt-3 space-y-2">
            {bullets.map((bullet, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-[#64748B]"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
