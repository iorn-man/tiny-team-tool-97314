import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Calendar, Users } from "lucide-react";
import { PlacementCompaniesTable } from "@/components/admin/placements/PlacementCompaniesTable";
import { PlacementScheduleTable } from "@/components/admin/placements/PlacementScheduleTable";
import { PlacedStudentsTable } from "@/components/admin/placements/PlacedStudentsTable";
import { AddCompanyDialog } from "@/components/admin/placements/AddCompanyDialog";
import { AddScheduleDialog } from "@/components/admin/placements/AddScheduleDialog";
import StatsCard from "@/components/StatsCard";

const Placements = () => {
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);

  const stats = [
    { title: "Total Companies", value: "45", icon: Building2 },
    { title: "Scheduled Drives", value: "12", icon: Calendar },
    { title: "Placed Students", value: "278", icon: Users },
    { title: "Placement Rate", value: "87%", icon: Users },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Placements Management</h1>
            <p className="text-muted-foreground">Manage placement companies, schedules, and track placed students</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <Tabs defaultValue="companies" className="space-y-4">
          <TabsList>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="placed">Placed Students</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Placement Companies</CardTitle>
                    <CardDescription>Manage companies participating in campus placements</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddCompany(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PlacementCompaniesTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Placement Schedule</CardTitle>
                    <CardDescription>View and manage upcoming placement drives</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddSchedule(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Drive
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PlacementScheduleTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="placed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Placed Students</CardTitle>
                <CardDescription>Track and manage student placement records</CardDescription>
              </CardHeader>
              <CardContent>
                <PlacedStudentsTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AddCompanyDialog open={showAddCompany} onOpenChange={setShowAddCompany} />
        <AddScheduleDialog open={showAddSchedule} onOpenChange={setShowAddSchedule} />
      </div>
    </DashboardLayout>
  );
};

export default Placements;
