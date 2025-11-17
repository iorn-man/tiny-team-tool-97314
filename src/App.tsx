import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfileSettings from "./pages/ProfileSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Students from "./pages/admin/Students";
import Faculty from "./pages/admin/Faculty";
import Courses from "./pages/admin/Courses";
import Enrollments from "./pages/admin/Enrollments";
import Announcements from "./pages/admin/Announcements";
import Feedback from "./pages/admin/Feedback";
import Reports from "./pages/admin/Reports";
import AuditLogs from "./pages/admin/AuditLogs";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import MyCourses from "./pages/faculty/MyCourses";
import Attendance from "./pages/faculty/Attendance";
import Grades from "./pages/faculty/Grades";
import FacultyAnnouncements from "./pages/faculty/FacultyAnnouncements";
import FacultyReports from "./pages/faculty/FacultyReports";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentMyCourses from "./pages/student/MyCourses";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentGrades from "./pages/student/StudentGrades";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import StudentFeedback from "./pages/student/StudentFeedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Shared Profile Route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Students />
              </ProtectedRoute>
            } />
            <Route path="/admin/faculty" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Faculty />
              </ProtectedRoute>
            } />
            <Route path="/admin/courses" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Courses />
              </ProtectedRoute>
            } />
            <Route path="/admin/enrollments" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Enrollments />
              </ProtectedRoute>
            } />
            <Route path="/admin/announcements" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Announcements />
              </ProtectedRoute>
            } />
            <Route path="/admin/feedback" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Feedback />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit-logs" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AuditLogs />
              </ProtectedRoute>
            } />
            
            {/* Faculty Routes */}
            <Route path="/faculty/dashboard" element={
              <ProtectedRoute allowedRoles={["faculty"]}>
                <FacultyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/faculty/courses" element={
              <ProtectedRoute allowedRoles={["faculty"]}>
                <MyCourses />
              </ProtectedRoute>
            } />
            <Route path="/faculty/attendance" element={
              <ProtectedRoute allowedRoles={["faculty"]}>
                <Attendance />
              </ProtectedRoute>
            } />
            <Route path="/faculty/grades" element={
              <ProtectedRoute allowedRoles={["faculty"]}>
                <Grades />
              </ProtectedRoute>
            } />
            <Route path="/faculty/announcements" element={
              <ProtectedRoute allowedRoles={["faculty"]}>
                <FacultyAnnouncements />
              </ProtectedRoute>
            } />
            <Route path="/faculty/reports" element={
              <ProtectedRoute allowedRoles={["faculty"]}>
                <FacultyReports />
              </ProtectedRoute>
            } />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/courses" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentMyCourses />
              </ProtectedRoute>
            } />
            <Route path="/student/attendance" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAttendance />
              </ProtectedRoute>
            } />
            <Route path="/student/grades" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentGrades />
              </ProtectedRoute>
            } />
            <Route path="/student/announcements" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAnnouncements />
              </ProtectedRoute>
            } />
            <Route path="/student/feedback" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentFeedback />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
