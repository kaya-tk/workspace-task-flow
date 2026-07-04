"use client"

import { ChevronRight } from "lucide-react"

interface GlobalHeaderProps {
  projectName: string
  goalName: string
  taskTitle?: string | null
  onClickProject?: () => void
  onClickGoal?: () => void
}

export function GlobalHeader({ projectName, goalName, taskTitle, onClickProject, onClickGoal }: GlobalHeaderProps) {
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
    </header>
  )
}
