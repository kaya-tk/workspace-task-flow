"use client"

import { ChevronRight, Settings } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface GlobalHeaderProps {
  projectName: string
  goalName: string
  taskTitle?: string | null
  onClickProject?: () => void
  onClickGoal?: () => void
  showProjectSplash: boolean
  onShowProjectSplashChange: (val: boolean) => void
}

export function GlobalHeader({ projectName, goalName, taskTitle, onClickProject, onClickGoal, showProjectSplash, onShowProjectSplashChange }: GlobalHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!settingsOpen) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [settingsOpen])

  const toggleSplash = async () => {
    const next = !showProjectSplash
    onShowProjectSplashChange(next)
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showProjectSplash: next }),
    })
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-4">
      <nav className="flex items-center gap-1.5 text-xs min-w-0 flex-1 overflow-hidden" aria-label="パンくず">
        <button
          onClick={onClickProject}
          className="text-muted-foreground shrink-0 hover:text-foreground transition-colors"
        >
          {projectName}
        </button>
        <ChevronRight size={11} className="text-muted-foreground/50 shrink-0" />
        <button
          onClick={onClickGoal}
          className="text-muted-foreground shrink-0 hover:text-foreground transition-colors"
        >
          {goalName}
        </button>
        {taskTitle && (
          <>
            <ChevronRight size={11} className="text-muted-foreground/50 shrink-0" />
            <span className="font-medium text-foreground truncate">{taskTitle}</span>
          </>
        )}
      </nav>

      <div className="relative" ref={popoverRef}>
        <button
          onClick={() => setSettingsOpen(v => !v)}
          className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="設定"
        >
          <Settings size={15} />
        </button>

        {settingsOpen && (
          <div className="absolute right-0 top-9 z-50 w-64 bg-card border border-border rounded-xl shadow-lg p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">表示設定</p>
            <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
              <span className="text-sm text-foreground">プロジェクト選択時にモーダルを表示</span>
              <button
                role="switch"
                aria-checked={showProjectSplash ?? true}
                onClick={toggleSplash}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${
                  showProjectSplash ? "bg-[oklch(0.540_0.110_165)]" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    showProjectSplash ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
        )}
      </div>
    </header>
  )
}
