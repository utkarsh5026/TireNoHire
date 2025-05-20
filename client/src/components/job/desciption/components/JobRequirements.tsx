import React from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaRegCircle, FaAward } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getCategoryIcon } from "@/components/shared/icons";
import type { JobRequirements as JobRequirementsType } from "@/types/job";

interface JobRequirementsProps {
  groupedRequirements: Record<string, JobRequirementsType[]>;
}

const formatCategory = (category: string) => {
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const JobRequirements: React.FC<JobRequirementsProps> = ({
  groupedRequirements,
}) => {
  return (
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
            ([category, requirements]) => (
              <div key={category}>
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
                        className="ml-2 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-none"
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
                              <span className="leading-relaxed text-muted-foreground">
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
                        </motion.div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </div>
            )
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default JobRequirements;
