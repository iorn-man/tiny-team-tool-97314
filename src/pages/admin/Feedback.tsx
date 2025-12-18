import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useFeedback } from "@/hooks/useFeedback";
import { useStudents } from "@/hooks/useStudents";
import { LoadingSkeleton } from "@/components/shared";
import { format } from "date-fns";

const Feedback = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [response, setResponse] = useState("");

  const { feedbacks, isLoading, updateFeedback } = useFeedback();
  const { students } = useStudents();

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.full_name : "Unknown Student";
  };

  const getStudentEmail = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.email : "";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      in_progress: { variant: "default", icon: MessageSquare },
      under_review: { variant: "outline", icon: MessageSquare },
      resolved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
      closed: { variant: "secondary", icon: CheckCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const filteredFeedback = feedbacks.filter((fb) => {
    const studentName = getStudentName(fb.student_id);
    const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || fb.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmitResponse = () => {
    if (!selectedFeedback || !response.trim()) {
      toast({
        title: "Error",
        description: "Please enter a response",
        variant: "destructive",
      });
      return;
    }

    updateFeedback.mutate({
      id: selectedFeedback.id,
      admin_response: response,
      status: "resolved" as const,
    });
    setResponse("");
    setSelectedFeedback(null);
  };

  const handleUpdateStatus = (feedbackId: string, newStatus: string) => {
    updateFeedback.mutate({
      id: feedbackId,
      status: newStatus as "pending" | "in_progress" | "under_review" | "resolved" | "rejected" | "closed",
    });
  };

  if (isLoading) return <DashboardLayout role="admin"><LoadingSkeleton /></DashboardLayout>;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Feedback & Complaints</h1>
          <p className="text-muted-foreground">Manage student feedback and resolve complaints</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Feedback</CardTitle>
            <CardDescription>View and respond to student feedback ({filteredFeedback.length} items)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No feedback found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getStudentName(feedback.student_id)}</p>
                          <p className="text-sm text-muted-foreground">{getStudentEmail(feedback.student_id)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={feedback.category === "complaint" ? "destructive" : "secondary"}>
                          {feedback.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{feedback.subject}</TableCell>
                      <TableCell>{getStatusBadge(feedback.status || "pending")}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {feedback.created_at ? format(new Date(feedback.created_at), "MMM d, yyyy HH:mm") : "-"}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedFeedback(feedback)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Feedback Details</DialogTitle>
                              <DialogDescription>
                                View feedback details and respond
                              </DialogDescription>
                            </DialogHeader>
                            {selectedFeedback && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">Student</p>
                                    <p className="text-sm text-muted-foreground">{getStudentName(selectedFeedback.student_id)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Type</p>
                                    <Badge variant={selectedFeedback.category === "complaint" ? "destructive" : "secondary"}>
                                      {selectedFeedback.category}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Status</p>
                                    {getStatusBadge(selectedFeedback.status || "pending")}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Submitted</p>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedFeedback.created_at ? format(new Date(selectedFeedback.created_at), "MMM d, yyyy HH:mm") : "-"}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">Subject</p>
                                  <p className="text-sm text-muted-foreground">{selectedFeedback.subject}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-1">Message</p>
                                  <p className="text-sm text-muted-foreground">{selectedFeedback.description}</p>
                                </div>
                                {selectedFeedback.admin_response && (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Response</p>
                                    <p className="text-sm text-muted-foreground">{selectedFeedback.admin_response}</p>
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium mb-2">Update Status</p>
                                  <Select
                                    defaultValue={selectedFeedback.status || "pending"}
                                    onValueChange={(value) => handleUpdateStatus(selectedFeedback.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="under_review">Under Review</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-2">Add Response</p>
                                  <Textarea
                                    placeholder="Type your response here..."
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
                                Close
                              </Button>
                              <Button onClick={handleSubmitResponse}>Submit Response</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Feedback;
