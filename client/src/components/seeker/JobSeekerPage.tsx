import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileUploader } from "@/components/shared/FileUploader";
import { ResumeItem } from "@/components/resume/ResumeItem";

import {
  ResumeFile,
  JobDescription as JobDescriptionType,
  MatchAnalysis,
} from "@/types/resume";
import { toast } from "sonner";
import Analysis from "./Analysis";
import JobDescription from "../shared/JobDescription";

const EnhancedJobSeekerInterface = () => {
  // State for the job description
  const [jobDescription, setJobDescription] =
    useState<JobDescriptionType | null>(null);
  const [jobText, setJobText] = useState("");
  const [isProcessingJob, setIsProcessingJob] = useState(false);
  const [jobInputMethod, setJobInputMethod] = useState<
    "text" | "file" | "link"
  >("text");

  // State for the resume
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  // State for the analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);

  // State for UI
  const [activeTab, setActiveTab] = useState<"upload" | "results">("upload");

  // Effect to transition to results when analysis is ready
  useEffect(() => {
    if (analysis) {
      setActiveTab("results");
    }
  }, [analysis]);

  // Handle job description text input
  const handleJobTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobText(e.target.value);
  };

  // Process job description from text
  const handleJobTextSubmit = () => {
    if (!jobText.trim()) {
      toast("Please enter a job description");
      return;
    }

    setIsProcessingJob(true);

    // Create job description object
    const newJobDescription: JobDescriptionType = {
      id: crypto.randomUUID(),
      title: extractJobTitle(jobText) || "Job Position",
      description: jobText,
      requirements: extractRequirements(jobText),
      responsibilities: extractResponsibilities(jobText),
      createdAt: new Date(),
      source: "text",
      status: "processing",
    };

    // Simulate processing delay
    setTimeout(() => {
      const updatedJob = {
        ...newJobDescription,
        status: "ready" as const,
      };
      setJobDescription(updatedJob);
      setIsProcessingJob(false);
    }, 1500);
  };

  // Process job description from file
  const handleJobFileSubmit = (files: File[]) => {
    if (files.length === 0) return;

    setIsProcessingJob(true);

    // Create job description object with "processing" status
    const newJobDescription: JobDescriptionType = {
      id: crypto.randomUUID(),
      title: files[0].name.replace(/\.[^/.]+$/, ""), // Remove file extension
      description: "Processing job description from file...",
      requirements: [],
      responsibilities: [],
      createdAt: new Date(),
      source: "file",
      status: "processing",
    };

    // Simulate file processing delay
    setTimeout(() => {
      // In a real app, you'd extract text from the PDF here
      const updatedJob: JobDescriptionType = {
        ...newJobDescription,
        title: "Software Engineer",
        description:
          "This is a sample job description extracted from the uploaded file...",
        requirements: [
          "5+ years of experience with React and TypeScript",
          "Experience with state management libraries",
          "Strong understanding of web accessibility",
          "Experience with testing frameworks",
        ],
        responsibilities: [
          "Develop and maintain frontend applications",
          "Collaborate with designers and backend engineers",
          "Write clean, maintainable code",
          "Participate in code reviews",
        ],
        status: "ready",
      };

      setJobDescription(updatedJob);
      setIsProcessingJob(false);
    }, 2000);
  };

  // Process job description from link
  const handleJobLinkSubmit = (link: string) => {
    if (!link) return;

    setIsProcessingJob(true);

    // Create job description object with "processing" status
    const newJobDescription: JobDescriptionType = {
      id: crypto.randomUUID(),
      title: "Job from URL",
      description: "Processing job description from URL...",
      requirements: [],
      responsibilities: [],
      createdAt: new Date(),
      source: "link",
      sourceUrl: link,
      status: "processing",
    };

    // Simulate link processing delay
    setTimeout(() => {
      // In a real app, you'd fetch and extract text from the URL here
      const updatedJob: JobDescriptionType = {
        ...newJobDescription,
        title: "Frontend Developer",
        description:
          "This is a sample job description extracted from the provided URL...",
        requirements: [
          "3+ years of experience with JavaScript",
          "Experience with React or similar frameworks",
          "Understanding of responsive design principles",
          "Good communication skills",
        ],
        responsibilities: [
          "Build user interfaces for web applications",
          "Ensure cross-browser compatibility",
          "Optimize applications for performance",
          "Work with UX designers to implement designs",
        ],
        status: "ready",
      };

      setJobDescription(updatedJob);
      setIsProcessingJob(false);
    }, 2500);
  };

  // Handle resume upload
  const handleResumeAdd = (resume: ResumeFile) => {
    setResumes((prev) => {
      // If resume already exists, update it
      const exists = prev.find((r) => r.id === resume.id);
      if (exists) {
        return prev.map((r) => (r.id === resume.id ? resume : r));
      }
      // Otherwise add it
      return [...prev, resume];
    });

    // Auto-select the first resume
    if (!selectedResumeId) {
      setSelectedResumeId(resume.id);
    }
  };

  const handleResumeRemove = (id: string) => {
    setResumes((prev) => prev.filter((resume) => resume.id !== id));

    // If the removed resume was selected, select another one if available
    if (selectedResumeId === id) {
      const remainingResumes = resumes.filter((r) => r.id !== id);
      setSelectedResumeId(
        remainingResumes.length > 0 ? remainingResumes[0].id : null
      );
    }
  };

  const handleResumeSelect = (id: string) => {
    setSelectedResumeId(id);
  };

  // Handle analysis
  const handleAnalyze = () => {
    if (!selectedResumeId || !jobDescription) {
      toast("Please select a resume and add a job description");
      return;
    }

    if (jobDescription.status !== "ready") {
      toast("Please wait for the job description to finish processing");
      return;
    }

    setIsAnalyzing(true);

    // Simulate API call for analysis
    setTimeout(() => {
      // Mock analysis data
      const mockAnalysis: MatchAnalysis = {
        id: crypto.randomUUID(),
        resumeId: selectedResumeId,
        jobId: jobDescription.id,
        overallScore: 78,
        summary:
          "Your resume shows a strong match with this job posting. Your technical skills and experience align well with the requirements, though there are a few areas for improvement to make your application even stronger.",
        sectionScores: [
          {
            name: "Skills Match",
            score: 85,
            weight: 40,
            details:
              "Your technical skills match most of the job requirements well.",
          },
          {
            name: "Experience",
            score: 75,
            weight: 30,
            details:
              "Your work experience is relevant but could emphasize certain areas more.",
          },
          {
            name: "Education",
            score: 90,
            weight: 15,
            details:
              "Your educational background meets or exceeds the requirements.",
          },
          {
            name: "Keywords",
            score: 65,
            weight: 15,
            details:
              "Some key terms from the job posting could be better represented.",
          },
        ],
        skillMatches: [
          {
            skill: "React",
            resumeLevel: 90,
            jobImportance: 95,
            match: 94,
            suggestions:
              "Strong match. Consider highlighting specific React projects or achievements.",
          },
          {
            skill: "TypeScript",
            resumeLevel: 80,
            jobImportance: 90,
            match: 85,
            suggestions:
              "Good match. Mention TypeScript experience in context of large projects.",
          },
          {
            skill: "Node.js",
            resumeLevel: 70,
            jobImportance: 85,
            match: 78,
          },
          {
            skill: "UI/UX Design",
            resumeLevel: 60,
            jobImportance: 80,
            match: 68,
            suggestions:
              "Consider emphasizing your design skills more prominently.",
          },
          {
            skill: "API Development",
            resumeLevel: 75,
            jobImportance: 75,
            match: 90,
          },
          {
            skill: "DevOps",
            resumeLevel: 40,
            jobImportance: 60,
            match: 55,
            suggestions:
              "This is an area for improvement. Consider mentioning any DevOps experience.",
          },
          {
            skill: "Testing",
            resumeLevel: 50,
            jobImportance: 70,
            match: 65,
            suggestions:
              "Add more details about your testing experience and methodologies.",
          },
        ],
        experienceMatches: [
          {
            area: "Frontend Development",
            resumeLevel: 85,
            jobRequirement: 90,
            match: 92,
            suggestions:
              "Your frontend experience is strong and well-aligned with the position.",
          },
          {
            area: "Team Leadership",
            resumeLevel: 60,
            jobRequirement: 75,
            match: 70,
            suggestions: "Emphasize leadership examples and team size managed.",
          },
          {
            area: "Agile Methodologies",
            resumeLevel: 70,
            jobRequirement: 80,
            match: 75,
          },
        ],
        educationMatches: [
          {
            requirement:
              "Bachelor's degree in Computer Science or related field",
            fulfilled: true,
            score: 100,
          },
          {
            requirement: "Knowledge of modern web technologies",
            fulfilled: true,
            score: 90,
            suggestions:
              "Your education and experience demonstrate this knowledge.",
          },
          {
            requirement: "Formal UX/UI training or education",
            fulfilled: false,
            score: 60,
            suggestions:
              "Consider mentioning any design courses or certifications you may have.",
          },
        ],
        keywordMatches: [
          {
            keyword: "React",
            occurrencesInResume: 8,
            occurrencesInJob: 5,
            importance: 95,
          },
          {
            keyword: "TypeScript",
            occurrencesInResume: 6,
            occurrencesInJob: 4,
            importance: 90,
          },
          {
            keyword: "collaboration",
            occurrencesInResume: 2,
            occurrencesInJob: 6,
            importance: 75,
          },
          {
            keyword: "architecture",
            occurrencesInResume: 1,
            occurrencesInJob: 3,
            importance: 80,
          },
        ],
        improvementSuggestions: [
          {
            priority: "High",
            section: "Skills",
            suggestion:
              "Add more details about your DevOps experience and tools used.",
          },
          {
            priority: "Medium",
            section: "Experience",
            suggestion:
              "Quantify your achievements with metrics and results where possible.",
          },
          {
            priority: "Medium",
            section: "Keywords",
            suggestion:
              "Include terms like 'collaboration' and 'architecture' more prominently.",
          },
          {
            priority: "Low",
            section: "Education",
            suggestion:
              "If you have any UX/UI courses or certifications, add them to your resume.",
          },
          {
            priority: "Low",
            section: "Format",
            suggestion:
              "Consider using bullet points for clearer presentation of skills and achievements.",
          },
        ],
        createdAt: new Date(),
      };

      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Helper functions to extract job information (simplified for demo)
  const extractJobTitle = (text: string): string | null => {
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

  const handleBackToEdit = () => {
    setActiveTab("upload");
  };

  const canAnalyze =
    selectedResumeId !== null && jobDescription?.status === "ready";

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 font-source-code-pro">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">ResumeMatch</h1>
        <p className="text-muted-foreground">
          Match your resume to job descriptions and get detailed analysis
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "upload" | "results")}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="upload">Upload & Match</TabsTrigger>
          <TabsTrigger value="results" disabled={!analysis}>
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side - Job Description */}
            <JobDescription
              jobInputMethod={jobInputMethod}
              setJobInputMethod={setJobInputMethod}
              jobDescription={jobDescription}
              isProcessingJob={isProcessingJob}
              handleJobTextChange={handleJobTextChange}
              handleJobTextSubmit={handleJobTextSubmit}
              handleJobFileSubmit={handleJobFileSubmit}
              handleJobLinkSubmit={handleJobLinkSubmit}
              setJobDescription={setJobDescription}
              jobText={jobText}
              setJobText={setJobText}
            />

            {/* Right Side - Resume */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-semibold">Your Resume</h2>

              <div className="space-y-4">
                {resumes.length === 0 ? (
                  <FileUploader
                    multiple={false}
                    accept=".pdf,.doc,.docx"
                    maxSize={5}
                    onFileSelect={(files) => {
                      files.forEach((file) => {
                        const newResume: ResumeFile = {
                          id: crypto.randomUUID(),
                          name: file.name,
                          type: "file",
                          file,
                          uploadedAt: new Date(),
                          status: "uploading",
                        };

                        handleResumeAdd(newResume);

                        // Simulate processing
                        setTimeout(() => {
                          const updatedResume = {
                            ...newResume,
                            status: "ready" as const,
                          };
                          handleResumeAdd(updatedResume);
                        }, 2000);
                      });
                    }}
                    onLinkAdd={(link) => {
                      const linkName = link.split("/").pop() || "Linked Resume";
                      const newResume: ResumeFile = {
                        id: crypto.randomUUID(),
                        name: linkName,
                        type: "link",
                        url: link,
                        uploadedAt: new Date(),
                        status: "processing",
                      };

                      handleResumeAdd(newResume);

                      // Simulate processing
                      setTimeout(() => {
                        const updatedResume = {
                          ...newResume,
                          status: "ready" as const,
                        };
                        handleResumeAdd(updatedResume);
                      }, 2000);
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Your Resumes
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newResume: ResumeFile = {
                            id: crypto.randomUUID(),
                            name: "Sample Resume.pdf",
                            type: "file",
                            uploadedAt: new Date(),
                            status: "uploading",
                          };

                          handleResumeAdd(newResume);

                          // Simulate processing
                          setTimeout(() => {
                            const updatedResume = {
                              ...newResume,
                              status: "ready" as const,
                            };
                            handleResumeAdd(updatedResume);
                          }, 2000);
                        }}
                      >
                        <Upload size={14} className="mr-2" />
                        Add Another
                      </Button>
                    </div>

                    <AnimatePresence>
                      {resumes.map((resume, index) => (
                        <motion.div
                          key={resume.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <ResumeItem
                            resume={resume}
                            onRemove={handleResumeRemove}
                            onSelect={handleResumeSelect}
                            isSelected={selectedResumeId === resume.id}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {resumes.length > 0 && (
                <div className="pt-4">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze || isAnalyzing}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing Match...
                      </>
                    ) : (
                      <>
                        Analyze Resume Match
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="results">
          {analysis && jobDescription && (
            <Analysis
              analysis={analysis}
              resumes={resumes}
              jobDescription={jobDescription}
              handleBackToEdit={handleBackToEdit}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedJobSeekerInterface;
