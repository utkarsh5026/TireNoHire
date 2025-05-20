import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJob, JobPosting } from "../hooks/use-job";
import {
  FaSpinner,
  FaSearch,
  FaGlobe,
  FaArrowRight,
  FaMagic,
  FaExternalLinkAlt,
  FaHistory,
  FaRedo,
} from "react-icons/fa";
import JobDescription from "./JobDescription";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const JobUrlFetcher: React.FC = () => {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<JobPosting | null>(null);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [showRecentUrls, setShowRecentUrls] = useState(false);
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

  const addToRecentUrls = (newUrl: string) => {
    setRecentUrls((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((item) => item !== newUrl);
      // Add to beginning and limit to 5 recent URLs
      return [newUrl, ...filtered].slice(0, 5);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    addToRecentUrls(url);

    // Show a loading toast
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

  const selectRecentUrl = (selectedUrl: string) => {
    setUrl(selectedUrl);
    setShowRecentUrls(false);
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
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
          <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
            <CardHeader className="pb-4">
              <motion.div variants={itemVariants}>
                <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  Job Analyzer
                </CardTitle>
                <CardDescription className="text-center mt-2">
                  Enter a job posting URL to analyze requirements and match with
                  your resume
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={itemVariants}
              >
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <FaGlobe className="h-5 w-5" />
                  </div>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste job posting URL here"
                    disabled={isProcessingUrl}
                    className="pl-10 py-6 text-base border-2 focus-visible:ring-primary/50"
                    onFocus={() => setShowRecentUrls(recentUrls.length > 0)}
                    onBlur={() =>
                      setTimeout(() => setShowRecentUrls(false), 200)
                    }
                  />
                  {url && !isProcessingUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUrl("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  )}

                  {/* Recent URLs dropdown */}
                  <AnimatePresence>
                    {showRecentUrls && recentUrls.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-1 bg-popover border rounded-md shadow-md z-10"
                      >
                        <div className="p-2 text-xs font-medium text-muted-foreground flex items-center">
                          <FaHistory size={12} className="mr-1" />
                          Recent URLs
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {recentUrls.map((recentUrl, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-muted cursor-pointer text-sm flex items-center gap-2 truncate"
                              onClick={() => selectRecentUrl(recentUrl)}
                            >
                              <FaExternalLinkAlt
                                size={10}
                                className="text-muted-foreground flex-shrink-0"
                              />
                              <span className="truncate">{recentUrl}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isProcessingUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground animate-pulse">
                      Fetching job details from URL...
                    </p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={!url || isProcessingUrl}
                  className="w-full py-6 text-base font-medium bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
                  size="lg"
                >
                  {isProcessingUrl ? (
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="mr-2 h-5 w-5 animate-spin" />
                      <span>Fetching Job Details</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative group">
                      <FaSearch className="h-5 w-5 transition-transform group-hover:scale-110" />
                      <span>Analyze Job Posting</span>
                      <FaArrowRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  )}
                </Button>

                <div className="flex justify-center">
                  <div className="inline-flex gap-2 flex-wrap justify-center">
                    <Badge variant="outline" className="bg-primary/5">
                      LinkedIn
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5">
                      Indeed
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5">
                      Glassdoor
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5">
                      ZipRecruiter
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5">
                      Company Sites
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full text-primary flex-shrink-0 mt-1">
                      <FaMagic size={14} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Our AI analyzes the job posting to extract key
                      requirements, responsibilities, and qualifications. We'll
                      match these with your resume to give you a detailed
                      compatibility report.
                    </p>
                  </div>
                </div>
              </motion.form>
            </CardContent>
          </Card>
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
                      <FaGlobe className="h-4 w-4" />
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
