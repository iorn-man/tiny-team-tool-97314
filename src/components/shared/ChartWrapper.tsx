import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { TrendingUp } from "lucide-react";

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const ChartWrapper = ({
  title,
  description,
  children,
  loading = false,
  empty = false,
  emptyMessage = "No data available",
  className,
}: ChartWrapperProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton variant="chart" />
        ) : empty ? (
          <EmptyState
            icon={TrendingUp}
            title="No data"
            description={emptyMessage}
            className="py-8"
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};