import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Star,
  CheckCircle,
  CircleDashed,
  GraduationCap,
  Layers,
  BadgeCheck,
  Award,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { JobDescription, JobRequirements } from "@/types/job";

interface LeftSideProps {
  jobDescription: JobDescription;
}

const groupRequirementsByCategory = (requirements: JobRequirements[]) => {
  return requirements.reduce((grouped, req) => {
    const category = req.category;

    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(req);
    return grouped;
  }, {} as Record<string, JobRequirements[]>);
};

// Format category names for display
const formatCategory = (category: string) => {
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Get an icon for a category
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "technical":
      return <Layers size={16} />;
    case "soft skill":
      return <Award size={16} />;
    case "experience":
      return <Briefcase size={16} />;
    default:
      return <Filter size={16} />;
  }
};

const LeftSide: React.FC<LeftSideProps> = ({ jobDescription }) => {
  const groupedRequirements = groupRequirementsByCategory(
    jobDescription.requirements
  );
  return (
    <div className="md:col-span-2 space-y-8">
      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase size={20} className="text-primary" />
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line text-muted-foreground">
            {jobDescription.description}
          </p>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={20} className="text-primary" />
            Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {jobDescription.responsibilities.map((responsibility, index) => (
              <motion.li
                key={responsibility}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.05 * index }}
                className="flex gap-2"
              >
                <span className="text-primary">•</span>
                <span>{responsibility}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Required Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap size={20} className="text-primary" />
            Required Qualifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {jobDescription.required_qualifications.map(
              (qualification, index) => (
                <motion.li
                  key={qualification}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 * index }}
                  className="flex gap-2"
                >
                  <CheckCircle
                    size={16}
                    className="text-green-500 flex-shrink-0 mt-1"
                  />
                  <span>{qualification}</span>
                </motion.li>
              )
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Requirements By Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck size={20} className="text-primary" />
            Requirements
          </CardTitle>
          <CardDescription>
            Categorized by skill type and importance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedRequirements).map(
              ([category, requirements]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span>{formatCategory(category)} Requirements</span>
                      <Badge variant="outline" className="ml-2">
                        {requirements.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {requirements.map((req, index) => (
                        <motion.div
                          key={req.description}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.2,
                            delay: 0.05 * index,
                          }}
                          className="border rounded-md p-3"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-start gap-2">
                              {req.required ? (
                                <CheckCircle
                                  size={16}
                                  className="text-green-500 flex-shrink-0 mt-1"
                                />
                              ) : (
                                <CircleDashed
                                  size={16}
                                  className="text-blue-500 flex-shrink-0 mt-1"
                                />
                              )}
                              <span>{req.description}</span>
                            </div>
                            <Badge
                              variant={req.required ? "default" : "outline"}
                            >
                              {req.required ? "Required" : "Preferred"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              Importance:
                            </span>
                            <div className="flex-1">
                              <Progress
                                value={req.importance * 10}
                                className="h-2"
                              />
                            </div>
                            <div className="flex">
                              {Array.from({ length: req.importance }).map(
                                (_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className="text-amber-500 fill-amber-500"
                                  />
                                )
                              )}
                              {Array.from({
                                length: 10 - req.importance,
                              }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className="text-muted"
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            )}
          </Accordion>
        </CardContent>
      </Card>

      {/* Preferred Qualifications */}
      {jobDescription.preferred_qualifications &&
        jobDescription.preferred_qualifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={20} className="text-primary" />
                Preferred Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {jobDescription.preferred_qualifications.map(
                  (qualification, index) => (
                    <motion.li
                      key={qualification}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.05 * index }}
                      className="flex gap-2"
                    >
                      <CircleDashed
                        size={16}
                        className="text-blue-500 flex-shrink-0 mt-1"
                      />
                      <span>{qualification}</span>
                    </motion.li>
                  )
                )}
              </ul>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default LeftSide;
