import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Spinner className="size-8 text-muted-foreground" />
      <p className="text-lg font-semibold tracking-tight">TaskFlow</p>
      <p className="text-sm text-muted-foreground animate-pulse">
        Loading...
      </p>
    </div>
  );
}
