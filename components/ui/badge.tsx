import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "admin" | "moderator" | "approved" | "pending"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
    admin: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
    moderator: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
    approved: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
    pending: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  }

  return (
    <div 
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]} ${className || ''}`}
      {...props} 
    />
  )
}

export { Badge }