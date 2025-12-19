import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any[]) => Promise<void>;
  type: "students" | "faculty" | "courses";
}

interface ParsedRow {
  data: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

const requiredFields = {
  students: ["full_name", "email", "student_id"],
  faculty: ["full_name", "email", "faculty_id"],
  courses: ["course_code", "course_name", "credits"],
};

export function CSVImportDialog({ open, onOpenChange, onImport, type }: CSVImportDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [importProgress, setImportProgress] = useState(0);

  const csvTemplates = {
    students: "full_name,email,phone,student_id,date_of_birth,gender,address,status\nJohn Doe,john@example.com,1234567890,STU001,2000-01-15,Male,123 Main St,active",
    faculty: "full_name,email,phone,faculty_id,department,qualification,specialization,joining_date,status\nDr. Jane Smith,jane@example.com,1234567890,FAC001,Computer Science,Ph.D.,AI,2020-01-01,active",
    courses: "course_code,course_name,description,credits,department,semester,status\nCS101,Intro to Programming,Learn basics,3,Computer Science,1,active"
  };

  const validateRow = (row: Record<string, string>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const required = requiredFields[type];

    required.forEach(field => {
      if (!row[field] || row[field].trim() === "") {
        errors.push(`Missing ${field.replace("_", " ")}`);
      }
    });

    // Email validation
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push("Invalid email format");
    }

    // Credits validation for courses
    if (type === "courses" && row.credits) {
      const credits = parseInt(row.credits);
      if (isNaN(credits) || credits < 1 || credits > 10) {
        errors.push("Credits must be 1-10");
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSVPreview(selectedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCSVPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim());
      const csvHeaders = lines[0].split(",").map(h => h.trim());
      setHeaders(csvHeaders);
      setTotalRows(lines.length - 1);

      const previewData = lines.slice(1, 6).map(line => {
        const values = line.split(",").map(v => v.trim());
        const rowData = csvHeaders.reduce((obj, header, index) => {
          obj[header] = values[index] || "";
          return obj;
        }, {} as Record<string, string>);
        
        const validation = validateRow(rowData);
        return {
          data: rowData,
          isValid: validation.isValid,
          errors: validation.errors,
        };
      });
      setPreview(previewData);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    const csvHeaders = lines[0].split(",").map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      return csvHeaders.reduce((obj, header, index) => {
        obj[header] = values[index] || "";
        return obj;
      }, {} as any);
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setImportProgress(0);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          throw new Error("No valid data found in CSV");
        }

        // Validate all rows
        const validData = data.filter(row => validateRow(row).isValid);
        const invalidCount = data.length - validData.length;

        if (validData.length === 0) {
          throw new Error("All rows have validation errors");
        }

        // Simulate progress
        for (let i = 0; i <= 100; i += 20) {
          setImportProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        await onImport(validData);
        
        toast({
          title: "Import Successful",
          description: `Imported ${validData.length} ${type}${invalidCount > 0 ? ` (${invalidCount} rows skipped due to errors)` : ""}`,
        });
        
        setFile(null);
        setPreview([]);
        setHeaders([]);
        setTotalRows(0);
        setImportProgress(0);
        onOpenChange(false);
      } catch (error: any) {
        toast({
          title: "Import Failed",
          description: error.message || "Failed to import CSV data",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = csvTemplates[type];
    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validCount = preview.filter(row => row.isValid).length;
  const invalidCount = preview.filter(row => !row.isValid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import {type.charAt(0).toUpperCase() + type.slice(1)} from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import {type}. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Required fields: {requiredFields[type].join(", ")}. Other fields are optional.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Download Template</Label>
              <Button 
                type="button" 
                variant="outline" 
                onClick={downloadTemplate}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="csv-file">Upload CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Preview ({Math.min(5, totalRows)} of {totalRows} rows)</Label>
                <div className="flex gap-2">
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {validCount} valid
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {invalidCount} invalid
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Status</TableHead>
                      {headers.slice(0, 5).map((header) => (
                        <TableHead key={header} className="min-w-[100px]">
                          {header}
                          {requiredFields[type].includes(header) && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </TableHead>
                      ))}
                      {headers.length > 5 && (
                        <TableHead>+{headers.length - 5} more</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, index) => (
                      <TableRow key={index} className={!row.isValid ? "bg-destructive/10" : ""}>
                        <TableCell>
                          {row.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="group relative">
                              <XCircle className="h-4 w-4 text-destructive cursor-help" />
                              <div className="absolute left-0 top-6 hidden group-hover:block z-10 bg-popover border rounded-md p-2 text-xs min-w-[150px] shadow-lg">
                                {row.errors.map((err, i) => (
                                  <div key={i} className="text-destructive">{err}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </TableCell>
                        {headers.slice(0, 5).map((header) => (
                          <TableCell key={header} className="text-sm">
                            {row.data[header] || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                        ))}
                        {headers.length > 5 && (
                          <TableCell className="text-muted-foreground text-xs">...</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <Label>Importing...</Label>
              <Progress value={importProgress} />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setFile(null);
                setPreview([]);
                setHeaders([]);
                setTotalRows(0);
                onOpenChange(false);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file || isProcessing || validCount === 0}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isProcessing ? "Importing..." : `Import ${validCount > 0 ? validCount : ""} ${type}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
