import Link from "next/link"

export function BackToSignInLink() {
  return (
    <div className="text-center">
      <Link
        href="/sign-in"
        className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
      >
        Back to sign in
      </Link>
    </div>
  )
}
