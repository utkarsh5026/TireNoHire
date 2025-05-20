import React from "react";
import { Briefcase, CheckCircle, Layers, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { JobPosting } from "../hooks/use-job";

interface RightSideProps {
  jobDescription: JobPosting;
}

const RightSide: React.FC<RightSideProps> = ({ jobDescription }) => {
  const {
    skills,
    benefits,
    company,
    location,
    type,
    seniority,
    salary_range,
    industry,
  } = jobDescription;
  return (
    <div className="space-y-6">
      {/* Skills */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            Required Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      {benefits && benefits.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award size={18} className="text-primary" />
              Benefits & Perks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <CheckCircle
                    size={16}
                    className="text-green-500 flex-shrink-0 mt-1"
                  />
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Job Details Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase size={18} className="text-primary" />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {company && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Company:</span>
              <span className="text-sm font-medium">{company}</span>
            </div>
          )}

          {location && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Location:</span>
              <span className="text-sm font-medium">{location}</span>
            </div>
          )}

          {type && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Job Type:</span>
              <span className="text-sm font-medium">{type}</span>
            </div>
          )}

          {seniority && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Experience Level:
              </span>
              <span className="text-sm font-medium">{seniority}</span>
            </div>
          )}

          {salary_range && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Salary Range:
              </span>
              <span className="text-sm font-medium">{salary_range}</span>
            </div>
          )}

          {industry && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Industry:</span>
              <span className="text-sm font-medium">{industry}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 flex justify-center">
          <Button className="w-full">Apply Now</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RightSide;
