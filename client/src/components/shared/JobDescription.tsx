import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  FileText,
  FileUp,
  Globe,
  Loader2,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/shared/FileUploader";
import { LinkInput } from "@/components/shared/LinkInput";
import { cn } from "@/lib/utils";
import { JobDescription as JobDescriptionType } from "@/types/resume";

interface JobDescriptionProps {
  jobInputMethod: "text" | "file" | "link";
  setJobInputMethod: (method: "text" | "file" | "link") => void;
  jobDescription: JobDescriptionType | null;
  isProcessingJob: boolean;
  handleJobTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleJobTextSubmit: () => void;
  handleJobFileSubmit: (files: File[]) => void;
  handleJobLinkSubmit: (link: string) => void;
  setJobDescription: (jobDescription: JobDescriptionType | null) => void;
  jobText: string;
  setJobText: (text: string) => void;
}

const JobDescription: React.FC<JobDescriptionProps> = ({
  jobInputMethod,
  setJobInputMethod,
  jobDescription,
  isProcessingJob,
  handleJobTextChange,
  handleJobTextSubmit,
  handleJobFileSubmit,
  handleJobLinkSubmit,
  setJobDescription,
  jobText,
  setJobText,
}) => {
  const renderJobInput = () => {
    switch (jobInputMethod) {
      case "text":
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Paste the job description here..."
              className="min-h-[300px] resize-none"
              value={jobText}
              onChange={handleJobTextChange}
              disabled={isProcessingJob || jobDescription?.status === "ready"}
            />

            <div className="flex justify-between">
              <Button
                onClick={handleJobTextSubmit}
                disabled={
                  !jobText.trim() ||
                  isProcessingJob ||
                  jobDescription?.status === "ready"
                }
              >
                {isProcessingJob ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : jobDescription?.status === "ready" ? (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Processed
                  </>
                ) : (
                  "Process Job Description"
                )}
              </Button>

              {jobDescription?.status === "ready" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setJobDescription(null);
                    setJobText("");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        );

      case "file":
        return (
          <div className="space-y-4">
            <FileUploader
              multiple={false}
              accept=".pdf,.doc,.docx"
              maxSize={5}
              onFileSelect={handleJobFileSubmit}
              onLinkAdd={() => {}} // Not used in this mode
              className={cn(
                jobDescription?.status === "ready"
                  ? "opacity-50 pointer-events-none"
                  : ""
              )}
            />

            {isProcessingJob && (
              <div className="flex items-center justify-center p-4">
                <Loader2 size={24} className="animate-spin text-primary mr-2" />
                <span>Processing job description from file...</span>
              </div>
            )}

            {jobDescription?.status === "ready" && (
              <Button
                variant="outline"
                onClick={() => {
                  setJobDescription(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        );

      case "link":
        return (
          <div className="space-y-4">
            <LinkInput
              onLinkSubmit={handleJobLinkSubmit}
              placeholder="https://example.com/job-posting"
              label="Job Posting URL"
            />

            {isProcessingJob && (
              <div className="flex items-center justify-center p-4">
                <Loader2 size={24} className="animate-spin text-primary mr-2" />
                <span>Processing job description from URL...</span>
              </div>
            )}

            {jobDescription?.status === "ready" && (
              <Button
                variant="outline"
                onClick={() => {
                  setJobDescription(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        );
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Job Description</h2>

        <div className="flex bg-muted rounded-md p-1">
          <Button
            variant={jobInputMethod === "text" ? "secondary" : "ghost"}
            size="sm"
            className="gap-1"
            onClick={() => setJobInputMethod("text")}
            disabled={jobDescription?.status === "ready" || isProcessingJob}
          >
            <FileText size={14} />
            <span className="hidden sm:inline">Text</span>
          </Button>
          <Button
            variant={jobInputMethod === "file" ? "secondary" : "ghost"}
            size="sm"
            className="gap-1"
            onClick={() => setJobInputMethod("file")}
            disabled={jobDescription?.status === "ready" || isProcessingJob}
          >
            <FileUp size={14} />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <Button
            variant={jobInputMethod === "link" ? "secondary" : "ghost"}
            size="sm"
            className="gap-1"
            onClick={() => setJobInputMethod("link")}
            disabled={jobDescription?.status === "ready" || isProcessingJob}
          >
            <Globe size={14} />
            <span className="hidden sm:inline">URL</span>
          </Button>
        </div>
      </div>

      {renderJobInput()}

      {jobDescription?.status === "ready" && (
        <AnimatedCard delay={0.3} className="border p-4 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">{jobDescription.title}</h3>
              {jobDescription.company && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                  <FileText size={14} />
                  <span>{jobDescription.company}</span>
                  {jobDescription.location && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span>{jobDescription.location}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <Badge variant="secondary">
              {jobDescription.type || "Full-time"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm flex items-center gap-2">
                <CheckCircle size={14} className="text-primary" />
                Key Requirements
              </h4>
              <ul className="mt-2 space-y-1">
                {jobDescription.requirements.slice(0, 4).map((req, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * idx }}
                    className="text-sm flex gap-2"
                  >
                    <span className="text-primary">•</span>
                    <span>{req}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-sm flex items-center gap-2">
                <CheckCircle size={14} className="text-primary" />
                Responsibilities
              </h4>
              <ul className="mt-2 space-y-1">
                {jobDescription.responsibilities
                  .slice(0, 3)
                  .map((resp, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * idx }}
                      className="text-sm flex gap-2"
                    >
                      <span className="text-primary">•</span>
                      <span>{resp}</span>
                    </motion.li>
                  ))}
              </ul>
            </div>
          </div>
        </AnimatedCard>
      )}
    </motion.div>
  );
};

export default JobDescription;
