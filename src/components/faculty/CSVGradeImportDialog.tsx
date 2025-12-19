import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CSVGradeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
  assessmentType: string;
  assessmentName: string;
  maxMarks: number;
  enrolledStudents: { id: string; student_id: string; full_name: string }[];
  onImport: (grades: Record<string, string>) => void;
}

interface ParsedRow {
  studentId: string;
  marks: string;
  status: "valid" | "invalid" | "not_found";
  message?: string;
  matchedStudent?: { id: string; student_id: string; full_name: string };
}

const CSVGradeImportDialog = ({
  open,
  onOpenChange,
  courseId,
  courseName,
  assessmentType,
  assessmentName,
  maxMarks,
  enrolledStudents,
  onImport,
}: CSVGradeImportDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");

  const downloadTemplate = () => {
    const headers = ["student_id", "marks"];
    const sampleData = enrolledStudents.slice(0, 3).map(s => [s.student_id, ""]);
    
    const csvContent = [
      headers.join(","),
      ...sampleData.map(row => row.join(",")),
      ...enrolledStudents.slice(3).map(s => [s.student_id, ""].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grade_template_${assessmentType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Fill in the marks column and upload the file",
    });
  };

  const parseCSV = (content: string): ParsedRow[] => {
    const lines = content.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
    const studentIdIndex = headers.findIndex(h => 
      h === "student_id" || h === "studentid" || h === "roll_number" || h === "rollnumber" || h === "roll"
    );
    const marksIndex = headers.findIndex(h => 
      h === "marks" || h === "score" || h === "obtained_marks" || h === "grade"
    );

    if (studentIdIndex === -1 || marksIndex === -1) {
      toast({
        title: "Invalid CSV Format",
        description: "CSV must have 'student_id' and 'marks' columns",
        variant: "destructive",
      });
      return [];
    }

    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const studentId = values[studentIdIndex];
      const marks = values[marksIndex];

      if (!studentId) continue;

      const matchedStudent = enrolledStudents.find(s => 
        s.student_id.toLowerCase() === studentId.toLowerCase()
      );

      if (!matchedStudent) {
        rows.push({
          studentId,
          marks,
          status: "not_found",
          message: "Student not enrolled in this course",
        });
        continue;
      }

      const numMarks = parseFloat(marks);
      if (isNaN(numMarks) || numMarks < 0 || numMarks > maxMarks) {
        rows.push({
          studentId,
          marks,
          status: "invalid",
          message: `Marks must be between 0 and ${maxMarks}`,
          matchedStudent,
        });
        continue;
      }

      rows.push({
        studentId,
        marks,
        status: "valid",
        matchedStudent,
      });
    }

    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSV(content);
      setParsedData(parsed);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const validRows = parsedData.filter(r => r.status === "valid");
    if (validRows.length === 0) {
      toast({
        title: "No Valid Data",
        description: "No valid grades found to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    const grades: Record<string, string> = {};
    validRows.forEach(row => {
      if (row.matchedStudent) {
        grades[row.matchedStudent.id] = row.marks;
      }
    });

    setTimeout(() => {
      onImport(grades);
      setImporting(false);
      onOpenChange(false);
      setParsedData([]);
      setFileName("");

      toast({
        title: "Grades Imported",
        description: `Successfully imported ${validRows.length} grades`,
      });
    }, 500);
  };

  const validCount = parsedData.filter(r => r.status === "valid").length;
  const invalidCount = parsedData.filter(r => r.status === "invalid").length;
  const notFoundCount = parsedData.filter(r => r.status === "not_found").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Grades from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with student grades for {assessmentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">Course: {courseName}</p>
            <p className="text-sm">Assessment: {assessmentName} (Max: {maxMarks} marks)</p>
            <p className="text-sm text-muted-foreground">Enrolled Students: {enrolledStudents.length}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTemplate} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {fileName && (
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{fileName}</span>
            </div>
          )}

          {parsedData.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-success/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-success">{validCount}</p>
                  <p className="text-xs text-muted-foreground">Valid</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-destructive">{invalidCount}</p>
                  <p className="text-xs text-muted-foreground">Invalid</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-warning">{notFoundCount}</p>
                  <p className="text-xs text-muted-foreground">Not Found</p>
                </div>
              </div>

              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Student ID</th>
                      <th className="px-3 py-2 text-left">Marks</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "" : "bg-muted/20"}>
                        <td className="px-3 py-2">{row.studentId}</td>
                        <td className="px-3 py-2">{row.marks}</td>
                        <td className="px-3 py-2">
                          {row.status === "valid" && (
                            <span className="flex items-center gap-1 text-success">
                              <CheckCircle2 className="h-3 w-3" />
                              Valid
                            </span>
                          )}
                          {row.status === "invalid" && (
                            <span className="flex items-center gap-1 text-destructive">
                              <AlertCircle className="h-3 w-3" />
                              {row.message}
                            </span>
                          )}
                          {row.status === "not_found" && (
                            <span className="flex items-center gap-1 text-warning">
                              <AlertCircle className="h-3 w-3" />
                              {row.message}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || importing}
          >
            {importing ? "Importing..." : `Import ${validCount} Grades`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CSVGradeImportDialog;
