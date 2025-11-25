-- Create placement_companies table
CREATE TABLE public.placement_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  website TEXT,
  min_package NUMERIC NOT NULL,
  max_package NUMERIC NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create placement_schedule table
CREATE TABLE public.placement_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.placement_companies(id) ON DELETE CASCADE,
  drive_date DATE NOT NULL,
  drive_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  eligible_branches TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  min_cgpa NUMERIC NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_placements table
CREATE TABLE public.student_placements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.placement_companies(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  package_offered NUMERIC NOT NULL,
  placement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'placed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.placement_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_placements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for placement_companies
CREATE POLICY "Admins can manage placement companies"
ON public.placement_companies
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Everyone can view active companies"
ON public.placement_companies
FOR SELECT
USING (status = 'active' OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for placement_schedule
CREATE POLICY "Admins can manage placement schedule"
ON public.placement_schedule
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students and faculty can view placement schedule"
ON public.placement_schedule
FOR SELECT
USING (
  has_role(auth.uid(), 'student'::app_role) OR 
  has_role(auth.uid(), 'faculty'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- RLS Policies for student_placements
CREATE POLICY "Admins can manage student placements"
ON public.student_placements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students can view their own placement"
ON public.student_placements
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'faculty'::app_role)
);

-- Create indexes for better performance
CREATE INDEX idx_placement_companies_status ON public.placement_companies(status);
CREATE INDEX idx_placement_schedule_date ON public.placement_schedule(drive_date);
CREATE INDEX idx_student_placements_student ON public.student_placements(student_id);
CREATE INDEX idx_student_placements_company ON public.student_placements(company_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_placement_companies_updated_at
BEFORE UPDATE ON public.placement_companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_placement_schedule_updated_at
BEFORE UPDATE ON public.placement_schedule
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_placements_updated_at
BEFORE UPDATE ON public.student_placements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();