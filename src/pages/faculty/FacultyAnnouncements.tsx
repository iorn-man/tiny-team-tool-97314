import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const FacultyAnnouncements = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Mock announcements
  const announcements = [
    {
      id: 1,
      title: "Mid-term Exam Schedule",
      content: "The mid-term exam for CS101 will be held on January 20th at 10:00 AM in Room 301.",
      course: "CS101 - Introduction to Programming",
      postedAt: "2025-01-10",
      priority: "high",
    },
    {
      id: 2,
      title: "Assignment Submission Reminder",
      content: "Please submit your Data Structures assignment by January 15th.",
      course: "CS201 - Data Structures",
      postedAt: "2025-01-08",
      priority: "medium",
    },
  ];

  const handleAddAnnouncement = () => {
    toast({
      title: "Announcement Created",
      description: "Your announcement has been posted successfully.",
    });
    setIsAddOpen(false);
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Create and manage course announcements</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>Post a new announcement for your students</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs101">CS101 - Introduction to Programming</SelectItem>
                      <SelectItem value="cs201">CS201 - Data Structures</SelectItem>
                      <SelectItem value="cs301">CS301 - Database Systems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input placeholder="Enter announcement title" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea placeholder="Enter announcement content" rows={6} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAnnouncement}>Post Announcement</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Announcements</CardTitle>
            <CardDescription>View and manage your course announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <CardDescription>{announcement.course}</CardDescription>
                      </div>
                      {getPriorityBadge(announcement.priority)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{announcement.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Posted on {announcement.postedAt}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {announcements.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No announcements posted yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacultyAnnouncements;
