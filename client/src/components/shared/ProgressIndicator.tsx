import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  steps: {
    id: string;
    label: string;
    description?: string;
  }[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  className,
  orientation = "horizontal",
}) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        "w-full",
        isHorizontal
          ? "flex items-center justify-between"
          : "flex flex-col gap-4",
        className
      )}
    >
      {steps.map((step, index) => {
        const isActive = currentStep === index;
        const isComplete = currentStep > index;
        const isClickable =
          onStepClick && (isComplete || index === currentStep);

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "relative flex items-center",
                isHorizontal ? "flex-col" : "flex-row gap-4",
                isClickable ? "cursor-pointer" : ""
              )}
              onClick={() => isClickable && onStepClick(index)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  backgroundColor: isComplete
                    ? "var(--primary)"
                    : isActive
                    ? "var(--background)"
                    : "var(--muted)",
                }}
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isComplete
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                    ? "border-primary bg-background text-primary"
                    : "border-muted bg-muted text-muted-foreground"
                )}
              >
                <span className="text-sm font-medium">{index + 1}</span>
              </motion.div>

              <div
                className={cn(
                  "mt-2 text-center",
                  isHorizontal ? "w-32" : "w-full"
                )}
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={cn(
                    "text-sm font-medium",
                    isActive || isComplete
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </motion.p>
                {step.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isActive ? 1 : 0.7 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-muted-foreground mt-1 hidden md:block"
                  >
                    {step.description}
                  </motion.p>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "bg-muted relative",
                  isHorizontal ? "flex-1 h-[2px]" : "w-[2px] h-8 ml-5"
                )}
              >
                <motion.div
                  initial={{
                    width: isHorizontal ? "0%" : "100%",
                    height: isHorizontal ? "100%" : "0%",
                  }}
                  animate={{
                    width: isHorizontal ? (isComplete ? "100%" : "0%") : "100%",
                    height: isHorizontal ? "100%" : isComplete ? "100%" : "0%",
                  }}
                  className="bg-primary absolute top-0 left-0"
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
