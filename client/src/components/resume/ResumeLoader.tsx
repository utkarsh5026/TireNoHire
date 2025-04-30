import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUploader } from "../shared/FileUploader";
import { Button } from "../ui/button";
import { Plus, InfoIcon } from "lucide-react";
import { ResumeFile } from "@/types/resume";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ResumeUploaderProps {
  onResumeAdd: (resume: ResumeFile) => void;
  className?: string;
  maxResumes?: number;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onResumeAdd,
  className,
  maxResumes = 5,
}) => {
  const [showUploader, setShowUploader] = useState(false);
  const [resumeCount, setResumeCount] = useState(0);

  const handleFileSelect = (files: File[]) => {
    if (resumeCount + files.length > maxResumes) {
      toast("Maximum limit reached", {
        description: `You can upload a maximum of ${maxResumes} resumes.`,
      });
      return;
    }

    files.forEach((file) => {
      const newResume: ResumeFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: "file",
        file,
        uploadedAt: new Date(),
        status: "uploading",
      };

      onResumeAdd(newResume);

      // Simulate processing
      setTimeout(() => {
        const updatedResume = { ...newResume, status: "ready" };
        onResumeAdd(updatedResume as ResumeFile);
      }, 2000);
    });

    setResumeCount((prev) => prev + files.length);
    setShowUploader(false);
  };

  const handleLinkAdd = (link: string) => {
    if (resumeCount + 1 > maxResumes) {
      toast("Maximum limit reached", {
        description: `You can upload a maximum of ${maxResumes} resumes.`,
      });
      return;
    }

    const linkName = link.split("/").pop() || "Linked Resume";

    const newResume: ResumeFile = {
      id: crypto.randomUUID(),
      name: linkName,
      type: "link",
      url: link,
      uploadedAt: new Date(),
      status: "processing",
    };

    onResumeAdd(newResume);

    // Simulate processing
    setTimeout(() => {
      const updatedResume = { ...newResume, status: "ready" };
      onResumeAdd(updatedResume as ResumeFile);
    }, 2000);

    setResumeCount((prev) => prev + 1);
    setShowUploader(false);
  };

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="wait">
        {!showUploader ? (
          <motion.div
            key="add-button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            <Button
              onClick={() => setShowUploader(true)}
              variant="outline"
              className="border-dashed border-2 h-32 w-full flex flex-col gap-2 hover:bg-muted/50"
              disabled={resumeCount >= maxResumes}
            >
              <Plus size={24} className="text-muted-foreground" />
              <span className="font-medium">Add Resume</span>
              <span className="text-xs text-muted-foreground">
                Upload file or add link
              </span>
            </Button>

            {resumeCount >= maxResumes && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <InfoIcon size={14} />
                <span>Maximum limit of {maxResumes} resumes reached</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">Upload Resume</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploader(false)}
              >
                Cancel
              </Button>
            </div>
            <FileUploader
              multiple={false}
              accept=".pdf,.doc,.docx"
              maxSize={5}
              onFileSelect={handleFileSelect}
              onLinkAdd={handleLinkAdd}
            />
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <InfoIcon size={12} />
              Supported formats: PDF, Word (.doc, .docx)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
