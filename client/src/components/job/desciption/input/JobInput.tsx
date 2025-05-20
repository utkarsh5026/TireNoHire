import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaSpinner,
  FaSearch,
  FaArrowRight,
  FaMagic,
  FaHistory,
  FaGlobe,
} from "react-icons/fa";
import { useJobStore } from "@/components/job/store/use-job-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getJobSiteIcon } from "@/components/shared/icons";

interface JobInputProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  url: string;
  setUrl: (url: string) => void;
  isProcessingUrl: boolean;
  progress: number;
}

const JobInput = ({
  onSubmit,
  url,
  setUrl,
  isProcessingUrl,
  progress,
}: JobInputProps) => {
  const recentUrls = useJobStore((state) => state.recentUrls);
  const [showRecentUrls, setShowRecentUrls] = useState(false);

  const selectRecentUrl = (selectedUrl: string) => {
    setUrl(selectedUrl);
    setShowRecentUrls(false);
  };

  return (
    <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
      <CardHeader className="pb-4">
        <div>
          <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Job Analyzer
          </CardTitle>
          <CardDescription className="text-center mt-2">
            Enter a job posting URL to analyze requirements and match with your
            resume
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {url ? getJobSiteIcon(url) : <FaGlobe className="h-5 w-5" />}
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste job posting URL here"
              disabled={isProcessingUrl}
              className="pl-10 py-6 text-base border-2 focus-visible:ring-primary/50"
              onFocus={() => setShowRecentUrls(recentUrls.length > 0)}
              onBlur={() => setTimeout(() => setShowRecentUrls(false), 200)}
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
                    {recentUrls.map((recentUrl, index) => {
                      const icon = getJobSiteIcon(recentUrl);
                      return (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-muted cursor-pointer text-sm flex items-center gap-2 truncate"
                          onClick={() => selectRecentUrl(recentUrl)}
                        >
                          {icon}
                          <span className="truncate">{recentUrl}</span>
                        </div>
                      );
                    })}
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
              <Badge
                variant="outline"
                className="bg-primary/5 flex items-center gap-1"
              >
                {getJobSiteIcon("linkedin.com")}
                LinkedIn
              </Badge>
              <Badge
                variant="outline"
                className="bg-primary/5 flex items-center gap-1"
              >
                {getJobSiteIcon("indeed.com")}
                Indeed
              </Badge>
              <Badge
                variant="outline"
                className="bg-primary/5 flex items-center gap-1"
              >
                {getJobSiteIcon("glassdoor.com")}
                Glassdoor
              </Badge>
              <Badge
                variant="outline"
                className="bg-primary/5 flex items-center gap-1"
              >
                {getJobSiteIcon("ziprecruiter.com")}
                ZipRecruiter
              </Badge>
              <Badge
                variant="outline"
                className="bg-primary/5 flex items-center gap-1"
              >
                {getJobSiteIcon("careers.example.com")}
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
                Our AI analyzes the job posting to extract key requirements,
                responsibilities, and qualifications. We'll match these with
                your resume to give you a detailed compatibility report.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobInput;
