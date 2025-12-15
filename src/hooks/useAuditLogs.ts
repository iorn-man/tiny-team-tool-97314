import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  user_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const useAuditLogs = () => {
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AuditLog[];
    },
  });

  return {
    logs,
    isLoading,
    refetch,
  };
};
