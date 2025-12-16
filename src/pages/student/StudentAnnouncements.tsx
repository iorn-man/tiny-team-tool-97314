import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Megaphone, Calendar } from "lucide-react";
import { useState } from "react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { format } from "date-fns";

const StudentAnnouncements = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { announcements, isLoading } = useAnnouncements();

  const getPriorityBadge = (priority: string | null) => {
    const variants: Record<string, any> = {
      high: "destructive",
      normal: "default",
      low: "secondary",
    };
    return <Badge variant={variants[priority || "normal"]}>{priority || "normal"}</Badge>;
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>
            ) : (
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
                          <CardDescription>
                            Target: {announcement.target_audience?.join(", ") || "All"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Posted on {format(new Date(announcement.created_at), "MMM d, yyyy")}</span>
                        </div>
                        {announcement.expires_at && (
                          <div className="flex items-center gap-1">
                            <span>Expires: {format(new Date(announcement.expires_at), "MMM d, yyyy")}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredAnnouncements.length === 0 && (
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
