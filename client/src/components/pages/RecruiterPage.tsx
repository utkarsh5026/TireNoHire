import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressIndicator } from "@/components/shared/ProgressIndicator";
import { ResumeUploader } from "@/components/resume/ResumeLoader";
import { ResumeList } from "@/components/resume/ResumeList";
import { JobDescriptionInput } from "@/components/job/JobDescriptionInput";
import { MatchScore } from "@/components/analysis/MatchScore";
import { DetailedReport } from "@/components/analysis/DetailedReport";
import { ResumeFile, JobDescription, MatchAnalysis } from "@/types/resume";
import {
  ArrowRight,
  Loader2,
  Download,
  RefreshCw,
  Search,
  FileText,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const RecruiterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<MatchAnalysis[]>([]);

  const steps = [
    {
      id: "job",
      label: "Job Description",
      description: "Define job requirements",
    },
    {
      id: "resumes",
      label: "Candidate Resumes",
      description: "Upload resumes to analyze",
    },
    {
      id: "results",
      label: "Match Results",
      description: "Compare candidates",
    },
  ];

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

  const handleJobDescriptionSubmit = (jobDesc: JobDescription) => {
    setJobDescription(jobDesc);
  };

  const handleAnalyze = () => {
    if (resumes.length === 0 || !jobDescription) return;

    setIsAnalyzing(true);

    // In a real app, this would be an API call
    setTimeout(() => {
      // Create mock analyses for each resume
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
      setCurrentStep(2); // Move to results step
    }, 3000);
  };

  const canProceedToResumes = jobDescription?.status === "ready";
  const canProceedToResults = resumes.length > 0;

  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<
    number | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Sort analyses by score in descending order and filter by search query
  const sortedAnalyses = [...analyses]
    .sort((a, b) => b.overallScore - a.overallScore)
    .filter((analysis) => {
      if (!searchQuery) return true;

      const resume = resumes.find((r) => r.id === analysis.resumeId);
      if (!resume) return false;

      return resume.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="mb-12">
        <ProgressIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            // Only allow going back or to a valid step
            if (
              step < currentStep ||
              (step === 1 && canProceedToResumes) ||
              (step === 2 && analyses.length > 0)
            ) {
              setCurrentStep(step);
            }
          }}
          className="mb-8"
        />

        {/* Step Content */}
        <motion.div
          key={`step-${currentStep}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[70vh] py-6"
        >
          {currentStep === 0 && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Define Job Requirements
                  </h2>
                  <p className="text-muted-foreground">
                    Add your job description to establish the baseline for
                    candidate matching.
                  </p>
                </div>

                <JobDescriptionInput
                  onJobDescriptionSubmit={handleJobDescriptionSubmit}
                  isProcessing={jobDescription?.status === "ready"}
                />

                <div className="pt-4">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    disabled={!canProceedToResumes}
                    className="gap-2"
                  >
                    Continue to Candidate Resumes
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-6 border">
                <h3 className="font-semibold mb-4">
                  Why define the job first?
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-2">
                    <div className="text-primary font-bold mt-0.5">•</div>
                    <div>
                      <span className="font-medium">Objective Analysis</span>:
                      Establishing job requirements first ensures all candidates
                      are evaluated against the same criteria
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="text-primary font-bold mt-0.5">•</div>
                    <div>
                      <span className="font-medium">Clear Requirements</span>:
                      Helps identify key skills, experience, and qualifications
                      needed for the position
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="text-primary font-bold mt-0.5">•</div>
                    <div>
                      <span className="font-medium">Better Matches</span>:
                      Allows our AI to identify the most suitable candidates
                      based on job-specific priorities
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <div className="text-primary font-bold mt-0.5">•</div>
                    <div>
                      <span className="font-medium">Reduced Bias</span>: Focus
                      on job requirements first helps minimize unconscious bias
                      in the candidate evaluation process
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid md:grid-cols-5 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Upload Candidate Resumes
                  </h2>
                  <p className="text-muted-foreground">
                    Upload multiple candidate resumes to analyze and compare
                    against the job requirements.
                  </p>
                </div>

                <ResumeUploader onResumeAdd={handleResumeAdd} maxResumes={10} />

                <div className="pt-4 flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    Back
                  </Button>

                  <Button
                    onClick={handleAnalyze}
                    disabled={!canProceedToResults || isAnalyzing}
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing Candidates...
                      </>
                    ) : (
                      <>
                        Analyze Candidates
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="md:col-span-3">
                <h3 className="font-medium mb-4">
                  Uploaded Resumes ({resumes.length})
                </h3>
                <ResumeList
                  resumes={resumes}
                  onResumeRemove={handleResumeRemove}
                  onResumeSelect={() => {}}
                  selectedResumeIds={[]}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && analyses.length > 0 && (
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Candidate Matches
                  </h2>
                  <p className="text-muted-foreground">
                    Review how well each candidate matches the job requirements.
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
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
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => setSelectedCandidateIndex(index)}
                        className={`cursor-pointer border rounded-lg p-4 transition-all ${
                          selectedCandidateIndex === index
                            ? "border-primary bg-primary/5"
                            : "hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                              <FileText size={20} />
                            </div>
                            <div>
                              <h3 className="font-medium">{resume.name}</h3>
                              <div className="flex gap-1 items-center mt-1">
                                <Badge
                                  variant="outline"
                                  className={`
                                    ${
                                      analysis.overallScore >= 80
                                        ? "bg-green-100 text-green-700"
                                        : analysis.overallScore >= 70
                                        ? "bg-blue-100 text-blue-700"
                                        : analysis.overallScore >= 60
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-red-100 text-red-700"
                                    }
                                  `}
                                >
                                  {analysis.overallScore}% Match
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    analysis.createdAt
                                  ).toLocaleDateString()}
                                </span>
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

                <div className="pt-4 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setIsAnalyzing(true);
                      setTimeout(() => {
                        setIsAnalyzing(false);
                      }, 1500);
                    }}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Refresh Analysis
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setCurrentStep(1)}
                  >
                    <FileText size={16} />
                    Back to Resumes
                  </Button>
                </div>
              </div>

              <div className="md:col-span-8">
                {selectedCandidateIndex !== null &&
                sortedAnalyses[selectedCandidateIndex] ? (
                  <motion.div
                    key={`detail-${selectedCandidateIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          Candidate Analysis
                        </h2>
                        <p className="text-muted-foreground">
                          Detailed report for{" "}
                          {
                            resumes.find(
                              (r) =>
                                r.id ===
                                sortedAnalyses[selectedCandidateIndex].resumeId
                            )?.name
                          }
                        </p>
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Download size={16} />
                        Export Report
                      </Button>
                    </div>

                    <Tabs defaultValue="overview">
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="detailed">
                          Detailed Analysis
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <Card className="lg:col-span-1">
                            <CardContent className="p-6 flex flex-col items-center">
                              <MatchScore
                                score={
                                  sortedAnalyses[selectedCandidateIndex]
                                    .overallScore
                                }
                                size="lg"
                              />
                              <p className="mt-4 text-center text-muted-foreground">
                                {sortedAnalyses[selectedCandidateIndex].summary}
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="lg:col-span-2">
                            <CardContent className="p-6">
                              <h3 className="font-semibold mb-4">
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
                                          className={`text-sm font-medium ${
                                            section.score >= 80
                                              ? "text-green-500"
                                              : section.score >= 60
                                              ? "text-blue-500"
                                              : section.score >= 40
                                              ? "text-amber-500"
                                              : "text-red-500"
                                          }`}
                                        >
                                          {section.score}%
                                        </span>
                                      </div>
                                    </div>

                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${section.score}%` }}
                                        transition={{ duration: 1 }}
                                        className={`h-full rounded-full ${
                                          section.score >= 80
                                            ? "bg-green-500"
                                            : section.score >= 60
                                            ? "bg-blue-500"
                                            : section.score >= 40
                                            ? "bg-amber-500"
                                            : "bg-red-500"
                                        }`}
                                      />
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                      {section.details}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="detailed">
                        <DetailedReport
                          analysis={sortedAnalyses[selectedCandidateIndex]}
                        />
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[50vh] bg-muted/10 rounded-lg border border-dashed">
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
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
