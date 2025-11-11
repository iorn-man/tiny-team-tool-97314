import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Download, FileText, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const FacultyReports = () => {
  const [selectedCourse, setSelectedCourse] = useState("cs101");
  const [reportType, setReportType] = useState("attendance");

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Your report has been generated successfully.",
    });
  };

  const handleExportReport = (format: string) => {
    toast({
      title: `Exporting to ${format.toUpperCase()}`,
      description: "Your report will be downloaded shortly.",
    });
  };

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate student performance reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>Select course and report type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs101">CS101 - Introduction to Programming</SelectItem>
                    <SelectItem value="cs201">CS201 - Data Structures</SelectItem>
                    <SelectItem value="cs301">CS301 - Database Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance Report</SelectItem>
                    <SelectItem value="grades">Grade Distribution</SelectItem>
                    <SelectItem value="performance">Student Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleGenerateReport} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.5%</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">B+</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">115</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>Generated report preview and export options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a course and report type, then click "Generate Report" to view the preview
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExportReport("pdf")}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExportReport("excel")}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export as Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacultyReports;
