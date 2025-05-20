import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJob } from "../hooks/use-job";
import { FaSpinner, FaSearch, FaGlobe, FaRedo } from "react-icons/fa";
import JobDescription from "./JobDescription";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import JobInput from "./input/JobInput";
import type { JobPosting } from "@/components/job/store/use-job-store";
import { getJobSiteIcon } from "@/components/shared/icons";

const JobUrlFetcher: React.FC = () => {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<JobPosting | null>(null);
  const [progress, setProgress] = useState(0);
  const { processJobUrl, isProcessingUrl } = useJob();

  // Simulate progress during fetching
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isProcessingUrl) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 4;
        });
      }, 150);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessingUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    const loadingToast = toast.loading("Fetching job details...");

    processJobUrl(
      { url },
      {
        onSuccess: (response) => {
          setJob(response);
          toast.dismiss(loadingToast);
          toast.success("Job details fetched successfully!");
        },
        onError: (error) => {
          toast.dismiss(loadingToast);
          toast.error(`Failed to fetch job details: ${error.message}`);
        },
      }
    );
  };

  const resetForm = () => {
    setJob(null);
    setUrl("");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div
      className={`w-full ${
        !job ? "flex flex-col items-center justify-center min-h-[70vh]" : ""
      }`}
    >
      {!job ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-xl"
        >
          <JobInput
            onSubmit={handleSubmit}
            url={url}
            setUrl={setUrl}
            isProcessingUrl={isProcessingUrl}
            progress={progress}
          />
        </motion.div>
      ) : (
        <div className="space-y-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-md">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {url ? (
                        getJobSiteIcon(url)
                      ) : (
                        <FaGlobe className="h-4 w-4" />
                      )}
                    </div>
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter job posting URL"
                      disabled={isProcessingUrl}
                      className="pl-9"
                    />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={resetForm}
                          disabled={isProcessingUrl}
                        >
                          <FaRedo className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Start new analysis</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button type="submit" disabled={!url || isProcessingUrl}>
                    {isProcessingUrl ? (
                      <>
                        <FaSpinner className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Fetching
                      </>
                    ) : (
                      <>
                        <FaSearch className="mr-2 h-4 w-4" /> Fetch Job
                      </>
                    )}
                  </Button>
                </form>

                {isProcessingUrl && (
                  <div className="mt-2">
                    <Progress value={progress} className="h-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <JobDescription jobDescription={job} />
        </div>
      )}
    </div>
  );
};

export default JobUrlFetcher;
