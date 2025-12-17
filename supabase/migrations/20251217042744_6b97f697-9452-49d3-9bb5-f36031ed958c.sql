-- Fix audit_logs table: change record_id from uuid to text to support all table ID types
ALTER TABLE public.audit_logs 
ALTER COLUMN record_id TYPE text USING record_id::text;

-- Recreate the log_audit_event function without the ::text cast (now column accepts text directly)
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;