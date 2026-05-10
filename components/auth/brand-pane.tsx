import { CheckSquare } from "lucide-react"
import { DashboardPreview } from "./dashboard-preview"

interface BrandPaneProps {
  tagline: string
  subCopy?: string
  showDashboardPreview?: boolean
}

export function BrandPane({ tagline, subCopy, showDashboardPreview }: BrandPaneProps) {
  return (
    <div className="flex flex-col justify-center h-full p-8 md:p-16">
      <div className="animate-auth-fade-up animation-delay-[50ms]">
        <div className="flex items-center gap-2 mb-8">
          <CheckSquare className="h-5 w-5 text-brand" />
          <span className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-foreground">
            TaskFlow
          </span>
        </div>
      </div>

      <h1 className="animate-auth-fade-up animation-delay-[100ms] text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground mb-4">
        {tagline}
      </h1>

      {subCopy && (
        <p className="animate-auth-fade-up animation-delay-[180ms] text-[clamp(1rem,1.5vw,1.125rem)] text-muted-foreground leading-relaxed max-w-[42ch]">
          {subCopy}
        </p>
      )}

      {showDashboardPreview && (
        <div className="animate-auth-fade-up-scale animation-delay-[250ms] mt-8">
          <DashboardPreview />
        </div>
      )}
    </div>
  )
}
