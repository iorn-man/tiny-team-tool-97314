import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Bell, Loader2 } from "lucide-react";
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
import { useAnnouncements, Announcement } from "@/hooks/useAnnouncements";
import { LoadingSkeleton } from "@/components/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

const Announcements = () => {
  const { announcements, isLoading, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();

  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_audience: ["all"] as string[],
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    published: true,
    expires_at: "",
  });

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) =>
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [announcements, searchQuery]);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      target_audience: ["all"],
      priority: "normal",
      published: true,
      expires_at: "",
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createAnnouncement.mutateAsync({
      title: formData.title,
      content: formData.content,
      target_audience: formData.target_audience,
      priority: formData.priority,
      published: formData.published,
      expires_at: formData.expires_at || undefined,
    });

    resetForm();
    setAddDialogOpen(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;

    await updateAnnouncement.mutateAsync({
      id: selectedAnnouncement.id,
      title: formData.title,
      content: formData.content,
      target_audience: formData.target_audience,
      priority: formData.priority,
      published: formData.published,
      expires_at: formData.expires_at || undefined,
    });

    setEditDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    await deleteAnnouncement.mutateAsync(selectedAnnouncement.id);
    setDeleteDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  const openEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target_audience: announcement.target_audience,
      priority: announcement.priority,
      published: announcement.published,
      expires_at: announcement.expires_at || "",
    });
    setEditDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "destructive";
      case "normal": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getAudienceLabel = (audience: string[]) => {
    if (audience.includes("all")) return "Everyone";
    return audience.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(", ");
  };

  const handleAudienceChange = (value: string, checked: boolean) => {
    if (value === "all" && checked) {
      setFormData({ ...formData, target_audience: ["all"] });
    } else if (value === "all" && !checked) {
      setFormData({ ...formData, target_audience: [] });
    } else {
      let newAudience = formData.target_audience.filter(a => a !== "all");
      if (checked) {
        newAudience.push(value);
      } else {
        newAudience = newAudience.filter(a => a !== value);
      }
      setFormData({ ...formData, target_audience: newAudience.length > 0 ? newAudience : ["all"] });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Create and manage institute-wide announcements</p>
          </div>
          <Button onClick={() => { resetForm(); setAddDialogOpen(true); }}>
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
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle className="text-xl">{announcement.title}</CardTitle>
                        <Badge variant={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                        <Badge variant="outline">{getAudienceLabel(announcement.target_audience)}</Badge>
                        {!announcement.published && (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                      <CardDescription>
                        Posted on {format(new Date(announcement.created_at || ""), "PPP")}
                        {announcement.expires_at && (
                          <> · Expires on {format(new Date(announcement.expires_at), "PPP")}</>
                        )}
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
                <Label>Target Audience</Label>
                <div className="space-y-2 p-3 border rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all"
                      checked={formData.target_audience.includes("all")}
                      onCheckedChange={(checked) => handleAudienceChange("all", !!checked)}
                    />
                    <label htmlFor="all" className="text-sm">Everyone</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="students"
                      checked={formData.target_audience.includes("students")}
                      onCheckedChange={(checked) => handleAudienceChange("students", !!checked)}
                    />
                    <label htmlFor="students" className="text-sm">Students</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="faculty"
                      checked={formData.target_audience.includes("faculty")}
                      onCheckedChange={(checked) => handleAudienceChange("faculty", !!checked)}
                    />
                    <label htmlFor="faculty" className="text-sm">Faculty</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="admin"
                      checked={formData.target_audience.includes("admin")}
                      onCheckedChange={(checked) => handleAudienceChange("admin", !!checked)}
                    />
                    <label htmlFor="admin" className="text-sm">Admin</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "normal" | "high" | "urgent") => 
                      setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger id="priority" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expires At (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: !!checked })}
              />
              <label htmlFor="published" className="text-sm">Publish immediately</label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAnnouncement.isPending}>
                {createAnnouncement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Announcement
              </Button>
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
                <Label>Target Audience</Label>
                <div className="space-y-2 p-3 border rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-all"
                      checked={formData.target_audience.includes("all")}
                      onCheckedChange={(checked) => handleAudienceChange("all", !!checked)}
                    />
                    <label htmlFor="edit-all" className="text-sm">Everyone</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-students"
                      checked={formData.target_audience.includes("students")}
                      onCheckedChange={(checked) => handleAudienceChange("students", !!checked)}
                    />
                    <label htmlFor="edit-students" className="text-sm">Students</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-faculty"
                      checked={formData.target_audience.includes("faculty")}
                      onCheckedChange={(checked) => handleAudienceChange("faculty", !!checked)}
                    />
                    <label htmlFor="edit-faculty" className="text-sm">Faculty</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-admin"
                      checked={formData.target_audience.includes("admin")}
                      onCheckedChange={(checked) => handleAudienceChange("admin", !!checked)}
                    />
                    <label htmlFor="edit-admin" className="text-sm">Admin</label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "normal" | "high" | "urgent") => 
                      setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger id="edit-priority" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-expires_at">Expires At (Optional)</Label>
                  <Input
                    id="edit-expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: !!checked })}
              />
              <label htmlFor="edit-published" className="text-sm">Published</label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateAnnouncement.isPending}>
                {updateAnnouncement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
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
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteAnnouncement.isPending}
            >
              {deleteAnnouncement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Announcements;
