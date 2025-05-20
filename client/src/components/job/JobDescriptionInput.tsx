import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { LinkInput } from "../shared/LinkInput";
import { JobDescription } from "@/types/resume";
import { InfoIcon, Loader2, CheckIcon } from "lucide-react";

interface JobDescriptionInputProps {
  onJobDescriptionSubmit: (jobDescription: JobDescription) => void;
  isProcessing?: boolean;
  className?: string;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  onJobDescriptionSubmit,
  isProcessing = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<"text" | "link">("text");
  const [textValue, setTextValue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextValue(newText);

    // Update word count
    const words = newText.trim().split(/\s+/);
    setWordCount(newText.trim() === "" ? 0 : words.length);
  };

  const handleTextSubmit = () => {
    if (!textValue.trim()) return;

    setIsAnalyzing(true);

    // Create job description object
    const jobDescription: JobDescription = {
      id: crypto.randomUUID(),
      title: extractJobTitle(textValue) || "Job Position",
      description: textValue,
      requirements: extractRequirements(textValue),
      responsibilities: extractResponsibilities(textValue),
      createdAt: new Date(),
      source: "text",
      status: "processing",
    };

    // Simulate processing delay
    setTimeout(() => {
      onJobDescriptionSubmit(jobDescription);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleLinkSubmit = (link: string) => {
    setIsAnalyzing(true);

    // Create job description object from link
    const jobDescription: JobDescription = {
      id: crypto.randomUUID(),
      title: "Job from URL",
      description: "",
      requirements: [],
      responsibilities: [],
      createdAt: new Date(),
      source: "link",
      sourceUrl: link,
      status: "processing",
    };

    // Simulate link processing
    setTimeout(() => {
      // In a real app, we would fetch and parse the job description from the link
      const updatedJobDescription: JobDescription = {
        ...jobDescription,
        title: "Software Engineer",
        description:
          "This is a sample job description fetched from the provided link...",
        requirements: [
          "Bachelor's degree in Computer Science",
          "3+ years of experience with React",
        ],
        responsibilities: [
          "Develop and maintain web applications",
          "Collaborate with the design team",
        ],
        status: "ready",
      };

      onJobDescriptionSubmit(updatedJobDescription);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Helper functions to extract job information (simplified for demo)
  const extractJobTitle = (text: string): string | null => {
    // Simple extraction - in a real app, this would be more sophisticated
    const lines = text.split("\n");
    for (const line of lines) {
      if (
        line.toLowerCase().includes("title:") ||
        line.toLowerCase().includes("position:")
      ) {
        return line.split(":")[1]?.trim() || null;
      }
    }
    return null;
  };

  const extractRequirements = (text: string): string[] => {
    // Simple extraction - in a real app, this would use NLP or other techniques
    const requirements = [];
    let inRequirementsSection = false;

    const lines = text.split("\n");
    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (
        lowerLine.includes("requirements") ||
        lowerLine.includes("qualifications")
      ) {
        inRequirementsSection = true;
        continue;
      }

      if (
        inRequirementsSection &&
        line.trim() &&
        (line.trim().startsWith("-") || line.trim().startsWith("•"))
      ) {
        requirements.push(line.trim().substring(1).trim());
      }

      // Exit requirements section if we hit another major section
      if (
        inRequirementsSection &&
        (lowerLine.includes("responsibilities") ||
          lowerLine.includes("benefits") ||
          lowerLine.includes("about us"))
      ) {
        inRequirementsSection = false;
      }
    }

    return requirements.length > 0
      ? requirements
      : ["Experience with relevant technologies", "Good communication skills"];
  };

  const extractResponsibilities = (text: string): string[] => {
    // Similar simple extraction logic
    const responsibilities = [];
    let inResponsibilitiesSection = false;

    const lines = text.split("\n");
    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (
        lowerLine.includes("responsibilities") ||
        lowerLine.includes("duties")
      ) {
        inResponsibilitiesSection = true;
        continue;
      }

      if (
        inResponsibilitiesSection &&
        line.trim() &&
        (line.trim().startsWith("-") || line.trim().startsWith("•"))
      ) {
        responsibilities.push(line.trim().substring(1).trim());
      }

      // Exit section
      if (
        inResponsibilitiesSection &&
        (lowerLine.includes("requirements") ||
          lowerLine.includes("qualifications") ||
          lowerLine.includes("benefits"))
      ) {
        inResponsibilitiesSection = false;
      }
    }

    return responsibilities.length > 0
      ? responsibilities
      : [
          "Design and develop software solutions",
          "Collaborate with cross-functional teams",
        ];
  };

  return (
    <div className={className}>
      <Tabs
        defaultValue="text"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "text" | "link")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Paste Job Description</TabsTrigger>
          <TabsTrigger value="link">Job Posting URL</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="text" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste the full job description here..."
                  className="min-h-[300px] resize-none"
                  value={textValue}
                  onChange={handleTextChange}
                  disabled={isAnalyzing}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <InfoIcon size={12} />
                    <span>
                      Paste the complete job description for best results
                    </span>
                  </div>
                  <div>{wordCount} words</div>
                </div>
              </div>

              <Button
                onClick={handleTextSubmit}
                disabled={!textValue.trim() || isAnalyzing || isProcessing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Analyzing Job Description...
                  </>
                ) : isProcessing ? (
                  <>
                    <CheckIcon size={16} className="mr-2" />
                    Job Description Processed
                  </>
                ) : (
                  "Analyze Job Description"
                )}
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="link" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <LinkInput
                  onLinkSubmit={handleLinkSubmit}
                  placeholder="https://example.com/job-posting"
                  label="Job Posting URL"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <InfoIcon size={12} />
                  Supports LinkedIn, Indeed, Glassdoor, and company career pages
                </p>
              </div>

              {isAnalyzing && (
                <div className="flex justify-center p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={24} className="animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Extracting job details...
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};
