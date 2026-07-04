"use client"

import { cn } from "@/lib/utils"
import { Status } from "@/lib/types"
import { Check, Play } from "lucide-react"

interface StatusIconProps {
  status: Status
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StatusIcon({ status, size = "md", className }: StatusIconProps) {
  const dim = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"
  const iconSize = size === "sm" ? 9 : size === "lg" ? 12 : 10

  if (status === "done") {
    return (
      <span className={cn(dim, "rounded-full bg-green-500 flex items-center justify-center flex-shrink-0", className)}>
        <Check size={iconSize} className="text-white" strokeWidth={3} />
      </span>
    )
  }
  if (status === "inprogress") {
    return (
      <span className={cn(dim, "rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0", className)}>
        <Play size={iconSize} className="text-white fill-white" />
      </span>
    )
  }
  // todo
  return (
    <span className={cn(dim, "rounded-full border-2 border-gray-300 flex-shrink-0 bg-white", className)} />
  )
}
