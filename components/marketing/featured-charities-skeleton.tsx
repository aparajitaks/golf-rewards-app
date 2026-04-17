import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCharitiesSkeleton() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-5 w-[85%]" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
