import Link from "next/link";

interface TocItem {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  lastUpdated?: string;
  description?: string;
  toc?: TocItem[];
  children: React.ReactNode;
}

export function LegalLayout({
  title,
  lastUpdated,
  description,
  toc,
  children,
}: LegalLayoutProps) {
  const hasToc = toc && toc.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div
        className={
          hasToc
            ? "lg:grid lg:grid-cols-[240px_1fr] lg:gap-16"
            : "max-w-[72ch] mx-auto"
        }
      >
        {/* TOC sidebar (desktop only) */}
        {hasToc && (
          <aside className="hidden lg:block" aria-label="Table of contents">
            <div className="sticky top-24">
              <p className="text-xs uppercase tracking-widest text-brand font-semibold mb-4">
                On this page
              </p>
              <nav>
                {toc.map((item) => (
                  <Link
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-muted-foreground hover:text-foreground py-1.5 transition-colors duration-150 landing-focus rounded-sm px-1 -ml-1"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Content */}
        <article className={hasToc ? "max-w-[72ch]" : ""}>
          {lastUpdated && (
            <p className="text-sm text-foreground/30 mb-6">{lastUpdated}</p>
          )}
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-[-0.03em] text-foreground leading-[1.1]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-[52ch]">
              {description}
            </p>
          )}
          <hr className="border-white/[0.08] my-8" />
          <div className="prose-legal">{children}</div>
        </article>
      </div>
    </div>
  );
}
