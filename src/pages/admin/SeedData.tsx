import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SeedData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('seed-dummy-data');

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);
      toast({
        title: "Success!",
        description: "Dummy data has been seeded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to seed data",
        variant: "destructive",
      });
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Seed Test Data</h1>
          <p className="text-muted-foreground mt-2">
            Populate the database with dummy data for testing
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Seeding
            </CardTitle>
            <CardDescription>
              This will create test accounts for faculty and students, along with courses,
              enrollments, grades, and attendance records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Note:</strong> This will clear existing test data and create fresh dummy data.
                All test accounts will have simple passwords for easy testing.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSeedData}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Data...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Dummy Data
                </>
              )}
            </Button>

            {result && (
              <Card className={result.success ? "border-green-500" : "border-red-500"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {result.success ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Success!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        Error
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.success && result.credentials && (
                    <>
                      <div>
                        <h3 className="font-semibold mb-2">Faculty Accounts:</h3>
                        <div className="space-y-1 text-sm">
                          {result.credentials.faculty.map((cred: any, idx: number) => (
                            <div key={idx} className="font-mono bg-muted p-2 rounded">
                              Email: {cred.email} | Password: {cred.password}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Student Accounts:</h3>
                        <div className="space-y-1 text-sm">
                          {result.credentials.students.map((cred: any, idx: number) => (
                            <div key={idx} className="font-mono bg-muted p-2 rounded">
                              Email: {cred.email} | Password: {cred.password}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {result.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeedData;
