import React from "react";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { AnimatedCard } from "../shared/AnimatedCard";
import { MatchAnalysis } from "@/types/resume";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  ArrowUp,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";

interface ImprovementSuggestionsProps {
  analysis: MatchAnalysis;
  className?: string;
}

export const ImprovementSuggestions: React.FC<ImprovementSuggestionsProps> = ({
  analysis,
  className,
}) => {
  // Group suggestions by priority
  const highPriority = analysis.improvementSuggestions.filter(
    (s) => s.priority === "High"
  );
  const mediumPriority = analysis.improvementSuggestions.filter(
    (s) => s.priority === "Medium"
  );
  const lowPriority = analysis.improvementSuggestions.filter(
    (s) => s.priority === "Low"
  );

  // Helper to get priority styling
  const getPriorityStyles = (priority: "High" | "Medium" | "Low") => {
    switch (priority) {
      case "High":
        return {
          icon: <ArrowUp size={14} />,
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
        };
      case "Medium":
        return {
          icon: <ArrowRight size={14} />,
          bg: "bg-amber-100",
          text: "text-amber-700",
          border: "border-amber-200",
        };
      case "Low":
        return {
          icon: <CheckCircle size={14} />,
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-200",
        };
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <AnimatedCard className="p-6" delay={0} hoverEffect={false}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} className="text-primary" />
          <h2 className="text-xl font-semibold">Improvement Suggestions</h2>
        </div>

        <div className="space-y-6">
          {highPriority.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-red-500 flex items-center gap-1">
                <ArrowUp size={16} />
                High Priority
              </h3>

              {highPriority.map((suggestion, idx) => {
                const styles = getPriorityStyles(suggestion.priority);

                return (
                  <motion.div
                    key={`high-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="p-3 border rounded-lg bg-red-50/50"
                  >
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-min mt-0.5",
                          styles.bg,
                          styles.text,
                          styles.border
                        )}
                      >
                        {suggestion.section}
                      </Badge>
                      <p>{suggestion.suggestion}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {mediumPriority.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-amber-500 flex items-center gap-1">
                <ArrowRight size={16} />
                Medium Priority
              </h3>

              {mediumPriority.map((suggestion, idx) => {
                const styles = getPriorityStyles(suggestion.priority);

                return (
                  <motion.div
                    key={`medium-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-min mt-0.5",
                          styles.bg,
                          styles.text,
                          styles.border
                        )}
                      >
                        {suggestion.section}
                      </Badge>
                      <p>{suggestion.suggestion}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {lowPriority.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-green-500 flex items-center gap-1">
                <CheckCircle size={16} />
                Low Priority
              </h3>

              {lowPriority.map((suggestion, idx) => {
                const styles = getPriorityStyles(suggestion.priority);

                return (
                  <motion.div
                    key={`low-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + idx * 0.1 }}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-min mt-0.5",
                          styles.bg,
                          styles.text,
                          styles.border
                        )}
                      >
                        {suggestion.section}
                      </Badge>
                      <p>{suggestion.suggestion}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-primary">
              <Star size={16} className="fill-primary" />
              <h3 className="font-medium">Pro Tips</h3>
            </div>
            <ul className="mt-2 space-y-2">
              <li className="flex gap-2 text-sm">
                <span className="text-primary font-bold">•</span>
                <span>
                  Customize your resume for each job application to highlight
                  relevant skills.
                </span>
              </li>
              <li className="flex gap-2 text-sm">
                <span className="text-primary font-bold">•</span>
                <span>
                  Use specific keywords from the job description in your resume.
                </span>
              </li>
              <li className="flex gap-2 text-sm">
                <span className="text-primary font-bold">•</span>
                <span>
                  Quantify your achievements with numbers and metrics where
                  possible.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};
