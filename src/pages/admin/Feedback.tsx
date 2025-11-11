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

const Feedback = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [response, setResponse] = useState("");

  // Mock feedback data
  const feedbacks = [
    {
      id: 1,
      studentName: "John Doe",
      email: "john@example.com",
      type: "Complaint",
      subject: "Classroom facility issue",
      message: "The air conditioning in Room 101 is not working properly.",
      status: "pending",
      submittedAt: "2025-01-10 10:30 AM",
    },
    {
      id: 2,
      studentName: "Jane Smith",
      email: "jane@example.com",
      type: "Feedback",
      subject: "Course suggestion",
      message: "Would like to see more courses on machine learning.",
      status: "resolved",
      submittedAt: "2025-01-09 02:15 PM",
      response: "Thank you for your feedback. We will consider adding ML courses next semester.",
    },
    {
      id: 3,
      studentName: "Mike Johnson",
      email: "mike@example.com",
      type: "Complaint",
      subject: "Cafeteria service",
      message: "Long waiting times during lunch hours.",
      status: "in_progress",
      submittedAt: "2025-01-08 11:00 AM",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      in_progress: { variant: "default", icon: MessageSquare },
      resolved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
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
    const matchesSearch = fb.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || fb.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmitResponse = () => {
    toast({
      title: "Response Submitted",
      description: "Your response has been sent to the student.",
    });
    setResponse("");
    setSelectedFeedback(null);
  };

  const handleUpdateStatus = (feedbackId: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Feedback status changed to ${newStatus.replace("_", " ")}.`,
    });
  };

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
            <CardDescription>View and respond to student feedback</CardDescription>
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
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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
                {filteredFeedback.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{feedback.studentName}</p>
                        <p className="text-sm text-muted-foreground">{feedback.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={feedback.type === "Complaint" ? "destructive" : "secondary"}>
                        {feedback.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{feedback.subject}</TableCell>
                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{feedback.submittedAt}</TableCell>
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
                                  <p className="text-sm text-muted-foreground">{selectedFeedback.studentName}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Type</p>
                                  <Badge variant={selectedFeedback.type === "Complaint" ? "destructive" : "secondary"}>
                                    {selectedFeedback.type}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Status</p>
                                  {getStatusBadge(selectedFeedback.status)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Submitted</p>
                                  <p className="text-sm text-muted-foreground">{selectedFeedback.submittedAt}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Subject</p>
                                <p className="text-sm text-muted-foreground">{selectedFeedback.subject}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Message</p>
                                <p className="text-sm text-muted-foreground">{selectedFeedback.message}</p>
                              </div>
                              {selectedFeedback.response && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Response</p>
                                  <p className="text-sm text-muted-foreground">{selectedFeedback.response}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium mb-2">Update Status</p>
                                <Select
                                  defaultValue={selectedFeedback.status}
                                  onValueChange={(value) => handleUpdateStatus(selectedFeedback.id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Feedback;
