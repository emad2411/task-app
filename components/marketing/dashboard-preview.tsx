import Image from "next/image";

export function DashboardPreview() {
  return (
    <div
      role="img"
      aria-label="TaskFlow dashboard preview"
      className="relative mx-auto w-full max-w-5xl"
      style={{
        perspective: "1200px",
      }}
    >
      <div
        className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#1e1e1e] shadow-[0_0_80px_rgba(24,226,153,0.08)] lg:[transform:perspective(1200px)_rotateX(4deg)]"
        style={{
          willChange: "transform",
        }}
      >
        {/* macOS Browser Chrome */}
        <div className="flex h-11 items-center gap-2 border-b border-white/[0.06] bg-[#2d2d2d] px-4">
          {/* Traffic Lights */}
          <div className="flex gap-2">
            <div className="h-3.5 w-3.5 rounded-full bg-[#ff5f57] border border-[#e0443e]/30" />
            <div className="h-3.5 w-3.5 rounded-full bg-[#febc2e] border border-[#d89e1f]/30" />
            <div className="h-3.5 w-3.5 rounded-full bg-[#28c840] border border-[#1aab29]/30" />
          </div>
          
          {/* Address Bar */}
          <div className="mx-auto flex h-7 w-full max-w-md items-center justify-center rounded-md bg-[#1e1e1e] px-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-gray-500">app.taskflow.com</span>
            </div>
          </div>
        </div>

        {/* Real dashboard screenshot */}
        <div className="w-full bg-background">
          <Image
            src="/dashboard-screenshot.png"
            alt="TaskFlow Dashboard showing metrics, charts, and task list"
            width={1200}
            height={800}
            className="w-full h-auto object-cover object-top"
            priority
          />
        </div>
      </div>
    </div>
  );
}
