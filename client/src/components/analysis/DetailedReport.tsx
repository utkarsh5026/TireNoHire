import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { AnimatedCard } from "../shared/AnimatedCard";
import { MatchAnalysis, SectionScore } from "@/types/resume";
import { SkillsMatchChart } from "./SkillMatchChart";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart,
  CheckCircle,
  CheckSquare,
  GraduationCap,
  Zap,
} from "lucide-react";

interface DetailedReportProps {
  analysis: MatchAnalysis;
  className?: string;
}

export const DetailedReport: React.FC<DetailedReportProps> = ({
  analysis,
  className,
}) => {
  // Helper function to get color for score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  // Render section scores as a bar chart
  const renderSectionScores = (sectionScores: SectionScore[]) => {
    return (
      <div className="space-y-4">
        {sectionScores.map((section, index) => (
          <motion.div
            key={`section-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="space-y-1"
          >
            <div className="flex justify-between items-baseline">
              <span className="font-medium text-sm">{section.name}</span>
              <span
                className={cn(
                  "text-sm font-medium",
                  getScoreColor(section.score)
                )}
              >
                {section.score}%
              </span>
            </div>

            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${section.score}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
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

            <p className="text-xs text-muted-foreground">{section.details}</p>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <AnimatedCard className="p-6 space-y-4" delay={0} hoverEffect={false}>
        <div className="flex items-center gap-2">
          <BarChart size={20} className="text-primary" />
          <h2 className="text-xl font-semibold">Match Analysis</h2>
        </div>

        <p className="text-muted-foreground">{analysis.summary}</p>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AnimatedCard delay={0.5} className="p-0 shadow-none border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare size={18} className="text-primary" />
                  Section Scores
                </CardTitle>
                <CardDescription>
                  Your resume's performance in key job requirement areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderSectionScores(analysis.sectionScores)}
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={0.8} className="p-0 shadow-none border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap size={18} className="text-primary" />
                  Key Matches
                </CardTitle>
                <CardDescription>
                  Areas where your resume strongly aligns with the job
                  requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.skillMatches
                    .filter((skill) => skill.match >= 70)
                    .slice(0, 3)
                    .map((skill, idx) => (
                      <motion.li
                        key={`key-match-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * idx }}
                        className="flex gap-2 items-start"
                      >
                        <CheckCircle
                          size={16}
                          className="text-green-500 mt-0.5"
                        />
                        <span>
                          <span className="font-medium">{skill.skill}</span>:{" "}
                          {skill.suggestions ||
                            `Strong match with job requirements`}
                        </span>
                      </motion.li>
                    ))}
                </ul>
              </CardContent>
            </AnimatedCard>

            <AnimatedCard delay={1.1} className="p-0 shadow-none border-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  Improvement Areas
                </CardTitle>
                <CardDescription>
                  Key areas to address to improve your match score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.improvementSuggestions
                    .filter((suggestion) => suggestion.priority === "High")
                    .slice(0, 3)
                    .map((suggestion, idx) => (
                      <motion.li
                        key={`improvement-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * idx }}
                        className="flex gap-2 items-start"
                      >
                        <Badge
                          variant="outline"
                          className="text-xs px-1 py-0 h-5 mt-0.5 bg-amber-500/10 text-amber-600 border-amber-200"
                        >
                          {suggestion.section}
                        </Badge>
                        <span>{suggestion.suggestion}</span>
                      </motion.li>
                    ))}
                </ul>
              </CardContent>
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="skills">
            <AnimatedCard className="p-4" hoverEffect={false}>
              <SkillsMatchChart skills={analysis.skillMatches} />
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="experience">
            <AnimatedCard className="p-4 space-y-4" hoverEffect={false}>
              <h3 className="text-lg font-semibold">Experience Match</h3>

              {analysis.experienceMatches.map((exp, idx) => (
                <Card key={`exp-match-${idx}`} className="overflow-hidden">
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
                        <div className="text-xs text-muted-foreground">You</div>
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
                        <div className="text-xs text-muted-foreground">Job</div>
                        <div className="text-lg font-bold text-primary">
                          {exp.jobRequirement}%
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="education">
            <AnimatedCard className="p-4 space-y-4" hoverEffect={false}>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap size={18} />
                Education Requirements
              </h3>

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
                        <AlertTriangle size={14} className="text-amber-600" />
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
            </AnimatedCard>
          </TabsContent>
        </Tabs>
      </AnimatedCard>
    </div>
  );
};
