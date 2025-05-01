export interface ResumeFile {
  id: string;
  name: string;
  type: "file" | "link";
  url?: string;
  file?: File;
  uploadedAt: Date;
  status: "uploading" | "processing" | "ready" | "error";
  error?: string;
}

export interface ResumeData {
  id: string;
  name: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
  };
  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    gpa?: number;
    achievements?: string[];
  }[];
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
    achievements: string[];
    skills: string[];
  }[];
  skills: string[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
  }[];
  languages?: {
    language: string;
    proficiency: "Basic" | "Intermediate" | "Fluent" | "Native";
  }[];
  projects?: {
    name: string;
    description: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    skills: string[];
  }[];
}

// src/types/job.ts
export interface JobDescription {
  id: string;
  title: string;
  company?: string;
  location?: string;
  type?: "Full-time" | "Part-time" | "Contract" | "Freelance" | "Internship";
  description: string;
  requirements: string[];
  responsibilities: string[];
  preferredQualifications?: string[];
  benefits?: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: "hourly" | "monthly" | "yearly";
  };
  createdAt: Date;
  source: "text" | "link" | "file";
  sourceUrl?: string;
  status: "processing" | "ready" | "error";
  error?: string;
}

// src/types/analysis.ts
export interface SkillMatch {
  skill: string;
  resumeLevel: number; // 0-100
  jobImportance: number; // 0-100
  match: number; // 0-100
  suggestions?: string;
}

export interface ExperienceMatch {
  area: string;
  resumeLevel: number; // 0-100
  jobRequirement: number; // 0-100
  match: number; // 0-100
  suggestions?: string;
}

export interface EducationMatch {
  requirement: string;
  fulfilled: boolean;
  score: number; // 0-100
  suggestions?: string;
}

export interface KeywordMatch {
  keyword: string;
  occurrencesInResume: number;
  occurrencesInJob: number;
  importance: number; // 0-100
}

export interface SectionScore {
  name: string;
  score: number; // 0-100
  weight: number; // 0-100
  details: string;
}

export interface MatchAnalysis {
  id: string;
  resumeId: string;
  jobId: string;
  overallScore: number; // 0-100
  summary: string;
  sectionScores: SectionScore[];
  skillMatches: SkillMatch[];
  experienceMatches: ExperienceMatch[];
  educationMatches: EducationMatch[];
  keywordMatches: KeywordMatch[];
  improvementSuggestions: {
    priority: "High" | "Medium" | "Low";
    section: string;
    suggestion: string;
  }[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface UserType {
  type: "jobSeeker" | "recruiter";
}
