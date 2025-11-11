import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart3, FileText, Download, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const Reports = () => {
  const [reportType, setReportType] = useState("attendance");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const reportTypes = [
    { value: "attendance", label: "Attendance Report", icon: BarChart3 },
    { value: "grades", label: "Grade Distribution", icon: TrendingUp },
    { value: "enrollment", label: "Enrollment Statistics", icon: FileText },
    { value: "faculty", label: "Faculty Performance", icon: BarChart3 },
  ];

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
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export comprehensive reports</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.value}
                className={cn(
                  "cursor-pointer transition-colors",
                  reportType === type.value ? "border-primary" : "hover:border-muted-foreground/50"
                )}
                onClick={() => setReportType(type.value)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{type.label}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Configure parameters for your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="CS">Computer Science</SelectItem>
                  <SelectItem value="EE">Electrical Engineering</SelectItem>
                  <SelectItem value="ME">Mechanical Engineering</SelectItem>
                  <SelectItem value="CE">Civil Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerateReport} className="flex-1">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

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
                  Configure your report parameters and click "Generate Report" to view the preview
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

export default Reports;
