import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any[]) => Promise<void>;
  type: "students" | "faculty" | "courses";
}

export function CSVImportDialog({ open, onOpenChange, onImport, type }: CSVImportDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const csvTemplates = {
    students: "full_name,email,phone,student_id,date_of_birth,gender,address,status\nJohn Doe,john@example.com,1234567890,STU001,2000-01-15,Male,123 Main St,active",
    faculty: "full_name,email,phone,faculty_id,department,qualification,specialization,joining_date,status\nDr. Jane Smith,jane@example.com,1234567890,FAC001,Computer Science,Ph.D.,AI,2020-01-01,active",
    courses: "course_code,course_name,description,credits,department,semester,status\nCS101,Intro to Programming,Learn basics,3,Computer Science,1,active"
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
      const headers = lines[0].split(",").map(h => h.trim());
      const previewData = lines.slice(1, 4).map(line => {
        const values = line.split(",").map(v => v.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || "";
          return obj;
        }, {} as any);
      });
      setPreview(previewData);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.trim());
      return headers.reduce((obj, header, index) => {
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
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          throw new Error("No valid data found in CSV");
        }

        await onImport(data);
        
        toast({
          title: "Import Successful",
          description: `Successfully imported ${data.length} ${type}`,
        });
        
        setFile(null);
        setPreview([]);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              Make sure your CSV follows the correct format. Use the template below as a guide.
            </AlertDescription>
          </Alert>

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

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview (First 3 rows)</Label>
              <div className="border rounded-md p-4 bg-muted/50 overflow-x-auto">
                <pre className="text-xs">
                  {JSON.stringify(preview, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setFile(null);
                setPreview([]);
                onOpenChange(false);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file || isProcessing}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isProcessing ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
