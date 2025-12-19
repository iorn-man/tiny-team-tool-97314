import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BulkEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: any[];
  courses: any[];
  existingEnrollments: any[];
  onBulkEnroll: (courseId: string, studentIds: string[]) => Promise<void>;
}

export function BulkEnrollmentDialog({
  open,
  onOpenChange,
  students,
  courses,
  existingEnrollments,
  onBulkEnroll,
}: BulkEnrollmentDialogProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Get students not already enrolled in selected course
  const availableStudents = useMemo(() => {
    if (!selectedCourse) return students;
    
    const enrolledStudentIds = existingEnrollments
      .filter(e => e.course_id === selectedCourse && e.status === "enrolled")
      .map(e => e.student_id);
    
    return students.filter(s => !enrolledStudentIds.includes(s.id));
  }, [students, selectedCourse, existingEnrollments]);

  // Filter by search
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return availableStudents;
    const query = searchQuery.toLowerCase();
    return availableStudents.filter(
      s => s.full_name.toLowerCase().includes(query) || 
           s.student_id.toLowerCase().includes(query) ||
           s.email?.toLowerCase().includes(query)
    );
  }, [availableStudents, searchQuery]);

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedCourse || selectedStudents.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      await onBulkEnroll(selectedCourse, selectedStudents);
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Reset and close
      setSelectedCourse("");
      setSelectedStudents([]);
      setSearchQuery("");
      onOpenChange(false);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedCourse("");
      setSelectedStudents([]);
      setSearchQuery("");
      onOpenChange(false);
    }
  };

  const selectedCourseName = courses.find(c => c.id === selectedCourse)?.course_name;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Enrollment
          </DialogTitle>
          <DialogDescription>
            Select a course and multiple students to enroll at once
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label>Select Course *</Label>
            <Select value={selectedCourse} onValueChange={(value) => {
              setSelectedCourse(value);
              setSelectedStudents([]);
            }}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.course_code} - {course.course_name} (Sem {course.semester})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCourse && (
            <>
              {/* Search and Select All */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              {/* Selected count */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {availableStudents.length} students available for enrollment
                </span>
                {selectedStudents.length > 0 && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {selectedStudents.length} selected
                  </Badge>
                )}
              </div>

              {/* Student List */}
              <ScrollArea className="h-[300px] border rounded-md">
                <div className="p-2 space-y-1">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {availableStudents.length === 0
                        ? "All students are already enrolled in this course"
                        : "No students match your search"}
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          selectedStudents.includes(student.id)
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleStudent(student.id)}
                      >
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{student.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.student_id} • {student.email}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {student.status || "active"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <Label>Enrolling students...</Label>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCourse || selectedStudents.length === 0 || isProcessing}
          >
            {isProcessing
              ? "Enrolling..."
              : `Enroll ${selectedStudents.length} Student${selectedStudents.length !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
