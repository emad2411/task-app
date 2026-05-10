import { ReactNode } from "react"
import { CheckCircle2 } from "lucide-react"

interface SuccessStateProps {
  title: string
  message: string
  children?: ReactNode
}

export function SuccessState({ title, message, children }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-6">
      <div className="bg-brand/10 p-4 rounded-full mb-6">
        <CheckCircle2 className="h-12 w-12 text-brand" />
      </div>
      <h2 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground mb-2">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        {message}
      </p>
      {children && (
        <div className="w-full pt-6 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}
