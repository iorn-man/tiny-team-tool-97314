import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const StudentFeedback = () => {
  const [feedbackType, setFeedbackType] = useState("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Mock submitted feedback
  const submittedFeedback = [
    {
      id: 1,
      type: "Complaint",
      subject: "Classroom facility issue",
      message: "The air conditioning in Room 101 is not working properly.",
      status: "in_progress",
      submittedAt: "2025-01-10",
      response: null,
    },
    {
      id: 2,
      type: "Feedback",
      subject: "Course suggestion",
      message: "Would like to see more courses on machine learning.",
      status: "resolved",
      submittedAt: "2025-01-05",
      response: "Thank you for your feedback. We will consider adding ML courses next semester.",
    },
  ];

  const handleSubmit = () => {
    if (!subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Feedback Submitted",
      description: "Your feedback has been submitted successfully.",
    });
    setSubject("");
    setMessage("");
  };

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

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Feedback & Complaints</h1>
          <p className="text-muted-foreground">Share your feedback or report issues</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit Feedback</CardTitle>
            <CardDescription>Help us improve by sharing your thoughts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Describe your feedback or complaint in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Submit Feedback
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Feedback</CardTitle>
            <CardDescription>Track your submitted feedback and responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submittedFeedback.map((feedback) => (
                <Card key={feedback.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{feedback.subject}</CardTitle>
                          <Badge variant={feedback.type === "Complaint" ? "destructive" : "secondary"}>
                            {feedback.type}
                          </Badge>
                        </div>
                        <CardDescription>Submitted on {feedback.submittedAt}</CardDescription>
                      </div>
                      {getStatusBadge(feedback.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Your Message:</p>
                      <p className="text-sm text-muted-foreground">{feedback.message}</p>
                    </div>
                    {feedback.response && (
                      <div className="pt-3 border-t">
                        <p className="text-sm font-medium mb-1">Response:</p>
                        <p className="text-sm text-muted-foreground">{feedback.response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {submittedFeedback.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No feedback submitted yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentFeedback;
