import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJob, JobPosting } from "../hooks/use-job";
import { Loader2, Search } from "lucide-react";
import JobDescription from "./JobDescription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const JobUrlFetcher: React.FC = () => {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<JobPosting | null>(null);
  const { processJobUrl, isProcessingUrl } = useJob();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    processJobUrl(
      { url },
      {
        onSuccess: (response) => {
          setJob(response);
        },
      }
    );
  };

  return (
    <div
      className={`w-full ${
        !job ? "flex flex-col items-center justify-center min-h-[70vh]" : ""
      }`}
    >
      {!job ? (
        <Card className="w-full max-w-xl shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Job Analyzer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste job posting URL here"
                  disabled={isProcessingUrl}
                  className="pl-10 py-6 text-base"
                />
              </div>
              <Button
                type="submit"
                disabled={!url || isProcessingUrl}
                className="py-6 text-base font-medium"
                size="lg"
              >
                {isProcessingUrl ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Fetching
                    Job Details
                  </>
                ) : (
                  "Analyze Job Posting"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 w-full">
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter job posting URL"
                  disabled={isProcessingUrl}
                  className="flex-1"
                />
                <Button type="submit" disabled={!url || isProcessingUrl}>
                  {isProcessingUrl ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching
                    </>
                  ) : (
                    "Fetch Job"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          <JobDescription jobDescription={job} />
        </div>
      )}
    </div>
  );
};

export default JobUrlFetcher;
