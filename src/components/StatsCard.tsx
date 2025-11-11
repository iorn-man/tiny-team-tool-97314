import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: Icon, description, trend }: StatsCardProps) => {
  return (
    <Card className="transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform hover:scale-110">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-xs">
            <span className={trend.isPositive ? "text-success" : "text-destructive"}>
              {trend.isPositive ? "+" : ""}{trend.value}
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
