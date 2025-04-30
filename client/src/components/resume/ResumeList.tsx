import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeItem } from "./ResumeItem";
import { ResumeFile } from "@/types/resume";
import { cn } from "@/lib/utils";

interface ResumeListProps {
  resumes: ResumeFile[];
  onResumeRemove: (id: string) => void;
  onResumeSelect: (id: string) => void;
  selectedResumeIds: string[];
  className?: string;
}

export const ResumeList: React.FC<ResumeListProps> = ({
  resumes,
  onResumeRemove,
  onResumeSelect,
  selectedResumeIds,
  className,
}) => {
  if (resumes.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-muted-foreground">
        {resumes.length} {resumes.length === 1 ? "Resume" : "Resumes"} Added
      </h3>

      <AnimatePresence>
        {resumes.map((resume, index) => (
          <motion.div
            key={resume.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ResumeItem
              resume={resume}
              onRemove={onResumeRemove}
              onSelect={onResumeSelect}
              isSelected={selectedResumeIds.includes(resume.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
