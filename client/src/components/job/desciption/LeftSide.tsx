import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  FaBriefcase,
  FaStar,
  FaCheckCircle,
  FaRegCircle,
  FaGraduationCap,
  FaAward,
} from "react-icons/fa";
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
import type { JobRequirements } from "@/types/job";
import { JobPosting } from "../hooks/use-job";
import { getCategoryIcon } from "@/components/shared/icons";

interface LeftSideProps {
  jobDescription: JobPosting;
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

const LeftSide: React.FC<LeftSideProps> = ({ jobDescription }) => {
  const groupedRequirements = groupRequirementsByCategory(
    jobDescription.requirements
  );

  const descriptionRef = useRef(null);
  const responsibilitiesRef = useRef(null);
  const qualificationsRef = useRef(null);
  const requirementsRef = useRef(null);
  const preferredRef = useRef(null);

  const descriptionInView = useInView(descriptionRef, {
    once: true,
    amount: 0.2,
  });
  const responsibilitiesInView = useInView(responsibilitiesRef, {
    once: true,
    amount: 0.2,
  });
  const qualificationsInView = useInView(qualificationsRef, {
    once: true,
    amount: 0.2,
  });
  const requirementsInView = useInView(requirementsRef, {
    once: true,
    amount: 0.2,
  });
  const preferredInView = useInView(preferredRef, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="md:col-span-2 space-y-8">
      {/* Job Description */}
      <motion.div
        ref={descriptionRef}
        variants={containerVariants}
        initial="hidden"
        animate={descriptionInView ? "visible" : "hidden"}
      >
        <Card className="shadow-md border-l-4 border-l-primary overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaBriefcase size={20} className="text-primary" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {jobDescription.description}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Responsibilities */}
      <motion.div
        ref={responsibilitiesRef}
        variants={containerVariants}
        initial="hidden"
        animate={responsibilitiesInView ? "visible" : "hidden"}
      >
        <Card className="shadow-md border-l-4 border-l-green-500 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaCheckCircle size={20} className="text-green-500" />
              Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {jobDescription.responsibilities.map((responsibility, index) => (
                <motion.li
                  key={responsibility}
                  variants={itemVariants}
                  custom={index}
                  className="flex gap-3 items-start p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <span className="text-green-500 mt-1">
                    <FaCheckCircle size={14} />
                  </span>
                  <span className="leading-relaxed">{responsibility}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Required Qualifications */}
      <motion.div
        ref={qualificationsRef}
        variants={containerVariants}
        initial="hidden"
        animate={qualificationsInView ? "visible" : "hidden"}
      >
        <Card className="shadow-md border-l-4 border-l-blue-500 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaGraduationCap size={20} className="text-blue-500" />
              Required Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {jobDescription.required_qualifications.map(
                (qualification, index) => (
                  <motion.li
                    key={qualification}
                    variants={itemVariants}
                    custom={index}
                    className="flex gap-3 items-start p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-blue-500 mt-1">
                      <FaCheckCircle size={14} />
                    </span>
                    <span className="leading-relaxed">{qualification}</span>
                  </motion.li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Requirements By Category */}
      <motion.div
        ref={requirementsRef}
        variants={containerVariants}
        initial="hidden"
        animate={requirementsInView ? "visible" : "hidden"}
      >
        <Card className="shadow-md border-l-4 border-l-amber-500 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaAward size={20} className="text-amber-500" />
              Requirements
            </CardTitle>
            <CardDescription>
              Categorized by skill type and importance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedRequirements).map(
                ([category, requirements], categoryIndex) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1, duration: 0.4 }}
                  >
                    <AccordionItem
                      value={category}
                      className="border-b border-b-muted/50"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-amber-500/10 text-amber-500">
                            {getCategoryIcon(category)}
                          </div>
                          <span className="font-medium">
                            {formatCategory(category)} Requirements
                          </span>
                          <Badge
                            variant="outline"
                            className="ml-2 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          >
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
                                duration: 0.3,
                                delay: 0.05 * index,
                              }}
                              className="border rounded-md p-4 hover:shadow-md transition-shadow bg-card"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-start gap-3">
                                  {req.required ? (
                                    <span className="text-green-500 flex-shrink-0 mt-1">
                                      <FaCheckCircle size={16} />
                                    </span>
                                  ) : (
                                    <span className="text-blue-500 flex-shrink-0 mt-1">
                                      <FaRegCircle size={16} />
                                    </span>
                                  )}
                                  <span className="leading-relaxed">
                                    {req.description}
                                  </span>
                                </div>
                                <Badge
                                  variant={req.required ? "default" : "outline"}
                                  className={
                                    req.required
                                      ? "bg-green-500 hover:bg-green-600"
                                      : "text-blue-500 border-blue-200 dark:border-blue-800"
                                  }
                                >
                                  {req.required ? "Required" : "Preferred"}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
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
                                      <FaStar
                                        key={i}
                                        size={12}
                                        className="text-amber-500"
                                      />
                                    )
                                  )}
                                  {Array.from({
                                    length: 10 - req.importance,
                                  }).map((_, i) => (
                                    <FaStar
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
                  </motion.div>
                )
              )}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferred Qualifications */}
      {jobDescription.preferred_qualifications &&
        jobDescription.preferred_qualifications.length > 0 && (
          <motion.div
            ref={preferredRef}
            variants={containerVariants}
            initial="hidden"
            animate={preferredInView ? "visible" : "hidden"}
          >
            <Card className="shadow-md border-l-4 border-l-purple-500 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaStar size={20} className="text-purple-500" />
                  Preferred Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {jobDescription.preferred_qualifications.map(
                    (qualification, index) => (
                      <motion.li
                        key={qualification}
                        variants={itemVariants}
                        custom={index}
                        className="flex gap-3 items-start p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-purple-500 mt-1">
                          <FaRegCircle size={14} />
                        </span>
                        <span className="leading-relaxed">{qualification}</span>
                      </motion.li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
    </div>
  );
};

export default LeftSide;
