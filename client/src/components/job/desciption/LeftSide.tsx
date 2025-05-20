import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { JobRequirements as JobRequirementsType } from "@/types/job";
import { JobPosting } from "../hooks/use-job";
import {
  JobRequirements,
  RequiredQualifications,
  JobResponsibilities,
  JobPreferredQualifications,
  JobDescriptionComponent,
} from "./components";

interface LeftSideProps {
  jobDescription: JobPosting;
}

const groupRequirementsByCategory = (requirements: JobRequirementsType[]) => {
  return requirements.reduce((grouped, req) => {
    const category = req.category;

    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(req);
    return grouped;
  }, {} as Record<string, JobRequirementsType[]>);
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

  return (
    <div className="md:col-span-2 space-y-8">
      {/* Job Description */}
      <motion.div
        ref={descriptionRef}
        variants={containerVariants}
        initial="hidden"
        animate={descriptionInView ? "visible" : "hidden"}
      >
        <JobDescriptionComponent jobDescription={jobDescription} />
      </motion.div>

      {/* Responsibilities */}
      <motion.div
        ref={responsibilitiesRef}
        variants={containerVariants}
        initial="hidden"
        animate={responsibilitiesInView ? "visible" : "hidden"}
      >
        <JobResponsibilities
          responsibilities={jobDescription.responsibilities}
        />
      </motion.div>

      {/* Required Qualifications */}
      <motion.div
        ref={qualificationsRef}
        variants={containerVariants}
        initial="hidden"
        animate={qualificationsInView ? "visible" : "hidden"}
      >
        <RequiredQualifications
          required_qualifications={jobDescription.required_qualifications}
        />
      </motion.div>

      {/* Requirements By Category */}
      <motion.div
        ref={requirementsRef}
        variants={containerVariants}
        initial="hidden"
        animate={requirementsInView ? "visible" : "hidden"}
      >
        <JobRequirements groupedRequirements={groupedRequirements} />
      </motion.div>

      {jobDescription.preferred_qualifications &&
        jobDescription.preferred_qualifications.length > 0 && (
          <motion.div
            ref={preferredRef}
            variants={containerVariants}
            initial="hidden"
            animate={preferredInView ? "visible" : "hidden"}
          >
            <JobPreferredQualifications
              preferred_qualifications={jobDescription.preferred_qualifications}
            />
          </motion.div>
        )}
    </div>
  );
};

export default LeftSide;
