import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/shared/ProgressIndicator";
import { ResumeUploader } from "@/components/resume/ResumeLoader";
import { ResumeList } from "@/components/resume/ResumeList";
import { JobDescriptionInput } from "@/components/job/JobDescriptionInput";
import { JobRequirementsList } from "@/components/job/JobRequirementsList";
import { MatchScore } from "@/components/analysis/MatchScore";
import { DetailedReport } from "@/components/analysis/DetailedReport";
import { ImprovementSuggestions } from "@/components/analysis/ImprovementSuggestions";
import { ResumeFile, JobDescription, MatchAnalysis } from "@/types/resume";
import { ArrowRight, Loader2, RefreshCw } from "lucide-react";

export const JobSeekerPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumes, setResumes] = useState<ResumeFile[]>([]);
  const [selectedResumeIds, setSelectedResumeIds] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);

  const steps = [
    { id: "resume", label: "Resume", description: "Upload your resume(s)" },
    { id: "job", label: "Job Description", description: "Add job details" },
    { id: "analysis", label: "Analysis", description: "Review match report" },
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
    setSelectedResumeIds((prev) => prev.filter((resumeId) => resumeId !== id));
  };

  const handleResumeSelect = (id: string) => {
    setSelectedResumeIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((resumeId) => resumeId !== id);
      }
      return [...prev, id];
    });
  };

  const handleJobDescriptionSubmit = (jobDesc: JobDescription) => {
    setJobDescription(jobDesc);
  };

  const handleAnalyze = () => {
    if (selectedResumeIds.length === 0 || !jobDescription) return;

    setIsAnalyzing(true);

    // In a real app, this would be an API call
    setTimeout(() => {
      // Mock analysis data
      const mockAnalysis: MatchAnalysis = {
        id: crypto.randomUUID(),
        resumeId: selectedResumeIds[0],
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
      setCurrentStep(2); // Move to analysis step
    }, 3000);
  };

  const canProceedToJob = resumes.length > 0 && selectedResumeIds.length > 0;
  const canProceedToAnalysis = jobDescription?.status === "ready";

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4 font-source-code-pro">
      <div className="mb-12">
        <ProgressIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            // Only allow going back or to a valid step
            if (
              step < currentStep ||
              (step === 1 && canProceedToJob) ||
              (step === 2 && analysis)
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
            <div className="grid md:grid-cols-5 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Upload Your Resume
                  </h2>
                  <p className="text-muted-foreground">
                    Upload your resume file or provide a link. You can add
                    multiple versions to compare results.
                  </p>
                </div>

                <ResumeUploader onResumeAdd={handleResumeAdd} maxResumes={5} />

                <div className="pt-4">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    disabled={!canProceedToJob}
                    className="gap-2"
                  >
                    Continue to Job Description
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>

              <div className="md:col-span-3">
                <ResumeList
                  resumes={resumes}
                  onResumeRemove={handleResumeRemove}
                  onResumeSelect={handleResumeSelect}
                  selectedResumeIds={selectedResumeIds}
                />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid md:grid-cols-5 gap-8">
              <div className="md:col-span-3 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Add Job Description
                  </h2>
                  <p className="text-muted-foreground">
                    Paste the job description or provide a link to the job
                    posting.
                  </p>
                </div>

                <JobDescriptionInput
                  onJobDescriptionSubmit={handleJobDescriptionSubmit}
                  isProcessing={jobDescription?.status === "ready"}
                />

                <div className="pt-4 flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    Back
                  </Button>

                  <Button
                    onClick={handleAnalyze}
                    disabled={!canProceedToAnalysis || isAnalyzing}
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing Match...
                      </>
                    ) : (
                      <>
                        Analyze Match
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2">
                {jobDescription && jobDescription.status === "ready" && (
                  <JobRequirementsList job={jobDescription} />
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && analysis && (
            <div className="grid md:grid-cols-7 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Match Results</h2>
                  <p className="text-muted-foreground">
                    See how well your resume matches the job description.
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <MatchScore score={analysis.overallScore} size="lg" />

                  <div className="mt-8 w-full">
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
                  </div>

                  <div className="mt-2 w-full">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back to Job Description
                    </Button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 space-y-6">
                <DetailedReport analysis={analysis} />
                <ImprovementSuggestions analysis={analysis} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
