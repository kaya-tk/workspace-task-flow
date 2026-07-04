"use client"

import { useState, useEffect } from "react"
import { Project, ProjectMeta } from "@/lib/types"
import { Target, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectSplashModalProps {
  project: Project
  meta: ProjectMeta | null
  onClose: () => void
}

export function ProjectSplashModal({ project, meta, onClose }: ProjectSplashModalProps) {
  const [showButton, setShowButton] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowButton(true), 800)
    const t2 = setTimeout(() => setButtonVisible(true), 1000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (!meta?.targetOutcome && !meta?.kpiSummary) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
      onClick={buttonVisible ? onClose : undefined}
    >
      <div
        className="relative bg-card rounded-2xl shadow-2xl mx-6 max-w-lg w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* カラーバー */}
        <div className="h-1.5 w-full" style={{ backgroundColor: project.color }} />

        <div className="px-8 py-7">
          {/* プロジェクト名 */}
          <div className="flex items-center gap-2 mb-5">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              {project.name}
            </span>
          </div>

          {/* 達成目標 */}
          {meta?.targetOutcome && (
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <Target size={13} className="text-muted-foreground" />
                <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">達成目標</span>
              </div>
              <p className="text-[17px] font-bold text-foreground leading-relaxed whitespace-pre-line">
                {meta.targetOutcome}
              </p>
            </div>
          )}

          {/* KPI */}
          {meta?.kpiSummary && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart2 size={13} className="text-muted-foreground" />
                <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-widest">リスク・注意事項</span>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed whitespace-pre-line">
                {meta.kpiSummary}
              </p>
            </div>
          )}

          {/* 閉じるボタン */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-500",
                buttonVisible
                  ? "bg-foreground text-background opacity-100 hover:opacity-80 cursor-pointer"
                  : "bg-muted text-muted-foreground/30 opacity-0 cursor-default pointer-events-none"
              )}
            >
              よし、やるぞ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
