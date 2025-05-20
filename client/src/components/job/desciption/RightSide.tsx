import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { JobPosting } from "../hooks/use-job";
import { JobDetails, JobSkills, JobBenefits } from "./components";

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

  return (
    <div className="space-y-6 sticky top-4 h-fit">
      {/* Skills */}
      <motion.div
        ref={skillsRef}
        variants={containerVariants}
        initial="hidden"
        animate={skillsInView ? "visible" : "hidden"}
      >
        <JobSkills skills={skills} />
      </motion.div>

      {/* Benefits */}
      {benefits && benefits.length > 0 && (
        <motion.div
          ref={benefitsRef}
          variants={containerVariants}
          initial="hidden"
          animate={benefitsInView ? "visible" : "hidden"}
        >
          <JobBenefits benefits={benefits} />
        </motion.div>
      )}

      {/* Job Details Summary */}
      <motion.div
        ref={detailsRef}
        variants={containerVariants}
        initial="hidden"
        animate={detailsInView ? "visible" : "hidden"}
      >
        <JobDetails
          company={company}
          location={location}
          type={type}
          seniority={seniority}
          salary_range={salary_range}
          industry={industry}
          apply_url={""}
        />
      </motion.div>
    </div>
  );
};

export default RightSide;
