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
import type { JobDescription } from "@/types/job";
import RightSide from "./RightSide";
import LeftSide from "./LeftSide";

const mockJobData: JobDescription = {
  title: "Senior Frontend Developer",
  company: "TechCorp Solutions",
  location: "San Francisco, CA (Remote Option)",
  type: "Full-time",
  seniority: "Senior",
  description:
    "We're looking for a passionate Senior Frontend Developer to join our growing team. You'll be responsible for building user interfaces for our enterprise SaaS platform, collaborating with designers and backend engineers, and mentoring junior developers. The ideal candidate is proficient with modern JavaScript frameworks, has an eye for detail, and is committed to writing clean, maintainable code.",
  requirements: [
    {
      description: "5+ years of experience with React",
      required: true,
      category: "technical",
      importance: 9,
    },
    {
      description: "Strong TypeScript skills",
      required: true,
      category: "technical",
      importance: 8,
    },
    {
      description:
        "Experience with state management libraries (Redux, Zustand, etc.)",
      required: true,
      category: "technical",
      importance: 7,
    },
    {
      description: "Proficiency with CSS and modern frameworks like Tailwind",
      required: true,
      category: "technical",
      importance: 8,
    },
    {
      description:
        "Experience with testing frameworks (Jest, React Testing Library)",
      required: false,
      category: "technical",
      importance: 6,
    },
    {
      description: "Understanding of web accessibility standards",
      required: false,
      category: "technical",
      importance: 7,
    },
    {
      description: "Excellent communication skills",
      required: true,
      category: "soft skill",
      importance: 9,
    },
    {
      description: "Problem-solving ability",
      required: true,
      category: "soft skill",
      importance: 8,
    },
    {
      description: "Experience mentoring junior developers",
      required: false,
      category: "experience",
      importance: 6,
    },
    {
      description: "Experience with agile development methodologies",
      required: true,
      category: "experience",
      importance: 7,
    },
  ],
  responsibilities: [
    "Develop and maintain user interfaces for our enterprise SaaS platform",
    "Collaborate with designers to implement visually appealing and intuitive UIs",
    "Write clean, maintainable, and performance-optimized code",
    "Participate in code reviews and implement best practices",
    "Work closely with backend engineers to integrate APIs",
    "Mentor junior developers and provide technical guidance",
    "Troubleshoot and debug issues as they arise",
    "Contribute to technical documentation",
  ],
  preferred_qualifications: [
    "Experience with GraphQL",
    "Familiarity with CI/CD pipelines",
    "Experience with micro-frontend architectures",
    "Contributions to open source projects",
  ],
  benefits: [
    "Competitive salary and equity package",
    "Health, dental, and vision insurance",
    "401(k) with company match",
    "Flexible work hours and remote work options",
    "Professional development budget",
    "Generous paid time off",
    "Parental leave",
  ],
  salary_range: "$120,000 - $160,000 DOE",
  industry: "Software & Technology",
  skills: [
    "React",
    "TypeScript",
    "JavaScript",
    "CSS",
    "HTML",
    "Redux",
    "Jest",
    "Git",
    "RESTful APIs",
    "Responsive Design",
  ],
  required_qualifications: [
    "Bachelor's degree in Computer Science or related field (or equivalent experience)",
    "5+ years of frontend development experience",
    "Strong portfolio of web applications",
  ],
};

const JobDescriptionPage: React.FC = () => {
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
            <Badge variant="outline">{mockJobData.industry}</Badge>
            <span>•</span>
            <span>Posted 2 days ago</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {mockJobData.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            {mockJobData.company && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Building size={16} />
                <span>{mockJobData.company}</span>
              </div>
            )}

            {mockJobData.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin size={16} />
                <span>{mockJobData.location}</span>
              </div>
            )}

            {mockJobData.type && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock size={16} />
                <span>{mockJobData.type}</span>
              </div>
            )}

            {mockJobData.seniority && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <ChevronUp size={16} />
                <span>{mockJobData.seniority} Level</span>
              </div>
            )}

            {mockJobData.salary_range && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <BadgeDollarSign size={16} />
                <span>{mockJobData.salary_range}</span>
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
        <LeftSide jobDescription={mockJobData} />

        <RightSide jobDescription={mockJobData} />
      </div>
    </div>
  );
};

export default JobDescriptionPage;
