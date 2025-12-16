import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Feedback {
  id: string;
  category: string;
  subject: string;
  description: string;
  status: string | null;
  admin_response: string | null;
  created_at: string;
}

const StudentFeedback = () => {
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submittedFeedback, setSubmittedFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!user) return;

      // Get student record
      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!studentData) {
        setLoading(false);
        return;
      }

      setStudentId(studentData.id);

      // Get feedback
      const { data: feedbackData } = await supabase
        .from("feedback")
        .select("*")
        .eq("student_id", studentData.id)
        .order("created_at", { ascending: false });

      if (feedbackData) {
        setSubmittedFeedback(feedbackData);
      }
      setLoading(false);
    };

    fetchFeedback();
  }, [user]);

  const handleSubmit = async () => {
    if (!subject || !message) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!studentId) {
      toast({
        title: "Error",
        description: "Student record not found.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        student_id: studentId,
        category: feedbackType,
        subject: subject,
        description: message,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Feedback Submitted",
        description: "Your feedback has been submitted successfully.",
      });
      setSubject("");
      setMessage("");
      if (data) {
        setSubmittedFeedback(prev => [data, ...prev]);
      }
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      in_progress: { variant: "default", icon: MessageSquare },
      resolved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
    };
    const config = variants[status || "pending"] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {(status || "pending").replace("_", " ")}
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

            <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Feedback</CardTitle>
            <CardDescription>Track your submitted feedback and responses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading feedback...</div>
            ) : (
              <div className="space-y-4">
                {submittedFeedback.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{feedback.subject}</CardTitle>
                            <Badge variant={feedback.category === "complaint" ? "destructive" : "secondary"}>
                              {feedback.category}
                            </Badge>
                          </div>
                          <CardDescription>
                            Submitted on {format(new Date(feedback.created_at), "MMM d, yyyy")}
                          </CardDescription>
                        </div>
                        {getStatusBadge(feedback.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Your Message:</p>
                        <p className="text-sm text-muted-foreground">{feedback.description}</p>
                      </div>
                      {feedback.admin_response && (
                        <div className="pt-3 border-t">
                          <p className="text-sm font-medium mb-1">Response:</p>
                          <p className="text-sm text-muted-foreground">{feedback.admin_response}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && submittedFeedback.length === 0 && (
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
