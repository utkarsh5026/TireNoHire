import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useJob } from "../hooks/use-job";
import JobDescription from "./JobDescription";
import { toast } from "sonner";
import JobInput from "./input/JobInput";
import type { JobPosting } from "@/components/job/store/use-job-store";
import { useLocation } from "react-router-dom";
import { validateUrlRegex } from "@/utils/validate";

const JobUrlFetcher: React.FC = () => {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<JobPosting | null>(null);
  const [progress, setProgress] = useState(0);
  const { processJobUrl, isProcessingUrl } = useJob();

  const location = useLocation();

  console.log({
    pathname: location.pathname, // "/job-seeker"
    search: location.search, // "?tab=upload&step=1"
    hash: location.hash, // "#section1"
    state: location.state, // state passed via navigation
    key: location.key, // unique key for this location
  });

  const fecthFromUrl = useCallback(
    (url: string) => {
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
    },
    [processJobUrl]
  );

  useEffect(() => {
    const passedUrl = location.pathname + location.search + location.hash;
    console.log(passedUrl);
    if (passedUrl.startsWith("/job/")) {
      const cleanedUrl = passedUrl.replace("/job/", "");
      if (validateUrlRegex(cleanedUrl)) {
        fecthFromUrl(cleanedUrl);
        setUrl(cleanedUrl);
      }
    }
  }, [location.pathname, location.search, location.hash, fecthFromUrl]);

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
    fecthFromUrl(url);
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
        <div className="flex flex-col items-center justify-center w-full">
          <JobDescription jobDescription={job} />
        </div>
      )}
    </div>
  );
};

export default JobUrlFetcher;
