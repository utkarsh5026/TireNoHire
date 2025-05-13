import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeUploader } from "../ResumeLoader";
import { ResumeList } from "../ResumeList";
import ResumeDisplay from "./ResumeDisplay";
import { ResumeData, ResumeFile } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { FileUp, Eye, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ResumeUploadDisplayProps {
  onResumeAnalyzed?: (resume: ResumeData) => void;
  className?: string;
}

const ResumeUploadDisplay: React.FC<ResumeUploadDisplayProps> = ({
  onResumeAnalyzed,
  className,
}) => {
  // State for uploaded resumes
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [selectedResumeIds, setSelectedResumeIds] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<"upload" | "display">("upload");

  // State for the parsed resume data
  const [parsedResume, setParsedResume] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle resume addition
  const handleResumeAdd = (resume: ResumeFile) => {
    setResumes((prev) =>
      prev.map((r) => (r.id === resume.id ? resume : r)).includes(resume)
        ? prev
        : [...prev, resume]
    );
  };

  // Handle resume removal
  const handleResumeRemove = (id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
    setSelectedResumeIds((prev) => prev.filter((resumeId) => resumeId !== id));
  };

  // Handle resume selection
  const handleResumeSelect = (id: string) => {
    setSelectedResumeIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  // Process the selected resume
  const processSelectedResume = async () => {
    if (selectedResumeIds.length === 0) {
      toast.error("Please select a resume to analyze");
      return;
    }

    setIsLoading(true);

    try {
      const selectedResume = resumes.find((r) => r.id === selectedResumeIds[0]);

      if (!selectedResume) {
        throw new Error("Selected resume not found");
      }

      // In a real application, you would send the resume to the backend for parsing
      // For now, we'll simulate a loading delay and then use mock data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate a parsed resume (in reality, this would come from the backend)
      // This uses the mock data structure from ResumeDisplay.tsx
      const mockParsedResume = {
        contact_info: {
          name: "Alex Johnson",
          email: "alex.johnson@example.com",
          phone: "(555) 123-4567",
          location: "San Francisco, CA",
          linkedin: "linkedin.com/in/alexjohnson",
          website: "alexjohnson.dev",
        },
        summary: "Senior Frontend Developer with 7+ years of experience...",
        education: [
          {
            institution: "University of California, Berkeley",
            degree: "Bachelor of Science",
            field: "Computer Science",
            start_date: "2012-09",
            end_date: "2016-05",
            gpa: 3.8,
            achievements: [
              "Graduated with Honors",
              "Dean's List 8 consecutive semesters",
            ],
          },
        ],
        experience: [
          {
            company: "TechCorp Solutions",
            position: "Senior Frontend Developer",
            start_date: "2020-03",
            end_date: "Present",
            description:
              "Lead frontend developer for enterprise SaaS platform...",
            achievements: [
              "Rebuilt the frontend with React and TypeScript, improving performance by 45%",
              "Implemented responsive design, increasing mobile user engagement by 60%",
            ],
            skills: ["React", "TypeScript", "Redux", "Jest"],
          },
        ],
        skills: [
          "React",
          "TypeScript",
          "JavaScript",
          "HTML5",
          "CSS3/SASS",
          "Redux",
          "GraphQL",
        ],
        certifications: [
          {
            name: "AWS Certified Developer – Associate",
            issuer: "Amazon Web Services",
            date: "2021-06",
            expiry_date: "2024-06",
          },
        ],
        projects: [
          {
            name: "EcoTrack",
            description:
              "An open-source web application that helps users track and reduce their carbon footprint.",
            technologies: ["React", "Node.js", "MongoDB"],
            url: "github.com/alexj/ecotrack",
            start_date: "2021-01",
            end_date: "Present",
          },
        ],
        languages: ["English (Native)", "Spanish (Proficient)"],
        // Custom properties for the filename and original upload info
        original_filename: selectedResume.name,
        upload_date: new Date().toISOString(),
        source_type: selectedResume.type,
      };

      setParsedResume(mockParsedResume as unknown as ResumeData);
      setActiveView("display");

      // Notify parent component that resume was analyzed
      if (onResumeAnalyzed) {
        onResumeAnalyzed(mockParsedResume as unknown as ResumeData);
      }
    } catch (error) {
      console.error("Error processing resume:", error);
      toast.error("Failed to process resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <AnimatePresence mode="wait">
        {activeView === "upload" ? (
          <motion.div
            key="upload-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Resume</h2>

              <Button
                onClick={processSelectedResume}
                disabled={selectedResumeIds.length === 0 || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    View Resume
                  </>
                )}
              </Button>
            </div>

            <ResumeUploader onResumeAdd={handleResumeAdd} />

            {resumes.length > 0 && (
              <ResumeList
                resumes={resumes}
                onResumeRemove={handleResumeRemove}
                onResumeSelect={handleResumeSelect}
                selectedResumeIds={selectedResumeIds}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="display-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setActiveView("upload")}
              >
                <ArrowLeft size={16} />
                Back to Upload
              </Button>

              <div className="flex-1">
                <h2 className="text-2xl font-semibold">Resume Preview</h2>
                {parsedResume && (
                  <p className="text-sm text-muted-foreground">
                    Showing parsed data from {parsedResume.contactInfo.name}
                  </p>
                )}
              </div>
            </div>

            {parsedResume ? (
              <ResumeDisplay />
            ) : (
              <div className="flex justify-center items-center h-64 border rounded-lg border-dashed">
                <div className="text-center">
                  <FileUp
                    size={32}
                    className="mx-auto text-muted-foreground mb-2"
                  />
                  <p className="text-muted-foreground">
                    No resume data available
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeUploadDisplay;
