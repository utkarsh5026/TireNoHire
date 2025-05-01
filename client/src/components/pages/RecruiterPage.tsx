import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Search,
  Loader2,
  CheckCircle,
  AlertTriangle,
  MapPin,
  ArrowRight,
  FileUp,
  Globe,
  Download,
  Users,
  Briefcase,
  BarChart,
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
import { Input } from "@/components/ui/input";
import { MatchScore } from "@/components/analysis/MatchScore";
import { FileUploader } from "@/components/shared/FileUploader";
import { ResumeItem } from "@/components/resume/ResumeItem";
import { SkillsMatchChart } from "@/components/analysis/SkillMatchChart";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { LinkInput } from "@/components/shared/LinkInput";

import { ResumeFile, JobDescription, MatchAnalysis } from "@/types/resume";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EnhancedRecruiterInterface = () => {
  // State for the job description
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null
  );
  const [jobText, setJobText] = useState("");
  const [isProcessingJob, setIsProcessingJob] = useState(false);
  const [jobInputMethod, setJobInputMethod] = useState<
    "text" | "file" | "link"
  >("text");

  // State for the candidate resumes
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // State for the analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<MatchAnalysis[]>([]);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<
    number | null
  >(null);

  // State for UI
  const [activeTab, setActiveTab] = useState<"setup" | "results">("setup");

  // Effect to transition to results when analysis is ready
  useEffect(() => {
    if (analyses.length > 0) {
      setActiveTab("results");
      // Auto-select the first candidate
      setSelectedCandidateIndex(0);
    }
  }, [analyses]);

  // Sort analyses by score
  const sortedAnalyses = [...analyses]
    .sort((a, b) => b.overallScore - a.overallScore)
    .filter((analysis) => {
      if (!searchQuery) return true;
      const resume = resumes.find((r) => r.id === analysis.resumeId);
      if (!resume) return false;
      return resume.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

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
  };

  const handleResumeRemove = (id: string) => {
    setResumes((prev) => prev.filter((resume) => resume.id !== id));

    // Also remove any analyses for this resume
    setAnalyses((prev) => prev.filter((analysis) => analysis.resumeId !== id));
  };

  // Batch analyze all resumes
  const handleBatchAnalyze = () => {
    if (resumes.length === 0 || !jobDescription) {
      toast("Please add resumes and a job description");
      return;
    }

    if (jobDescription.status !== "ready") {
      toast("Please wait for the job description to finish processing");
      return;
    }

    setIsAnalyzing(true);

    // Simulate API call for analysis
    setTimeout(() => {
      // Generate mock analyses for each resume
      const mockAnalyses = resumes.map((resume) => {
        // Generate random scores between 55 and 95
        const score = Math.floor(Math.random() * 40) + 55;

        return {
          id: crypto.randomUUID(),
          resumeId: resume.id,
          jobId: jobDescription.id,
          overallScore: score,
          summary: `This candidate's resume shows a ${
            score >= 80 ? "strong" : score >= 70 ? "good" : "fair"
          } match with the job requirements.`,
          sectionScores: [
            {
              name: "Skills Match",
              score: Math.min(
                100,
                Math.max(50, score + Math.floor(Math.random() * 20) - 10)
              ),
              weight: 40,
              details: "Technical skills alignment with job requirements.",
            },
            {
              name: "Experience",
              score: Math.min(
                100,
                Math.max(50, score + Math.floor(Math.random() * 20) - 10)
              ),
              weight: 30,
              details: "Relevant work experience evaluation.",
            },
            {
              name: "Education",
              score: Math.min(
                100,
                Math.max(50, score + Math.floor(Math.random() * 20) - 10)
              ),
              weight: 15,
              details: "Educational background assessment.",
            },
            {
              name: "Keywords",
              score: Math.min(
                100,
                Math.max(50, score + Math.floor(Math.random() * 20) - 10)
              ),
              weight: 15,
              details: "Job-specific terminology usage.",
            },
          ],
          skillMatches: [
            {
              skill: "React",
              resumeLevel: Math.floor(Math.random() * 50) + 50,
              jobImportance: 95,
              match: Math.floor(Math.random() * 40) + 60,
            },
            {
              skill: "TypeScript",
              resumeLevel: Math.floor(Math.random() * 50) + 50,
              jobImportance: 90,
              match: Math.floor(Math.random() * 40) + 60,
            },
            {
              skill: "Node.js",
              resumeLevel: Math.floor(Math.random() * 50) + 50,
              jobImportance: 85,
              match: Math.floor(Math.random() * 40) + 60,
            },
            {
              skill: "UI/UX Design",
              resumeLevel: Math.floor(Math.random() * 50) + 50,
              jobImportance: 80,
              match: Math.floor(Math.random() * 40) + 60,
            },
          ],
          experienceMatches: [
            {
              area: "Frontend Development",
              resumeLevel: Math.floor(Math.random() * 50) + 50,
              jobRequirement: 90,
              match: Math.floor(Math.random() * 40) + 60,
            },
            {
              area: "Team Leadership",
              resumeLevel: Math.floor(Math.random() * 50) + 50,
              jobRequirement: 75,
              match: Math.floor(Math.random() * 40) + 60,
            },
          ],
          educationMatches: [
            {
              requirement:
                "Bachelor's degree in Computer Science or related field",
              fulfilled: Math.random() > 0.3,
              score: Math.floor(Math.random() * 40) + 60,
            },
            {
              requirement: "Knowledge of modern web technologies",
              fulfilled: Math.random() > 0.2,
              score: Math.floor(Math.random() * 40) + 60,
            },
          ],
          keywordMatches: [
            {
              keyword: "React",
              occurrencesInResume: Math.floor(Math.random() * 10),
              occurrencesInJob: 5,
              importance: 95,
            },
            {
              keyword: "TypeScript",
              occurrencesInResume: Math.floor(Math.random() * 8),
              occurrencesInJob: 4,
              importance: 90,
            },
          ],
          improvementSuggestions: [
            {
              priority: "Medium",
              section: "Experience",
              suggestion:
                "Candidate could better highlight relevant project experience.",
            },
            {
              priority: "Low",
              section: "Keywords",
              suggestion:
                "More industry-specific terminology would improve the match.",
            },
          ],
          createdAt: new Date(),
        } as MatchAnalysis;
      });

      setAnalyses(mockAnalyses);
      setIsAnalyzing(false);
    }, 3000);
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

  const handleBackToSetup = () => {
    setActiveTab("setup");
  };

  const canAnalyze = resumes.length > 0 && jobDescription?.status === "ready";

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
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          ResumeMatch for Recruiters
        </h1>
        <p className="text-muted-foreground">
          Match candidate resumes to your job requirements and find the best
          fits
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "setup" | "results")}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="setup">Job & Candidates</TabsTrigger>
          <TabsTrigger value="results" disabled={analyses.length === 0}>
            Candidate Matches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side - Job Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Job Requirements</h2>

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
                          <Briefcase size={14} />
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

            {/* Right Side - Candidate Resumes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Candidate Resumes</h2>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users size={14} />
                  {resumes.length}{" "}
                  {resumes.length === 1 ? "Candidate" : "Candidates"}
                </Badge>
              </div>

              <div className="space-y-4">
                {resumes.length === 0 ? (
                  <FileUploader
                    multiple={true}
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
                      <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search candidates..."
                          className="pl-9"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Add sample resumes
                            const sampleNames = [
                              "John Smith.pdf",
                              "Sarah Johnson.docx",
                              "Michael Chen.pdf",
                              "Emily Davis.pdf",
                              "Robert Wilson.docx",
                            ];

                            sampleNames.forEach((name, index) => {
                              const newResume: ResumeFile = {
                                id: crypto.randomUUID(),
                                name,
                                type: "file",
                                uploadedAt: new Date(),
                                status: "uploading",
                              };

                              handleResumeAdd(newResume);

                              setTimeout(() => {
                                const updatedResume = {
                                  ...newResume,
                                  status: "ready" as const,
                                };
                                handleResumeAdd(updatedResume);
                              }, 1000 + index * 500);
                            });
                          }}
                        >
                          <Users size={14} className="mr-2" />
                          Add Sample Candidates
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const fileInput = document.createElement("input");
                            fileInput.type = "file";
                            fileInput.multiple = true;
                            fileInput.accept = ".pdf,.doc,.docx";
                            fileInput.click();

                            fileInput.onchange = (e) => {
                              const target = e.target as HTMLInputElement;
                              if (target.files) {
                                const files = Array.from(target.files);
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
                              }
                            };
                          }}
                        >
                          <Upload size={14} className="mr-2" />
                          Upload More
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      <AnimatePresence>
                        {resumes
                          .filter(
                            (resume) =>
                              !searchQuery ||
                              resume.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                          )
                          .map((resume, index) => (
                            <motion.div
                              key={resume.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                            >
                              <ResumeItem
                                resume={resume}
                                onRemove={handleResumeRemove}
                                onSelect={() => {}} // Not needed for recruiter view
                                isSelected={false}
                              />
                            </motion.div>
                          ))}
                      </AnimatePresence>

                      {resumes.filter(
                        (resume) =>
                          !searchQuery ||
                          resume.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No candidates match your search query
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {resumes.length > 0 && (
                <div className="pt-4">
                  <Button
                    onClick={handleBatchAnalyze}
                    disabled={!canAnalyze || isAnalyzing}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing {resumes.length} Candidates...
                      </>
                    ) : (
                      <>
                        Analyze All Candidates
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
          {sortedAnalyses.length > 0 && (
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-between items-start"
              >
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Candidate Matches
                  </h2>
                  <p className="text-muted-foreground">
                    {jobDescription?.title} • {sortedAnalyses.length} candidates
                    analyzed
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBackToSetup}>
                    Back to Setup
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download size={16} />
                    Export Report
                  </Button>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-12 gap-8">
                {/* Left Sidebar - Candidate List */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="md:col-span-4"
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users size={18} />
                          Candidates
                        </CardTitle>
                        <Badge variant="outline">{sortedAnalyses.length}</Badge>
                      </div>
                      <CardDescription>Ranked by match score</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="px-4 pb-2">
                        <div className="relative w-full">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search candidates..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="max-h-[500px] overflow-y-auto">
                        {sortedAnalyses.map((analysis, index) => {
                          const resume = resumes.find(
                            (r) => r.id === analysis.resumeId
                          );
                          if (!resume) return null;

                          return (
                            <motion.div
                              key={analysis.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: 0.05 * index,
                              }}
                              onClick={() => setSelectedCandidateIndex(index)}
                              className={cn(
                                "p-4 border-b cursor-pointer transition-colors",
                                selectedCandidateIndex === index
                                  ? "bg-primary/5 border-primary"
                                  : "hover:bg-muted/50"
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex gap-3">
                                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText size={20} />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">
                                      {resume.name}
                                    </h3>
                                    <div className="flex gap-1 items-center mt-1">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "text-xs",
                                          analysis.overallScore >= 80
                                            ? "bg-green-100 text-green-700"
                                            : analysis.overallScore >= 70
                                            ? "bg-blue-100 text-blue-700"
                                            : analysis.overallScore >= 60
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-red-100 text-red-700"
                                        )}
                                      >
                                        {analysis.overallScore}% Match
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-center min-w-[40px]">
                                  <MatchScore
                                    score={analysis.overallScore}
                                    size="sm"
                                    showText={false}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                        {sortedAnalyses.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No candidates match your search query
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Main Content - Candidate Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="md:col-span-8"
                >
                  {selectedCandidateIndex !== null &&
                  sortedAnalyses[selectedCandidateIndex] ? (
                    <motion.div
                      key={`detail-${selectedCandidateIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>
                                {
                                  resumes.find(
                                    (r) =>
                                      r.id ===
                                      sortedAnalyses[selectedCandidateIndex]
                                        .resumeId
                                  )?.name
                                }
                              </CardTitle>
                              <CardDescription>
                                {sortedAnalyses[selectedCandidateIndex].summary}
                              </CardDescription>
                            </div>
                            <MatchScore
                              score={
                                sortedAnalyses[selectedCandidateIndex]
                                  .overallScore
                              }
                              size="md"
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <Tabs defaultValue="overview">
                            <TabsList className="mb-4">
                              <TabsTrigger value="overview">
                                Overview
                              </TabsTrigger>
                              <TabsTrigger value="skills">Skills</TabsTrigger>
                              <TabsTrigger value="experience">
                                Experience
                              </TabsTrigger>
                              <TabsTrigger value="fit">Job Fit</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                              <div className="space-y-6">
                                <div>
                                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <BarChart
                                      size={18}
                                      className="text-primary"
                                    />
                                    Section Scores
                                  </h3>

                                  <div className="space-y-4">
                                    {sortedAnalyses[
                                      selectedCandidateIndex
                                    ].sectionScores.map((section, idx) => (
                                      <div
                                        key={`section-${idx}`}
                                        className="space-y-1"
                                      >
                                        <div className="flex justify-between items-baseline">
                                          <span className="font-medium text-sm">
                                            {section.name}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                              Weight: {section.weight}%
                                            </span>
                                            <span
                                              className={cn(
                                                "text-sm font-medium",
                                                section.score >= 80
                                                  ? "text-green-500"
                                                  : section.score >= 60
                                                  ? "text-blue-500"
                                                  : section.score >= 40
                                                  ? "text-amber-500"
                                                  : "text-red-500"
                                              )}
                                            >
                                              {section.score}%
                                            </span>
                                          </div>
                                        </div>

                                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                              width: `${section.score}%`,
                                            }}
                                            transition={{ duration: 1 }}
                                            className={cn(
                                              "h-full rounded-full",
                                              section.score >= 80
                                                ? "bg-green-500"
                                                : section.score >= 60
                                                ? "bg-blue-500"
                                                : section.score >= 40
                                                ? "bg-amber-500"
                                                : "bg-red-500"
                                            )}
                                          />
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                          {section.details}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3">
                                      Strengths
                                    </h3>
                                    <ul className="space-y-2">
                                      {sortedAnalyses[
                                        selectedCandidateIndex
                                      ].skillMatches
                                        .filter((skill) => skill.match >= 80)
                                        .slice(0, 3)
                                        .map((skill, idx) => (
                                          <li
                                            key={idx}
                                            className="flex gap-2 items-start"
                                          >
                                            <CheckCircle
                                              size={16}
                                              className="text-green-500 mt-0.5"
                                            />
                                            <div>
                                              <span className="font-medium">
                                                {skill.skill}
                                              </span>
                                              <p className="text-sm text-muted-foreground">
                                                {skill.suggestions ||
                                                  `Strong match with job requirements`}
                                              </p>
                                            </div>
                                          </li>
                                        ))}
                                    </ul>
                                  </div>

                                  <div>
                                    <h3 className="text-lg font-semibold mb-3">
                                      Areas to Discuss
                                    </h3>
                                    <ul className="space-y-2">
                                      {sortedAnalyses[
                                        selectedCandidateIndex
                                      ].skillMatches
                                        .filter((skill) => skill.match < 65)
                                        .slice(0, 3)
                                        .map((skill, idx) => (
                                          <li
                                            key={idx}
                                            className="flex gap-2 items-start"
                                          >
                                            <AlertTriangle
                                              size={16}
                                              className="text-amber-500 mt-0.5"
                                            />
                                            <div>
                                              <span className="font-medium">
                                                {skill.skill}
                                              </span>
                                              <p className="text-sm text-muted-foreground">
                                                {skill.suggestions ||
                                                  `Gap between resume and job requirements`}
                                              </p>
                                            </div>
                                          </li>
                                        ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="skills">
                              <div className="space-y-6">
                                <SkillsMatchChart
                                  skills={
                                    sortedAnalyses[selectedCandidateIndex]
                                      .skillMatches
                                  }
                                />
                              </div>
                            </TabsContent>

                            <TabsContent value="experience">
                              <div className="space-y-4">
                                {sortedAnalyses[
                                  selectedCandidateIndex
                                ].experienceMatches.map((exp, idx) => (
                                  <Card
                                    key={`exp-match-${idx}`}
                                    className="overflow-hidden"
                                  >
                                    <div className="flex flex-col sm:flex-row">
                                      <div className="p-4 flex-1">
                                        <h4 className="font-medium">
                                          {exp.area}
                                        </h4>
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
                                            "Experience aligns with job requirements."}
                                        </p>
                                      </div>
                                      <div className="p-4 bg-muted/30 w-full sm:w-32 flex sm:flex-col items-center justify-between gap-2 border-t sm:border-t-0 sm:border-l">
                                        <div className="text-center">
                                          <div className="text-xs text-muted-foreground">
                                            Candidate
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
                            </TabsContent>

                            <TabsContent value="fit">
                              <div className="space-y-6">
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">
                                    Education Match
                                  </h3>
                                  <div className="space-y-3">
                                    {sortedAnalyses[
                                      selectedCandidateIndex
                                    ].educationMatches.map((edu, idx) => (
                                      <motion.div
                                        key={`edu-${idx}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          duration: 0.3,
                                          delay: idx * 0.1,
                                        }}
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
                                </div>

                                <div>
                                  <h3 className="text-lg font-semibold mb-3">
                                    Keyword Analysis
                                  </h3>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-border">
                                      <thead>
                                        <tr className="text-left text-xs font-medium text-muted-foreground">
                                          <th className="px-4 py-3">Keyword</th>
                                          <th className="px-4 py-3">
                                            Importance
                                          </th>
                                          <th className="px-4 py-3">
                                            In Resume
                                          </th>
                                          <th className="px-4 py-3">In Job</th>
                                          <th className="px-4 py-3">Match</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border">
                                        {sortedAnalyses[
                                          selectedCandidateIndex
                                        ].keywordMatches
                                          .sort(
                                            (a, b) =>
                                              b.importance - a.importance
                                          )
                                          .map((keyword, idx) => {
                                            // Calculate match percentage
                                            const matchPercentage =
                                              keyword.occurrencesInResume > 0
                                                ? Math.min(
                                                    100,
                                                    Math.round(
                                                      (keyword.occurrencesInResume /
                                                        Math.max(
                                                          1,
                                                          keyword.occurrencesInJob
                                                        )) *
                                                        100
                                                    )
                                                  )
                                                : 0;

                                            return (
                                              <tr key={idx} className="text-sm">
                                                <td className="px-4 py-2 font-medium">
                                                  {keyword.keyword}
                                                </td>
                                                <td className="px-4 py-2">
                                                  {keyword.importance}%
                                                </td>
                                                <td className="px-4 py-2">
                                                  {keyword.occurrencesInResume}
                                                </td>
                                                <td className="px-4 py-2">
                                                  {keyword.occurrencesInJob}
                                                </td>
                                                <td className="px-4 py-2">
                                                  <Badge
                                                    variant="outline"
                                                    className={cn(
                                                      "text-xs",
                                                      matchPercentage >= 80
                                                        ? "bg-green-100 text-green-700"
                                                        : matchPercentage >= 50
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-amber-100 text-amber-700"
                                                    )}
                                                  >
                                                    {matchPercentage}%
                                                  </Badge>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[400px] bg-muted/10 rounded-lg border border-dashed">
                      <div className="text-center p-6">
                        <div className="mb-4 flex justify-center">
                          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                            <FileText size={24} />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium">
                          Select a Candidate
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Click on a candidate from the list to view their
                          detailed match analysis
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedRecruiterInterface;
