import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        variant === "primary" && "bg-z-alive text-z-bg hover:brightness-95",
        variant === "secondary" && "bg-z-surface-2 text-z-text hover:bg-z-surface-2/70",
        variant === "outline" && "border border-z-border text-z-text hover:bg-z-surface-2",
        variant === "ghost" && "text-z-text-dim hover:text-z-text",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className
      )}
      {...props}
    />
  )
}
