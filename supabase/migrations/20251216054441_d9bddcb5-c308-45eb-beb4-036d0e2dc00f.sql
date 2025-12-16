-- Create audit log trigger function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (action, table_name, record_id, user_id, new_values)
    VALUES ('INSERT', TG_TABLE_NAME, NEW.id::text, auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (action, table_name, record_id, user_id, old_values, new_values)
    VALUES ('UPDATE', TG_TABLE_NAME, NEW.id::text, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (action, table_name, record_id, user_id, old_values)
    VALUES ('DELETE', TG_TABLE_NAME, OLD.id::text, auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for students table
DROP TRIGGER IF EXISTS audit_students_trigger ON public.students;
CREATE TRIGGER audit_students_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for faculties table
DROP TRIGGER IF EXISTS audit_faculties_trigger ON public.faculties;
CREATE TRIGGER audit_faculties_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.faculties
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for courses table
DROP TRIGGER IF EXISTS audit_courses_trigger ON public.courses;
CREATE TRIGGER audit_courses_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for enrollments table
DROP TRIGGER IF EXISTS audit_enrollments_trigger ON public.enrollments;
CREATE TRIGGER audit_enrollments_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for announcements table
DROP TRIGGER IF EXISTS audit_announcements_trigger ON public.announcements;
CREATE TRIGGER audit_announcements_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for feedback table
DROP TRIGGER IF EXISTS audit_feedback_trigger ON public.feedback;
CREATE TRIGGER audit_feedback_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.feedback
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for grades table
DROP TRIGGER IF EXISTS audit_grades_trigger ON public.grades;
CREATE TRIGGER audit_grades_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.grades
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for attendance table
DROP TRIGGER IF EXISTS audit_attendance_trigger ON public.attendance;
CREATE TRIGGER audit_attendance_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for placement_companies table
DROP TRIGGER IF EXISTS audit_placement_companies_trigger ON public.placement_companies;
CREATE TRIGGER audit_placement_companies_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.placement_companies
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Create triggers for student_placements table
DROP TRIGGER IF EXISTS audit_student_placements_trigger ON public.student_placements;
CREATE TRIGGER audit_student_placements_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.student_placements
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Add INSERT policy for audit_logs so triggers can insert
CREATE POLICY "Triggers can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);