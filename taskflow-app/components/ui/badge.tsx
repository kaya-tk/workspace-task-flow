import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold select-none",
  {
    variants: {
      variant: {
        default:    "bg-primary/10 text-primary",
        todo:       "bg-muted text-muted-foreground",
        inprogress: "bg-blue-100 text-blue-700",
        done:       "bg-green-100 text-green-700",
        task:       "bg-primary text-primary-foreground",
        outline:    "border border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
