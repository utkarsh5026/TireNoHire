import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Building,
  ChevronUp,
  BadgeDollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RightSide from "./RightSide";
import LeftSide from "./LeftSide";
import { JobPosting } from "../hooks/use-job";

const JobDescriptionPage: React.FC<{ jobDescription: JobPosting }> = ({
  jobDescription,
}) => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Job Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">{jobDescription.industry}</Badge>
            <span>•</span>
            <span>Posted 2 days ago</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {jobDescription.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            {jobDescription.company && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Building size={16} />
                <span>{jobDescription.company}</span>
              </div>
            )}

            {jobDescription.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin size={16} />
                <span>{jobDescription.location}</span>
              </div>
            )}

            {jobDescription.type && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock size={16} />
                <span>{jobDescription.type}</span>
              </div>
            )}

            {jobDescription.seniority && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <ChevronUp size={16} />
                <span>{jobDescription.seniority} Level</span>
              </div>
            )}

            {jobDescription.salary_range && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <BadgeDollarSign size={16} />
                <span>{jobDescription.salary_range}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button>Apply Now</Button>
            <Button variant="outline">Save Job</Button>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <LeftSide jobDescription={jobDescription} />

        <RightSide jobDescription={jobDescription} />
      </div>
    </div>
  );
};

export default JobDescriptionPage;
