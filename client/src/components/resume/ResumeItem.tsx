import React from "react";
import { motion } from "framer-motion";
import { FileText, Link, X, Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { ResumeFile } from "@/types/resume";
import { cn } from "@/lib/utils";

interface ResumeItemProps {
  resume: ResumeFile;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export const ResumeItem: React.FC<ResumeItemProps> = ({
  resume,
  onRemove,
  onSelect,
  isSelected,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Status indicators
  const StatusIndicator = () => {
    switch (resume.status) {
      case "uploading":
        return (
          <div className="flex items-center text-muted-foreground gap-1">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs">Uploading...</span>
          </div>
        );
      case "processing":
        return (
          <div className="flex items-center text-blue-500 gap-1">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs">Processing...</span>
          </div>
        );
      case "ready":
        return (
          <div className="flex items-center text-green-500 gap-1">
            <Check size={14} />
            <span className="text-xs">Ready</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center text-destructive gap-1">
            <AlertTriangle size={14} />
            <span className="text-xs">{resume.error || "Error"}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "group relative border rounded-lg p-4 transition-all",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/30",
        resume.status === "error" && "border-destructive/30 bg-destructive/5"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-start">
          <div
            className={cn(
              "w-10 h-10 rounded-md flex items-center justify-center text-white",
              resume.type === "file" ? "bg-blue-500" : "bg-purple-500"
            )}
          >
            {resume.type === "file" ? (
              <FileText size={20} />
            ) : (
              <Link size={20} />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="font-medium line-clamp-1">{resume.name}</h4>
            <div className="flex flex-col gap-0.5">
              <StatusIndicator />
              <p className="text-xs text-muted-foreground">
                Added {formatDate(resume.uploadedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant={isSelected ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "h-7 w-7 rounded-md",
              !isSelected && "opacity-0 group-hover:opacity-100"
            )}
            onClick={() => onSelect(resume.id)}
            disabled={resume.status !== "ready"}
          >
            <Check size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100"
            onClick={() => onRemove(resume.id)}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
