import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/shared/AnimatedCard";
import { UserType } from "@/types/resume";
import {
  BriefcaseIcon,
  UserIcon,
  CheckCircle,
  BarChart,
  FileText,
  Link,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleUserTypeSelect = (type: UserType["type"]) => {
    navigate(type === "jobSeeker" ? "/job-seeker" : "/recruiter");
  };

  return (
    <div className="min-h-screen flex flex-col font-mono">
      <div className="flex-1">
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 1.5 }}
              className="absolute -top-[30%] -right-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-primary via-purple-400 to-blue-500 blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute -bottom-[30%] -left-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-blue-500 via-purple-400 to-primary blur-3xl"
            />
          </div>

          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight">
                    Match Your <span className="text-primary">Resume</span> to
                    Job Descriptions
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <p className="text-xl text-muted-foreground">
                    Analyze how well your resume matches job requirements, get
                    detailed feedback, and improve your chances of landing your
                    dream job.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    size="lg"
                    onClick={() => handleUserTypeSelect("jobSeeker")}
                    className="h-12 px-6"
                  >
                    <UserIcon className="mr-2 h-5 w-5" />
                    For Job Seekers
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleUserTypeSelect("recruiter")}
                    className="h-12 px-6"
                  >
                    <BriefcaseIcon className="mr-2 h-5 w-5" />
                    For Recruiters
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border bg-background/50 p-8 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-primary/20 z-0" />

                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Resume Match Score
                        </div>
                        <div className="text-sm font-medium">85% Match</div>
                      </div>

                      <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "85%" }}
                          transition={{ duration: 1.5, delay: 1 }}
                          className="h-full bg-primary"
                        />
                      </div>

                      <div className="pt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-500" />
                          <div className="text-sm">
                            Technical skills match job requirements
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-500" />
                          <div className="text-sm">
                            Experience level exceeds minimum requirements
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-amber-500" />
                          <div className="text-sm">
                            Consider adding more industry-specific keywords
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Key Skills Match</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "React",
                          "TypeScript",
                          "API Integration",
                          "UI/UX Design",
                        ].map((skill, idx) => (
                          <motion.div
                            key={`skill-${idx}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 1.5 + idx * 0.1,
                            }}
                            className="flex items-center gap-1.5"
                          >
                            <div className="w-8 h-1.5 bg-primary rounded-full" />
                            <span className="text-sm">{skill}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold"
              >
                How It Works
              </motion.h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FileText size={24} className="text-primary" />,
                  title: "Upload Your Resume",
                  description:
                    "Upload your resume in PDF or Word format, or provide a link to your online resume.",
                  delay: 0.1,
                },
                {
                  icon: <Link size={24} className="text-primary" />,
                  title: "Add Job Description",
                  description:
                    "Paste the job description text or provide a link to the job posting.",
                  delay: 0.3,
                },
                {
                  icon: <BarChart size={24} className="text-primary" />,
                  title: "Get Detailed Analysis",
                  description:
                    "Receive a comprehensive match score and detailed recommendations to improve your resume.",
                  delay: 0.5,
                },
              ].map((item, idx) => (
                <AnimatedCard
                  key={`step-${idx}`}
                  delay={item.delay}
                  className="p-6"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
