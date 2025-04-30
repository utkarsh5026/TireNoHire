import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  hoverEffect?: boolean;
  transition?: "bounce" | "slide" | "fade" | "scale";
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  onClick,
  hoverEffect = true,
  transition = "slide",
}) => {
  // Define different animation variants
  const variants = {
    initial: {
      opacity: 0,
      y: transition === "slide" ? 20 : 0,
      x: transition === "bounce" ? -10 : 0,
      scale: transition === "scale" ? 0.95 : 1,
    },
    animate: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: delay * 0.1,
        type: transition === "bounce" ? "spring" : "tween",
        stiffness: transition === "bounce" ? 100 : undefined,
        damping: transition === "bounce" ? 10 : undefined,
      },
    },
    hover: hoverEffect
      ? {
          y: -5,
          boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
          transition: { duration: 0.2 },
        }
      : {},
    tap: hoverEffect
      ? {
          y: 0,
          scale: 0.98,
          transition: { duration: 0.1 },
        }
      : {},
  };

  return (
    <motion.div
      className={cn(
        "bg-card rounded-xl border border-border p-6 shadow-sm transition-all",
        onClick ? "cursor-pointer" : "",
        className
      )}
      variants={variants}
      initial="initial"
      animate="animate"
      whileHover={hoverEffect ? "hover" : undefined}
      whileTap={hoverEffect && onClick ? "tap" : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
