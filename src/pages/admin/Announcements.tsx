import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Announcements = () => {
  const { toast } = useToast();

  const [announcements, setAnnouncements] = useState([
    {
      id: "A001",
      title: "Mid-term Examination Schedule",
      content: "The mid-term examinations will be conducted from November 15-20, 2024. Students are advised to check the detailed schedule on the notice board.",
      targetAudience: "All Students",
      priority: "High",
      createdBy: "Admin",
      createdAt: "2024-11-01",
    },
    {
      id: "A002",
      title: "Holiday Notice",
      content: "The institute will remain closed on November 10, 2024 on account of a public holiday.",
      targetAudience: "Everyone",
      priority: "Medium",
      createdBy: "Admin",
      createdAt: "2024-10-28",
    },
    {
      id: "A003",
      title: "Workshop on AI and Machine Learning",
      content: "A two-day workshop on AI and ML will be conducted on November 12-13, 2024. Interested students can register at the CS department office.",
      targetAudience: "CS Students",
      priority: "Medium",
      createdBy: "Admin",
      createdAt: "2024-10-25",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "Everyone",
    priority: "Medium",
  });

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) =>
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [announcements, searchQuery]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newAnnouncement = {
      id: `A${String(announcements.length + 1).padStart(3, '0')}`,
      ...formData,
      createdBy: "Admin",
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setFormData({ title: "", content: "", targetAudience: "Everyone", priority: "Medium" });
    setAddDialogOpen(false);

    toast({
      title: "Announcement Created",
      description: "Your announcement has been published successfully",
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setAnnouncements(announcements.map(a =>
      a.id === selectedAnnouncement.id
        ? { ...a, ...formData }
        : a
    ));

    setEditDialogOpen(false);
    setSelectedAnnouncement(null);

    toast({
      title: "Announcement Updated",
      description: "The announcement has been updated successfully",
    });
  };

  const handleDelete = () => {
    setAnnouncements(announcements.filter(a => a.id !== selectedAnnouncement.id));
    setDeleteDialogOpen(false);
    setSelectedAnnouncement(null);

    toast({
      title: "Announcement Deleted",
      description: "The announcement has been removed",
      variant: "destructive",
    });
  };

  const openEditDialog = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      targetAudience: announcement.targetAudience,
      priority: announcement.priority,
    });
    setEditDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "default";
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Create and manage institute-wide announcements</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
          {filteredAnnouncements.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No announcements found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{announcement.title}</CardTitle>
                        <Badge variant={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                        <Badge variant="outline">{announcement.targetAudience}</Badge>
                      </div>
                      <CardDescription>
                        Posted by {announcement.createdBy} on {announcement.createdAt}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{announcement.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-background max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new announcement
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter announcement content"
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                >
                  <SelectTrigger id="audience" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="Everyone">Everyone</SelectItem>
                    <SelectItem value="All Students">All Students</SelectItem>
                    <SelectItem value="All Faculty">All Faculty</SelectItem>
                    <SelectItem value="CS Students">CS Students</SelectItem>
                    <SelectItem value="IT Students">IT Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Publish Announcement</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-background max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Update announcement details
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-audience">Target Audience</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                >
                  <SelectTrigger id="edit-audience" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="Everyone">Everyone</SelectItem>
                    <SelectItem value="All Students">All Students</SelectItem>
                    <SelectItem value="All Faculty">All Faculty</SelectItem>
                    <SelectItem value="CS Students">CS Students</SelectItem>
                    <SelectItem value="IT Students">IT Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="edit-priority" className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedAnnouncement?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Announcements;
