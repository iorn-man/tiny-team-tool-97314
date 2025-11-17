import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users as UsersIcon } from "lucide-react";
import { CreateStudentAccountDialog } from "@/components/admin/CreateStudentAccountDialog";
import { CreateFacultyAccountDialog } from "@/components/admin/CreateFacultyAccountDialog";
import { StudentAccountsTable } from "@/components/admin/StudentAccountsTable";
import { FacultyAccountsTable } from "@/components/admin/FacultyAccountsTable";

const Users = () => {
  const [createStudentOpen, setCreateStudentOpen] = useState(false);
  const [createFacultyOpen, setCreateFacultyOpen] = useState(false);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Accounts</h2>
            <p className="text-muted-foreground">
              Manage student and faculty login credentials
            </p>
          </div>
        </div>

        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students">Student Accounts</TabsTrigger>
            <TabsTrigger value="faculty">Faculty Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Accounts</CardTitle>
                    <CardDescription>
                      Create and manage student login credentials
                    </CardDescription>
                  </div>
                  <Button onClick={() => setCreateStudentOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Student Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <StudentAccountsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faculty" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Faculty Accounts</CardTitle>
                    <CardDescription>
                      Create and manage faculty login credentials
                    </CardDescription>
                  </div>
                  <Button onClick={() => setCreateFacultyOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Faculty Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <FacultyAccountsTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CreateStudentAccountDialog
          open={createStudentOpen}
          onOpenChange={setCreateStudentOpen}
        />
        <CreateFacultyAccountDialog
          open={createFacultyOpen}
          onOpenChange={setCreateFacultyOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default Users;
