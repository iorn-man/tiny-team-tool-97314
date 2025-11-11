import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Megaphone, Calendar, User } from "lucide-react";
import { useState } from "react";

const StudentAnnouncements = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");

  // Mock announcements
  const announcements = [
    {
      id: 1,
      title: "Mid-term Exam Schedule",
      content: "The mid-term exam for CS101 will be held on January 20th at 10:00 AM in Room 301. Please arrive 15 minutes early.",
      course: "CS101 - Introduction to Programming",
      instructor: "Dr. John Smith",
      postedAt: "2025-01-10",
      priority: "high",
    },
    {
      id: 2,
      title: "Assignment Submission Reminder",
      content: "Please submit your Data Structures assignment by January 15th. Late submissions will incur a penalty.",
      course: "CS201 - Data Structures",
      instructor: "Prof. Sarah Johnson",
      postedAt: "2025-01-08",
      priority: "medium",
    },
    {
      id: 3,
      title: "Office Hours Change",
      content: "This week's office hours have been moved to Thursday 3-5 PM instead of Friday.",
      course: "MATH201 - Calculus II",
      instructor: "Dr. Michael Brown",
      postedAt: "2025-01-07",
      priority: "low",
    },
    {
      id: 4,
      title: "Guest Lecture Announcement",
      content: "We are pleased to announce a guest lecture by Dr. Emily Chen on 'Advanced Algorithms' on January 25th.",
      course: "CS101 - Introduction to Programming",
      instructor: "Dr. John Smith",
      postedAt: "2025-01-05",
      priority: "medium",
    },
  ];

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === "all" || announcement.course.includes(courseFilter);
    return matchesSearch && matchesCourse;
  });

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Stay updated with course announcements</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Announcements</CardTitle>
            <CardDescription>Latest updates from your instructors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="CS101">CS101 - Introduction to Programming</SelectItem>
                  <SelectItem value="CS201">CS201 - Data Structures</SelectItem>
                  <SelectItem value="MATH201">MATH201 - Calculus II</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredAnnouncements.map((announcement) => (
                <Card key={announcement.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                          {getPriorityBadge(announcement.priority)}
                        </div>
                        <CardDescription>{announcement.course}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{announcement.instructor}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Posted on {announcement.postedAt}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAnnouncements.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No announcements found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentAnnouncements;
