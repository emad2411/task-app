import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * SettingsLoading — Loading skeleton for the settings page.
 *
 * Matches the sidebar layout of the settings page with a skeleton
 * for the navigation and the active form card.
 *
 * @returns The loading skeleton component
 */
export default function SettingsLoading() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Sidebar skeleton - hidden on mobile */}
        <div className="hidden lg:block w-48 shrink-0 space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Mobile tabs skeleton */}
        <div className="lg:hidden mb-6 flex gap-1">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex justify-end pt-2">
                <Skeleton className="h-10 w-36" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
