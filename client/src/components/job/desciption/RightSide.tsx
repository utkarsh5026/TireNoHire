import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  FaBriefcase,
  FaLayerGroup,
  FaAward,
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaChevronUp,
  FaDollarSign,
  FaIndustry,
  FaHeart,
  FaClipboardCheck,
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { JobPosting } from "../hooks/use-job";
import { getBenefitIcon, getSkillIcon } from "@/components/shared/icons";

interface RightSideProps {
  jobDescription: JobPosting;
}

const RightSide: React.FC<RightSideProps> = ({ jobDescription }) => {
  const {
    skills,
    benefits,
    company,
    location,
    type,
    seniority,
    salary_range,
    industry,
  } = jobDescription;

  const skillsRef = useRef(null);
  const benefitsRef = useRef(null);
  const detailsRef = useRef(null);

  const skillsInView = useInView(skillsRef, { once: true, amount: 0.2 });
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.2 });
  const detailsInView = useInView(detailsRef, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <div className="space-y-6 sticky top-4 h-fit">
      {/* Skills */}
      <motion.div
        ref={skillsRef}
        variants={containerVariants}
        initial="hidden"
        animate={skillsInView ? "visible" : "hidden"}
      >
        <Card className="shadow-md border-t-4 border-t-primary overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FaLayerGroup size={18} className="text-primary" />
              Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <motion.div key={skill} variants={itemVariants} custom={index}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="py-1.5 px-3 transition-all duration-300 hover:bg-primary/20 hover:shadow-sm cursor-default flex gap-1.5 items-center"
                        >
                          <span
                            className={`devicon-${skill
                              .toLowerCase()
                              .replace(/\s/g, "")}-plain colored text-sm`}
                          >
                            {getSkillIcon(skill)}
                          </span>
                          {skill}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Required skill</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Benefits */}
      {benefits && benefits.length > 0 && (
        <motion.div
          ref={benefitsRef}
          variants={containerVariants}
          initial="hidden"
          animate={benefitsInView ? "visible" : "hidden"}
        >
          <Card className="shadow-md border-t-4 border-t-green-500 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FaAward size={18} className="text-green-500" />
                Benefits & Perks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    variants={itemVariants}
                    custom={index}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <span className="flex-shrink-0 mt-0.5">
                      {getBenefitIcon(benefit)}
                    </span>
                    <span className="text-sm">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Job Details Summary */}
      <motion.div
        ref={detailsRef}
        variants={containerVariants}
        initial="hidden"
        animate={detailsInView ? "visible" : "hidden"}
      >
        <Card className="shadow-md border-t-4 border-t-blue-500 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FaBriefcase size={18} className="text-blue-500" />
              Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {company && (
              <motion.div
                className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors"
                variants={itemVariants}
                custom={0}
              >
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <FaBuilding size={14} className="text-blue-500" />
                  Company:
                </span>
                <span className="text-sm font-medium">{company}</span>
              </motion.div>
            )}

            {location && (
              <motion.div
                className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors"
                variants={itemVariants}
                custom={1}
              >
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <FaMapMarkerAlt size={14} className="text-red-500" />
                  Location:
                </span>
                <span className="text-sm font-medium">{location}</span>
              </motion.div>
            )}

            {type && (
              <motion.div
                className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors"
                variants={itemVariants}
                custom={2}
              >
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <FaClock size={14} className="text-amber-500" />
                  Job Type:
                </span>
                <span className="text-sm font-medium">{type}</span>
              </motion.div>
            )}

            {seniority && (
              <motion.div
                className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors"
                variants={itemVariants}
                custom={3}
              >
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <FaChevronUp size={14} className="text-green-500" />
                  Experience Level:
                </span>
                <span className="text-sm font-medium">{seniority}</span>
              </motion.div>
            )}

            {salary_range && (
              <motion.div
                className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors"
                variants={itemVariants}
                custom={4}
              >
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <FaDollarSign size={14} className="text-emerald-500" />
                  Salary Range:
                </span>
                <span className="text-sm font-medium">{salary_range}</span>
              </motion.div>
            )}

            {industry && (
              <motion.div
                className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md transition-colors"
                variants={itemVariants}
                custom={5}
              >
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <FaIndustry size={14} className="text-purple-500" />
                  Industry:
                </span>
                <span className="text-sm font-medium">{industry}</span>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="pt-2 flex justify-center">
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              size="lg"
            >
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <FaHeart className="h-4 w-4" />
                Apply Now
              </motion.div>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Add Floating Help Button */}
      <motion.div
        className="fixed bottom-6 right-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 1.5,
          duration: 0.5,
          type: "spring",
          stiffness: 300,
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600"
              >
                <FaClipboardCheck size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Analyze your resume match</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </div>
  );
};

export default RightSide;
