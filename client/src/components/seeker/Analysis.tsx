import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/analysis/MatchScore";
import { SkillsMatchChart } from "@/components/analysis/SkillMatchChart";

import { ResumeFile, JobDescription, MatchAnalysis } from "@/types/resume";
import { cn } from "@/lib/utils";

interface AnalysisProps {
  analysis: MatchAnalysis;
  resumes: ResumeFile[];
  jobDescription: JobDescription;
  handleBackToEdit: () => void;
}

const Analysis: React.FC<AnalysisProps> = ({
  analysis,
  resumes,
  jobDescription,
  handleBackToEdit,
}) => {
  return (
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
                <p className="text-muted-foreground">{analysis.summary}</p>

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
                  <h4 className="font-medium text-sm">Areas to Improve</h4>
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
                    How your work experience aligns with job requirements
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
                            edu.fulfilled ? "bg-green-100" : "bg-amber-100"
                          )}
                        >
                          {edu.fulfilled ? (
                            <CheckCircle size={14} className="text-green-600" />
                          ) : (
                            <AlertTriangle
                              size={14}
                              className="text-amber-600"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{edu.requirement}</h4>
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
  );
};

export default Analysis;
