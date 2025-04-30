import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  HelpCircleIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SkillMatch } from "@/types/resume";

interface SkillsMatchChartProps {
  skills: SkillMatch[];
  className?: string;
}

export const SkillsMatchChart: React.FC<SkillsMatchChartProps> = ({
  skills,
  className,
}) => {
  // Sort skills by job importance
  const sortedSkills = [...skills].sort(
    (a, b) => b.jobImportance - a.jobImportance
  );

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="text-lg font-semibold">Skills Match Analysis</h3>

      <div className="space-y-4">
        {sortedSkills.map((skill, index) => {
          // Determine match indicator
          let MatchIndicator;
          let matchColor;

          if (skill.match >= 75) {
            MatchIndicator = (
              <ArrowUpIcon className="text-green-500" size={16} />
            );
            matchColor = "text-green-500";
          } else if (skill.match >= 50) {
            MatchIndicator = <MinusIcon className="text-blue-500" size={16} />;
            matchColor = "text-blue-500";
          } else {
            MatchIndicator = (
              <ArrowDownIcon className="text-red-500" size={16} />
            );
            matchColor = "text-red-500";
          }

          return (
            <motion.div
              key={`skill-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{skill.skill}</span>

                  {/* Job importance indicator */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "px-1.5 py-0.5 rounded text-xs font-medium",
                            skill.jobImportance >= 80
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {skill.jobImportance >= 80 ? "Key" : "Relevant"}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Job Importance: {skill.jobImportance}%</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="flex items-center gap-1">
                  {MatchIndicator}
                  <span className={cn("font-medium text-sm", matchColor)}>
                    {skill.match}%
                  </span>
                </div>
              </div>

              {/* Skill bar comparison */}
              <div className="flex gap-2 items-center">
                <div className="w-full h-7 bg-muted rounded-md overflow-hidden flex">
                  {/* Resume skill level */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.resumeLevel}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="h-full bg-primary/30 flex items-center justify-end px-2"
                  >
                    <span className="text-xs font-medium text-foreground">
                      You
                    </span>
                  </motion.div>

                  {/* Job requirement level */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - skill.resumeLevel}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="h-full bg-transparent flex items-center px-2"
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      Job
                    </span>
                  </motion.div>
                </div>

                {/* Info tooltip for skill details */}
                {skill.suggestions && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <HelpCircleIcon
                            size={16}
                            className="text-muted-foreground"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p className="text-sm">{skill.suggestions}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
