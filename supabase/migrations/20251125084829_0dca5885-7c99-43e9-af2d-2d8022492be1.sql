-- Enable realtime for placement tables
ALTER TABLE public.placement_companies REPLICA IDENTITY FULL;
ALTER TABLE public.placement_schedule REPLICA IDENTITY FULL;
ALTER TABLE public.student_placements REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.placement_companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.placement_schedule;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_placements;