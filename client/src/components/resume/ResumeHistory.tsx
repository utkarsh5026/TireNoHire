// src/components/resume/ResumeHistory.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Star,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  History,
  Link,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ResumeFile } from "@/types/resume";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Augmented ResumeFile to include saved state
interface SavedResumeFile extends ResumeFile {
  savedAt?: Date;
  isSaved: boolean;
  tags?: string[];
  lastUsed?: Date;
}

interface ResumeHistoryProps {
  onResumeSelect: (resume: ResumeFile) => void;
  currentResumes?: ResumeFile[];
  className?: string;
}

export const ResumeHistory: React.FC<ResumeHistoryProps> = ({
  onResumeSelect,
  currentResumes = [],
  className,
}) => {
  // In a real app, this would come from API
  const [savedResumes, setSavedResumes] = useState<SavedResumeFile[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch saved resumes on component mount
  useEffect(() => {
    const fetchSavedResumes = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data for demonstration
        const mockSavedResumes: SavedResumeFile[] = [
          {
            id: "saved-1",
            name: "Software_Engineer_Resume_2024.pdf",
            type: "file",
            uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            status: "ready",
            savedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
            isSaved: true,
            lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            tags: ["Software Engineer", "Frontend", "React"],
          },
          {
            id: "saved-2",
            name: "Product_Manager_Resume.docx",
            type: "file",
            uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            status: "ready",
            savedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
            isSaved: true,
            lastUsed: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            tags: ["Product Manager", "Agile", "SaaS"],
          },
          {
            id: "saved-3",
            name: "UX_Designer_Portfolio.pdf",
            type: "file",
            uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            status: "ready",
            savedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            isSaved: true,
            tags: ["UX Designer", "Portfolio", "Design"],
          },
        ];

        setSavedResumes(mockSavedResumes);
      } catch (error) {
        console.error("Error fetching saved resumes:", error);
        toast.error("Failed to load saved resumes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedResumes();
  }, []);

  // Save current resume to history
  const handleSaveResume = async (resume: ResumeFile) => {
    try {
      // Check if already saved
      if (savedResumes.some((saved) => saved.id === resume.id)) {
        toast.info("Resume already saved");
        return;
      }

      // In a real app, this would be an API call
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const savedResume: SavedResumeFile = {
        ...resume,
        savedAt: new Date(),
        isSaved: true,
        lastUsed: new Date(),
      };

      setSavedResumes((prev) => [savedResume, ...prev]);
      toast.success("Resume saved to history");
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
    }
  };

  // Remove resume from history
  const handleRemoveFromHistory = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSavedResumes((prev) => prev.filter((resume) => resume.id !== id));
      toast.success("Resume removed from history");
    } catch (error) {
      console.error("Error removing resume:", error);
      toast.error("Failed to remove resume from history");
    }
  };

  // Filter resumes based on search query
  const filteredResumes = savedResumes.filter(
    (resume) =>
      resume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className={cn("w-full border rounded-lg", className)}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer border-b"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <History size={18} className="text-primary" />
          <h3 className="font-medium">Resume History</h3>
          <Badge variant="outline" className="ml-2">
            {savedResumes.length}
          </Badge>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search saved resumes..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Current resumes that can be saved */}
              {currentResumes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Current Resumes
                  </h4>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {currentResumes.map((resume) => {
                      const isAlreadySaved = savedResumes.some(
                        (saved) => saved.id === resume.id
                      );
                      return (
                        <motion.div
                          key={resume.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between p-2 border rounded-md bg-muted/10"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                              {resume.type === "file" ? (
                                <FileText size={16} className="text-primary" />
                              ) : (
                                <Link size={16} className="text-primary" />
                              )}
                            </div>
                            <span className="truncate text-sm">
                              {resume.name}
                            </span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => handleSaveResume(resume)}
                            disabled={isAlreadySaved}
                          >
                            <Star
                              size={16}
                              className={
                                isAlreadySaved
                                  ? "text-amber-500 fill-amber-500"
                                  : ""
                              }
                            />
                            {isAlreadySaved ? "Saved" : "Save"}
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Saved resumes list */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>Saved Resumes</span>
                  {filteredResumes.length !== savedResumes.length && (
                    <span className="text-xs">
                      Showing {filteredResumes.length} of {savedResumes.length}
                    </span>
                  )}
                </h4>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : filteredResumes.length === 0 ? (
                  <div className="text-center py-8 border rounded-md border-dashed">
                    <div className="flex justify-center mb-2">
                      <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                        <History size={20} className="text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium">No saved resumes</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchQuery
                        ? "No resumes match your search"
                        : "Save resumes to access them later"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredResumes.map((resume, index) => (
                      <motion.div
                        key={resume.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group relative border rounded-md p-3 hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                {resume.type === "file" ? (
                                  <FileText
                                    size={16}
                                    className="text-primary"
                                  />
                                ) : (
                                  <Link size={16} className="text-primary" />
                                )}
                              </div>
                              <span className="font-medium">{resume.name}</span>
                            </div>

                            <div className="flex flex-wrap gap-1 ml-10">
                              {resume.tags?.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex gap-3 text-xs text-muted-foreground ml-10">
                              <div className="flex items-center gap-1">
                                <Star size={12} />
                                <span>Saved {formatDate(resume.savedAt!)}</span>
                              </div>
                              {resume.lastUsed && (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>
                                    Last used {formatDate(resume.lastUsed)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8"
                              onClick={() => {
                                onResumeSelect(resume);
                                // Update last used date
                                setSavedResumes((prev) =>
                                  prev.map((r) =>
                                    r.id === resume.id
                                      ? { ...r, lastUsed: new Date() }
                                      : r
                                  )
                                );
                              }}
                            >
                              <Plus size={14} className="mr-1" /> Use
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveFromHistory(resume.id)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
