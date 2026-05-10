import { ReactNode } from "react"
import Link from "next/link"
import { CheckSquare } from "lucide-react"
import { BrandPane } from "./brand-pane"

interface SplitAuthLayoutProps {
  children: ReactNode
  tagline: string
  subCopy?: string
  showDashboardPreview?: boolean
}

export function SplitAuthLayout({
  children,
  tagline,
  subCopy,
  showDashboardPreview = false,
}: SplitAuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-[1fr_1fr] lg:grid-cols-[45%_55%] bg-background">
      {/* Brand Pane */}
      <div className="hidden md:flex md:sticky md:top-0 md:h-screen">
        <BrandPane
          tagline={tagline}
          subCopy={subCopy}
          showDashboardPreview={showDashboardPreview}
        />
      </div>

      {/* Form Pane */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile: show wordmark + tagline above form */}
          <div className="md:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <CheckSquare className="h-6 w-6 text-brand" />
              <span className="text-[1.5rem] font-bold leading-[1.2] tracking-[-0.02em] text-foreground">
                TaskFlow
              </span>
            </div>
            <h1 className="text-[clamp(2rem,7vw,2.5rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground mb-3 text-balance">
              {tagline}
            </h1>
            {subCopy && (
              <p className="text-base text-muted-foreground leading-relaxed text-balance">
                {subCopy}
              </p>
            )}
          </div>

          <div className="animate-auth-fade-up animation-delay-[100ms]">
            {children}
          </div>

          {/* Legal Footer */}
          <div className="animate-auth-fade-up animation-delay-[400ms] mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
