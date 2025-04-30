// src/components/analysis/MatchScore.tsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MatchScoreProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  score,
  size = "md",
  showText = true,
  className,
}) => {
  const circleRef = useRef<SVGCircleElement>(null);

  // Calculate dimensions based on size
  const dimensions = {
    sm: { size: 80, strokeWidth: 6, fontSize: "text-xl", labelSize: "text-xs" },
    md: {
      size: 120,
      strokeWidth: 8,
      fontSize: "text-3xl",
      labelSize: "text-sm",
    },
    lg: {
      size: 180,
      strokeWidth: 10,
      fontSize: "text-5xl",
      labelSize: "text-lg",
    },
  }[size];

  const radius = dimensions.size / 2 - dimensions.strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate the score color
  const getScoreColor = () => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  // Calculate the score gradient
  const getScoreGradient = () => {
    if (score >= 80) return "from-green-300 to-green-600";
    if (score >= 60) return "from-blue-300 to-blue-600";
    if (score >= 40) return "from-amber-300 to-amber-600";
    return "from-red-300 to-red-600";
  };

  // Calculate the score text
  const getScoreText = () => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Poor Match";
  };

  useEffect(() => {
    if (circleRef.current) {
      const dashoffset = circumference - (score / 100) * circumference;
      circleRef.current.style.strokeDashoffset = dashoffset.toString();
    }
  }, [score, circumference]);

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className="relative"
        style={{ width: dimensions.size, height: dimensions.size }}
      >
        {/* Background circle */}
        <svg
          width={dimensions.size}
          height={dimensions.size}
          viewBox={`0 0 ${dimensions.size} ${dimensions.size}`}
          className="transform -rotate-90"
        >
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={dimensions.strokeWidth}
            className="text-muted/20"
          />

          {/* Progress circle with gradient */}
          <circle
            ref={circleRef}
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            fill="transparent"
            stroke="url(#scoreGradient)"
            strokeWidth={dimensions.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />

          {/* Define the gradient */}
          <defs>
            <linearGradient id="scoreGradient" gradientTransform="rotate(90)">
              <stop
                offset="0%"
                className={`stop-${getScoreGradient().split(" ")[0]}`}
              />
              <stop
                offset="100%"
                className={`stop-${getScoreGradient().split(" ")[1]}`}
              />
            </linearGradient>
          </defs>
        </svg>

        {/* Score text in the center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={cn("font-bold", dimensions.fontSize, getScoreColor())}
          >
            {score}%
          </motion.div>
        </div>
      </div>

      {showText && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className={cn(
            "mt-2 font-medium",
            dimensions.labelSize,
            getScoreColor()
          )}
        >
          {getScoreText()}
        </motion.p>
      )}
    </div>
  );
};

// src/components/analysis/DetailedReport.tsx

// src/components/analysis/ImprovementSuggestions.tsx
