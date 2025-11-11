import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "default" | "card" | "table" | "text" | "avatar" | "chart";
}

export const LoadingSkeleton = ({ className, variant = "default" }: LoadingSkeletonProps) => {
  const variants = {
    default: "h-4 w-full rounded",
    card: "h-32 w-full rounded-lg",
    table: "h-12 w-full rounded",
    text: "h-4 w-3/4 rounded",
    avatar: "h-12 w-12 rounded-full",
    chart: "h-64 w-full rounded-lg",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variants[variant],
        className
      )}
    />
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 5 }: TableSkeletonProps) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={i} variant="table" className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <LoadingSkeleton key={j} variant="default" className="flex-1 h-8" />
          ))}
        </div>
      ))}
    </div>
  );
};

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton = ({ count = 1 }: CardSkeletonProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 p-6 border rounded-lg">
          <LoadingSkeleton variant="text" className="w-1/2" />
          <LoadingSkeleton variant="text" className="w-3/4 h-8" />
          <LoadingSkeleton variant="text" className="w-1/4" />
        </div>
      ))}
    </div>
  );
};

interface FormSkeletonProps {
  fields?: number;
}

export const FormSkeleton = ({ fields = 4 }: FormSkeletonProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <LoadingSkeleton variant="text" className="w-1/4 h-3" />
          <LoadingSkeleton variant="default" className="h-10" />
        </div>
      ))}
    </div>
  );
};