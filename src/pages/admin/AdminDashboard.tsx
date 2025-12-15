import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import { Users, UserCheck, BookOpen, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartWrapper } from "@/components/shared/ChartWrapper";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { useNavigate } from "react-router-dom";

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

  // Mock data for charts
  const attendanceData = [
    { month: "Jan", percentage: 85 },
    { month: "Feb", percentage: 88 },
    { month: "Mar", percentage: 82 },
    { month: "Apr", percentage: 90 },
    { month: "May", percentage: 87 },
    { month: "Jun", percentage: 92 },
  ];

  const gradeDistributionData = [
    { grade: "A+", count: 120, percentage: 15 },
    { grade: "A", count: 180, percentage: 22.5 },
    { grade: "B+", count: 150, percentage: 18.75 },
    { grade: "B", count: 140, percentage: 17.5 },
    { grade: "C+", count: 100, percentage: 12.5 },
    { grade: "C", count: 80, percentage: 10 },
    { grade: "F", count: 30, percentage: 3.75 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"];

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
            description="Monthly average attendance percentage"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          <ChartWrapper
            title="Grade Distribution"
            description="Current semester grade breakdown"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
