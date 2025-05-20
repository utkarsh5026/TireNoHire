import React from "react";
import { motion } from "framer-motion";
import { FaBriefcase, FaQuoteLeft, FaChevronRight } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JobPosting } from "../../hooks/use-job";

interface JobDescriptionProps {
  jobDescription: JobPosting;
}

const JobDescriptionComponent: React.FC<JobDescriptionProps> = ({
  jobDescription,
}) => {
  return (
    <Card className="shadow-md border-l-4 border-l-primary overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaBriefcase size={20} className="text-primary" />
          Job Overview
        </CardTitle>
        <CardDescription>
          Overview of the position and company expectations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* First sentence as highlight quote */}
        <div className="bg-primary/5 rounded-md p-4 border border-primary/10">
          <div className="flex gap-3">
            <FaQuoteLeft className="text-primary/60 h-5 w-5 flex-shrink-0 mt-1" />
            <p className="italic text-muted-foreground">
              {jobDescription.description.split(".")[0].trim() + "."}
            </p>
          </div>
        </div>

        <Separator />

        {/* Rest of the description as bullet points */}
        <div className="space-y-4">
          {jobDescription.description
            .split(".")
            .slice(1)
            .filter((line) => line.trim())
            .map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                className="flex gap-3 group"
              >
                <div className="flex-shrink-0 mt-1 text-primary/80 group-hover:text-primary transition-colors">
                  <FaChevronRight className="h-3.5 w-3.5" />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {line.trim()}
                </p>
              </motion.div>
            ))}
        </div>

        {/* Industry badge */}
        {jobDescription.industry && (
          <div className="pt-2">
            <Badge variant="outline" className="bg-primary/5 text-primary">
              {jobDescription.company}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobDescriptionComponent;
