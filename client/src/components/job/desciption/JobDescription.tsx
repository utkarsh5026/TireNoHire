import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaClock,
  FaBuilding,
  FaChevronUp,
  FaDollarSign,
  FaBookmark,
  FaShare,
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import RightSide from "./RightSide";
import LeftSide from "./LeftSide";
import { JobPosting } from "../store/use-job-store";

const JobDescriptionPage: React.FC<{ jobDescription: JobPosting }> = ({
  jobDescription,
}) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }));
  }, [controls]);

  // Generate a random date for "posted X days ago"
  const randomDays = Math.floor(Math.random() * 7) + 1;

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Job Header with enhanced animations */}
      <motion.div
        className="mb-8 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Badge
                variant="outline"
                className="bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                {jobDescription.industry}
              </Badge>
              <span>•</span>
              <span>
                Posted {randomDays} {randomDays === 1 ? "day" : "days"} ago
              </span>
            </div>

            <motion.h1
              className="text-3xl font-bold tracking-tight mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {jobDescription.title}
            </motion.h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {jobDescription.company && (
                <motion.div
                  custom={0}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-2 text-muted-foreground group"
                >
                  <div className="p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FaBuilding className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{jobDescription.company}</span>
                </motion.div>
              )}

              {jobDescription.location && (
                <motion.div
                  custom={1}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-2 text-muted-foreground group"
                >
                  <div className="p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FaMapMarkerAlt className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{jobDescription.location}</span>
                </motion.div>
              )}

              {jobDescription.type && (
                <motion.div
                  custom={2}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-2 text-muted-foreground group"
                >
                  <div className="p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FaClock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{jobDescription.type}</span>
                </motion.div>
              )}

              {jobDescription.seniority && (
                <motion.div
                  custom={3}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-2 text-muted-foreground group"
                >
                  <div className="p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FaChevronUp className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{jobDescription.seniority} Level</span>
                </motion.div>
              )}

              {jobDescription.salary_range && (
                <motion.div
                  custom={4}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center gap-2 text-muted-foreground group"
                >
                  <div className="p-1.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FaDollarSign className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{jobDescription.salary_range}</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <TooltipProvider>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <Button
                size="lg"
                className="font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
              >
                Apply Now
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Button variant="outline" size="lg" className="gap-2 font-medium">
                <FaBookmark className="h-4 w-4" />
                Save Job
              </Button>
            </motion.div>

            <Tooltip>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <FaShare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
              </motion.div>
              <TooltipContent>
                <p>Share this job</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <LeftSide jobDescription={jobDescription} />
        <RightSide jobDescription={jobDescription} />
      </div>
    </div>
  );
};

export default JobDescriptionPage;
