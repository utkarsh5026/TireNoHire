import React from "react";
import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  GraduationCap,
  Clock,
  MapPin,
  Award,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { JobDescription } from "@/types/resume";
import { cn } from "@/lib/utils";

interface JobRequirementsListProps {
  job: JobDescription;
  className?: string;
}

export const JobRequirementsList: React.FC<JobRequirementsListProps> = ({
  job,
  className,
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{job.title}</h2>
        {job.company && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <BriefcaseIcon size={16} />
            <span>{job.company}</span>
            {job.location && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{job.location}</span>
                </div>
              </>
            )}
            {job.type && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{job.type}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <AnimatedCard delay={1} hoverEffect={false} className="overflow-hidden">
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            Requirements
          </h3>

          <ul className="space-y-2">
            {job.requirements.map((requirement, index) => (
              <motion.li
                key={`requirement-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                className="flex gap-2"
              >
                <span className="text-primary font-bold">•</span>
                <span>{requirement}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </AnimatedCard>

      <AnimatedCard delay={2} hoverEffect={false} className="overflow-hidden">
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <BriefcaseIcon size={18} className="text-primary" />
            Responsibilities
          </h3>

          <ul className="space-y-2">
            {job.responsibilities.map((responsibility, index) => (
              <motion.li
                key={`responsibility-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                className="flex gap-2"
              >
                <span className="text-primary font-bold">•</span>
                <span>{responsibility}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </AnimatedCard>

      {job.preferredQualifications &&
        job.preferredQualifications.length > 0 && (
          <AnimatedCard
            delay={3}
            hoverEffect={false}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Award size={18} className="text-primary" />
                Preferred Qualifications
              </h3>

              <ul className="space-y-2">
                {job.preferredQualifications.map((qualification, index) => (
                  <motion.li
                    key={`qualification-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className="flex gap-2"
                  >
                    <span className="text-primary font-bold">•</span>
                    <span>{qualification}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </AnimatedCard>
        )}

      {job.benefits && job.benefits.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {job.benefits.map((benefit, index) => (
            <Badge key={`benefit-${index}`} variant="secondary">
              {benefit}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
