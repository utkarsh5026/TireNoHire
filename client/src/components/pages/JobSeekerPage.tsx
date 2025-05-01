import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileUp,
  Globe,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/analysis/MatchScore";
import { FileUploader } from "@/components/shared/FileUploader";
import { ResumeItem } from "@/components/resume/ResumeItem";
import { SkillsMatchChart } from "@/components/analysis/SkillMatchChart";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { LinkInput } from "@/components/shared/LinkInput";

import { ResumeFile, JobDescription, MatchAnalysis } from "@/types/resume";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EnhancedJobSeekerInterface = () => {
  // State for the job description
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null
  );
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
    const newJobDescription: JobDescription = {
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
    const newJobDescription: JobDescription = {
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
      const updatedJob: JobDescription = {
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
    const newJobDescription: JobDescription = {
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
      const updatedJob: JobDescription = {
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

  // Render job input based on selected method
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
                    disabled={
                      jobDescription?.status === "ready" || isProcessingJob
                    }
                  >
                    <FileText size={14} />
                    <span className="hidden sm:inline">Text</span>
                  </Button>
                  <Button
                    variant={jobInputMethod === "file" ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setJobInputMethod("file")}
                    disabled={
                      jobDescription?.status === "ready" || isProcessingJob
                    }
                  >
                    <FileUp size={14} />
                    <span className="hidden sm:inline">Upload</span>
                  </Button>
                  <Button
                    variant={jobInputMethod === "link" ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setJobInputMethod("link")}
                    disabled={
                      jobDescription?.status === "ready" || isProcessingJob
                    }
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
                      <h3 className="text-xl font-semibold">
                        {jobDescription.title}
                      </h3>
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
                        {jobDescription.requirements
                          .slice(0, 4)
                          .map((req, idx) => (
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
          {analysis && (
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-between items-start"
              >
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Match Analysis Results
                  </h2>
                  <p className="text-muted-foreground">
                    {resumes.find((r) => r.id === analysis.resumeId)?.name} +{" "}
                    {jobDescription?.title}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBackToEdit}>
                    Edit
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <RefreshCw size={16} />
                    Refresh
                  </Button>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                {/* Sidebar with summary */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="md:col-span-1"
                >
                  <Card className="sticky top-4">
                    <CardContent className="p-6 flex flex-col items-center">
                      <div className="py-4">
                        <MatchScore score={analysis.overallScore} size="lg" />
                      </div>

                      <div className="text-sm text-center mt-2 space-y-4">
                        <p className="text-muted-foreground">
                          {analysis.summary}
                        </p>

                        <div className="pt-4 space-y-3 text-left">
                          <h4 className="font-medium text-sm">Key Strengths</h4>
                          <ul className="space-y-2">
                            {analysis.skillMatches
                              .filter((skill) => skill.match >= 85)
                              .slice(0, 3)
                              .map((skill, idx) => (
                                <li
                                  key={idx}
                                  className="flex gap-2 items-start text-xs"
                                >
                                  <CheckCircle
                                    size={12}
                                    className="text-green-500 mt-0.5"
                                  />
                                  <span>{skill.skill}</span>
                                </li>
                              ))}
                          </ul>
                        </div>

                        <div className="pt-2 space-y-3 text-left">
                          <h4 className="font-medium text-sm">
                            Areas to Improve
                          </h4>
                          <ul className="space-y-2">
                            {analysis.improvementSuggestions
                              .filter((sugg) => sugg.priority === "High")
                              .slice(0, 2)
                              .map((sugg, idx) => (
                                <li
                                  key={idx}
                                  className="flex gap-2 items-start text-xs"
                                >
                                  <AlertTriangle
                                    size={12}
                                    className="text-amber-500 mt-0.5"
                                  />
                                  <span>{sugg.suggestion}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Main content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="md:col-span-2 lg:col-span-3 space-y-6"
                >
                  <Tabs defaultValue="skills">
                    <TabsList className="mb-4">
                      <TabsTrigger value="skills">Skills Match</TabsTrigger>
                      <TabsTrigger value="experience">Experience</TabsTrigger>
                      <TabsTrigger value="education">Education</TabsTrigger>
                      <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="skills">
                      <Card>
                        <CardHeader>
                          <CardTitle>Skills Analysis</CardTitle>
                          <CardDescription>
                            How your skills match with the job requirements
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              {
                                analysis.sectionScores.find(
                                  (section) => section.name === "Skills Match"
                                )?.details
                              }
                            </div>
                            <SkillsMatchChart skills={analysis.skillMatches} />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="experience">
                      <Card>
                        <CardHeader>
                          <CardTitle>Experience Match</CardTitle>
                          <CardDescription>
                            How your work experience aligns with job
                            requirements
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {analysis.experienceMatches.map((exp, idx) => (
                              <Card
                                key={`exp-match-${idx}`}
                                className="overflow-hidden"
                              >
                                <div className="flex flex-col sm:flex-row">
                                  <div className="p-4 flex-1">
                                    <h4 className="font-medium">{exp.area}</h4>
                                    <div className="flex gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-xs",
                                          exp.match >= 70
                                            ? "bg-green-100 text-green-700 border-green-200"
                                            : exp.match >= 50
                                            ? "bg-blue-100 text-blue-700 border-blue-200"
                                            : "bg-amber-100 text-amber-700 border-amber-200"
                                        )}
                                      >
                                        {exp.match}% Match
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {exp.suggestions ||
                                        "Your experience aligns with the job requirements."}
                                    </p>
                                  </div>
                                  <div className="p-4 bg-muted/30 w-full sm:w-32 flex sm:flex-col items-center justify-between gap-2 border-t sm:border-t-0 sm:border-l">
                                    <div className="text-center">
                                      <div className="text-xs text-muted-foreground">
                                        You
                                      </div>
                                      <div
                                        className={cn(
                                          "text-lg font-bold",
                                          exp.resumeLevel >= 70
                                            ? "text-green-500"
                                            : exp.resumeLevel >= 50
                                            ? "text-blue-500"
                                            : "text-amber-500"
                                        )}
                                      >
                                        {exp.resumeLevel}%
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xs text-muted-foreground">
                                        Job
                                      </div>
                                      <div className="text-lg font-bold text-primary">
                                        {exp.jobRequirement}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="education">
                      <Card>
                        <CardHeader>
                          <CardTitle>Education Requirements</CardTitle>
                          <CardDescription>
                            How your education matches with the job requirements
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {analysis.educationMatches.map((edu, idx) => (
                              <motion.div
                                key={`edu-${idx}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                className="flex gap-3 items-start p-3 border rounded-lg"
                              >
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                                    edu.fulfilled
                                      ? "bg-green-100"
                                      : "bg-amber-100"
                                  )}
                                >
                                  {edu.fulfilled ? (
                                    <CheckCircle
                                      size={14}
                                      className="text-green-600"
                                    />
                                  ) : (
                                    <AlertTriangle
                                      size={14}
                                      className="text-amber-600"
                                    />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between">
                                    <h4 className="font-medium">
                                      {edu.requirement}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "ml-2",
                                        edu.score >= 80
                                          ? "bg-green-100 text-green-700"
                                          : edu.score >= 60
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-amber-100 text-amber-700"
                                      )}
                                    >
                                      {edu.score}%
                                    </Badge>
                                  </div>
                                  {edu.suggestions && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {edu.suggestions}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="suggestions">
                      <Card>
                        <CardHeader>
                          <CardTitle>Improvement Suggestions</CardTitle>
                          <CardDescription>
                            Recommendations to improve your resume for this job
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {/* High priority suggestions */}
                            {analysis.improvementSuggestions.filter(
                              (s) => s.priority === "High"
                            ).length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-sm font-medium text-red-500 flex items-center gap-1">
                                  <AlertTriangle size={16} />
                                  High Priority
                                </h3>

                                {analysis.improvementSuggestions
                                  .filter((s) => s.priority === "High")
                                  .map((suggestion, idx) => (
                                    <motion.div
                                      key={`high-${idx}`}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: idx * 0.1,
                                      }}
                                      className="p-3 border rounded-lg bg-red-50/50"
                                    >
                                      <div className="flex gap-2">
                                        <Badge
                                          variant="outline"
                                          className="h-min mt-0.5 bg-red-100 text-red-700 border-red-200"
                                        >
                                          {suggestion.section}
                                        </Badge>
                                        <p>{suggestion.suggestion}</p>
                                      </div>
                                    </motion.div>
                                  ))}
                              </div>
                            )}

                            {/* Medium priority suggestions */}
                            {analysis.improvementSuggestions.filter(
                              (s) => s.priority === "Medium"
                            ).length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-sm font-medium text-amber-500 flex items-center gap-1">
                                  <AlertTriangle size={16} />
                                  Medium Priority
                                </h3>

                                {analysis.improvementSuggestions
                                  .filter((s) => s.priority === "Medium")
                                  .map((suggestion, idx) => (
                                    <motion.div
                                      key={`medium-${idx}`}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: 0.3 + idx * 0.1,
                                      }}
                                      className="p-3 border rounded-lg"
                                    >
                                      <div className="flex gap-2">
                                        <Badge
                                          variant="outline"
                                          className="h-min mt-0.5 bg-amber-100 text-amber-700 border-amber-200"
                                        >
                                          {suggestion.section}
                                        </Badge>
                                        <p>{suggestion.suggestion}</p>
                                      </div>
                                    </motion.div>
                                  ))}
                              </div>
                            )}

                            {/* Low priority suggestions */}
                            {analysis.improvementSuggestions.filter(
                              (s) => s.priority === "Low"
                            ).length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-sm font-medium text-green-500 flex items-center gap-1">
                                  <CheckCircle size={16} />
                                  Low Priority
                                </h3>

                                {analysis.improvementSuggestions
                                  .filter((s) => s.priority === "Low")
                                  .map((suggestion, idx) => (
                                    <motion.div
                                      key={`low-${idx}`}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: 0.6 + idx * 0.1,
                                      }}
                                      className="p-3 border rounded-lg"
                                    >
                                      <div className="flex gap-2">
                                        <Badge
                                          variant="outline"
                                          className="h-min mt-0.5 bg-green-100 text-green-700 border-green-200"
                                        >
                                          {suggestion.section}
                                        </Badge>
                                        <p>{suggestion.suggestion}</p>
                                      </div>
                                    </motion.div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedJobSeekerInterface;
