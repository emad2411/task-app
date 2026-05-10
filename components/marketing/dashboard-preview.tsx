"use client";

export function DashboardPreview() {
  return (
    <div
      className="relative mx-auto w-full max-w-5xl"
      style={{
        perspective: "1200px",
      }}
    >
      <div
        className="overflow-hidden rounded-xl border border-white/[0.08] bg-card shadow-[0_0_80px_rgba(24,226,153,0.08)] lg:[transform:perspective(1200px)_rotateX(4deg)]"
        style={{
          willChange: "transform",
        }}
      >
        {/* Fake app chrome */}
        <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] bg-background px-4">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <div className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="ml-4 h-5 flex-1 max-w-[200px] rounded-md bg-[#1a1a1a]" />
        </div>

        {/* Fake dashboard content */}
        <div className="flex min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
          {/* Fake sidebar */}
          <div className="hidden w-14 flex-col gap-3 border-r border-white/[0.06] bg-background p-2 sm:flex md:w-16 md:p-3">
            <div className="h-8 rounded-md bg-[#1a1a1a]" />
            <div className="h-8 rounded-md bg-[#1a1a1a]" />
            <div className="h-8 rounded-md bg-[#1a1a1a]" />
            <div className="mt-auto h-8 rounded-md bg-[#1a1a1a]" />
          </div>

          {/* Fake main content */}
          <div className="flex-1 p-4 md:p-6">
            {/* Fake header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="h-6 w-32 rounded-md bg-[#1a1a1a]" />
              <div className="h-8 w-24 rounded-md bg-brand/20" />
            </div>

            {/* Fake stats row */}
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/[0.06] bg-background p-3 md:p-4"
                >
                  <div className="mb-2 h-3 w-16 rounded bg-[#1a1a1a]" />
                  <div className="h-6 w-8 rounded bg-[#1a1a1a]" />
                </div>
              ))}
            </div>

            {/* Fake task list */}
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-background p-3"
                >
                  <div className="h-4 w-4 rounded-sm border border-white/20" />
                  <div className="flex-1">
                    <div className="mb-1.5 h-3 w-3/4 max-w-[280px] rounded bg-[#1a1a1a]" />
                    <div className="flex gap-2">
                      <div className="h-5 w-14 rounded-full bg-brand/15" />
                      <div className="h-5 w-16 rounded-full bg-[#1a1a1a]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
