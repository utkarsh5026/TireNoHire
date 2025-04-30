import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, File, Link, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FileUploaderProps {
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (files: File[]) => void;
  onLinkAdd: (link: string) => void;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  multiple = false,
  accept = ".pdf,.doc,.docx",
  maxSize = 10,
  onFileSelect,
  onLinkAdd,
  className,
}) => {
  const [dragging, setDragging] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      validateAndProcessFiles(filesArray);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      validateAndProcessFiles(filesArray);
    }
  };

  const validateAndProcessFiles = (files: File[]) => {
    // Filter valid files
    const validFiles = files.filter((file) => {
      // Check file type
      const fileType = file.name.split(".").pop()?.toLowerCase();
      const isValidType = accept.includes(`.${fileType}`);

      // Check file size
      const isValidSize = file.size <= maxSize * 1024 * 1024;

      if (!isValidType) {
        toast("Invalid file type", {
          description: `${file.name} is not a supported file type. Please upload ${accept} files.`,
        });
      }

      if (!isValidSize) {
        toast("File too large", {
          description: `${file.name} exceeds the ${maxSize}MB limit.`,
        });
      }

      return isValidType && isValidSize;
    });

    if (validFiles.length > 0) {
      onFileSelect(multiple ? validFiles : [validFiles[0]]);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleLinkSubmit = () => {
    if (!linkValue) return;

    setIsLoading(true);

    // Validate the link (basic validation for demonstration)
    const isValidLink =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
        linkValue
      );

    if (isValidLink) {
      setTimeout(() => {
        onLinkAdd(linkValue);
        setLinkValue("");
        setLinkMode(false);
        setIsLoading(false);
      }, 1000); // Simulating API call delay
    } else {
      toast("Invalid link", {
        description: "Please enter a valid URL.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {!linkMode ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary"
          >
            <Upload size={28} />
          </motion.div>
          <div className="text-center">
            <p className="text-lg font-medium">Drag & drop your files here</p>
            <p className="text-sm text-muted-foreground mt-1">
              Or click to browse your files
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Supports {accept} files up to {maxSize}MB
            </p>
          </div>
          <input
            title="file-input"
            type="file"
            ref={fileInputRef}
            multiple={multiple}
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="default"
              className="gap-2"
            >
              <File size={16} />
              Browse Files
            </Button>
            <Button
              onClick={() => setLinkMode(true)}
              variant="outline"
              className="gap-2"
            >
              <Link size={16} />
              Add Link
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="border rounded-lg p-6 flex flex-col gap-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Add document link</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLinkMode(false)}
              className="rounded-full h-8 w-8"
            >
              <X size={18} />
            </Button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="https://drive.google.com/file/your-resume"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              onClick={handleLinkSubmit}
              disabled={isLoading || !linkValue}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Link size={16} />
              )}
              Add Link
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Supports Google Drive, Dropbox, OneDrive links and direct document
            URLs
          </p>
        </motion.div>
      )}
    </div>
  );
};
