import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Users, UserCheck, BookOpen, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const { data: dashboardStats, isLoading } = useDashboardStats();
  const { activities } = useRecentActivities();
  const navigate = useNavigate();

  const stats = [
    { title: "Total Students", value: dashboardStats?.totalStudents.toString() || "0", icon: Users },
    { title: "Faculty Members", value: dashboardStats?.totalFaculty.toString() || "0", icon: UserCheck },
    { title: "Active Courses", value: dashboardStats?.totalCourses.toString() || "0", icon: BookOpen },
    { title: "Pending Feedback", value: dashboardStats?.pendingFeedback.toString() || "0", icon: MessageSquare },
  ];

  const quickActions = [
    { 
      title: "Add New Student", 
      description: "Register a new student",
      action: () => navigate("/admin/students")
    },
    { 
      title: "Create Announcement", 
      description: "Post a new announcement",
      action: () => navigate("/admin/announcements")
    },
    { 
      title: "View Reports", 
      description: "Generate system reports",
      action: () => navigate("/admin/reports")
    },
  ];

  // Fetch real attendance data for the last 6 months
  const { data: attendanceChartData, isLoading: attendanceLoading } = useQuery({
    queryKey: ["attendance-chart"],
    queryFn: async () => {
      const months = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const start = format(startOfMonth(monthDate), "yyyy-MM-dd");
        const end = format(endOfMonth(monthDate), "yyyy-MM-dd");

        const { data: attendance } = await supabase
          .from("attendance")
          .select("status")
          .gte("date", start)
          .lte("date", end);

        const total = attendance?.length || 0;
        const present = attendance?.filter(a => a.status === "present").length || 0;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        months.push({
          month: format(monthDate, "MMM"),
          percentage,
        });
      }

      return months;
    },
  });

  // Fetch real grade distribution
  const { data: gradeChartData, isLoading: gradesLoading } = useQuery({
    queryKey: ["grade-distribution"],
    queryFn: async () => {
      const { data: grades } = await supabase
        .from("grades")
        .select("grade_letter");

      const distribution: Record<string, number> = {
        "A+": 0, "A": 0, "B+": 0, "B": 0, "C+": 0, "C": 0, "D": 0, "F": 0,
      };

      grades?.forEach(g => {
        if (g.grade_letter && distribution.hasOwnProperty(g.grade_letter)) {
          distribution[g.grade_letter]++;
        }
      });

      const total = grades?.length || 0;
      return Object.entries(distribution)
        .filter(([_, count]) => count > 0)
        .map(([grade, count]) => ({
          grade,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0,
        }));
    },
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B6B"];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin! Here's what's happening today.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                ) : (
                  activities.slice(0, 6).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {quickActions.map((action, index) => (
                  <button 
                    key={index}
                    className="p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors"
                    onClick={action.action}
                  >
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <ChartWrapper
            title="Attendance Overview"
            description="Monthly average attendance percentage (last 6 months)"
          >
            {attendanceLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Skeleton className="h-full w-full" />
              </div>
            ) : attendanceChartData && attendanceChartData.some(d => d.percentage > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Attendance"]}
                  />
                  <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No attendance data available
              </div>
            )}
          </ChartWrapper>

          <ChartWrapper
            title="Grade Distribution"
            description="Current grade breakdown across all courses"
          >
            {gradesLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Skeleton className="h-full w-full" />
              </div>
            ) : gradeChartData && gradeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {gradeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} students (${props.payload.percentage}%)`,
                      props.payload.grade
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No grade data available
              </div>
            )}
          </ChartWrapper>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
