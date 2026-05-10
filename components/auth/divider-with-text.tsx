interface DividerWithTextProps {
  text?: string
}

export function DividerWithText({ text = "Or continue with email" }: DividerWithTextProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 border-t border-border" />
      <span className="text-sm text-muted-foreground flex-shrink-0">{text}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}
