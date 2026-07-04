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
    const t1 = setTimeout(() => setShowButton(true), 2800)
    const t2 = setTimeout(() => setButtonVisible(true), 3000)
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
        className="relative bg-white rounded-2xl shadow-2xl mx-6 max-w-lg w-full overflow-hidden"
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
            <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
              {project.name}
            </span>
          </div>

          {/* 達成目標 */}
          {meta?.targetOutcome && (
            <div className="mb-5">
              <div className="flex items-center gap-1.5 mb-2">
                <Target size={13} className="text-gray-400" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">達成目標</span>
              </div>
              <p className="text-[15px] font-bold text-gray-900 leading-relaxed whitespace-pre-line">
                {meta.targetOutcome}
              </p>
            </div>
          )}

          {/* KPI */}
          {meta?.kpiSummary && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart2 size={13} className="text-gray-400" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">KPI</span>
              </div>
              <p className="text-[12px] text-gray-500 leading-relaxed whitespace-pre-line">
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
                  ? "bg-gray-900 text-white opacity-100 hover:bg-gray-700 cursor-pointer"
                  : "bg-gray-100 text-gray-300 opacity-0 cursor-default pointer-events-none"
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
