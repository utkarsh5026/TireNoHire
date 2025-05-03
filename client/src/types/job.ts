export type JobRequirements = {
  description: string;
  required: boolean;
  category: string;
  importance: number;
};

export type JobDescription = {
  title: string;
  company: string;
  location: string;
  type: string;
  seniority: string;
  description: string;
  requirements: JobRequirements[];
  responsibilities: string[];
  preferred_qualifications: string[];
  benefits: string[];
  salary_range: string;
  industry: string;
  skills: string[];
  required_qualifications: string[];
};
