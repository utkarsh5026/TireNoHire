export type UUID = string;

export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  gpa?: number;
  achievements?: string[];
}

export interface Experience {
  company: string;
  position: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  achievements: string[];
  skills: string[];
}

export interface Project {
  name: string;
  description?: string;
  technologies: string[];
  url?: string;
  start_date?: string;
  end_date?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  expiry_date?: string;
}

export interface ResumeData {
  contact_info: ContactInfo;
  summary?: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  certifications?: Certification[];
  projects?: Project[];
  languages?: string[];
}

export interface ResumeCreate {
  name: string;
  type: string;
  url?: string;
}

export interface ResumeUploadResponse {
  id: UUID;
  name: string;
  type: string;
  uploaded_at: string;
  status: string;
  data?: ResumeData;
}

export interface Resume {
  id: UUID;
  name: string;
  type: string;
  uploaded_at: string;
  status: string;
  error?: string;
  text_content?: string;
  parsed_data?: ResumeData;
}

// Job related types
export interface JobRequirement {
  description: string;
  required: boolean;
  category: string;
  importance: number;
}

export interface JobData {
  title: string;
  company?: string;
  location?: string;
  type?: string;
  seniority?: string;
  description: string;
  requirements: JobRequirement[];
  responsibilities: string[];
  preferred_qualifications?: string[];
  benefits?: string[];
  salary_range?: string;
  industry?: string;
  skills: string[];
  required_qualifications: string[];
}

export interface JobCreate {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  preferred_qualifications?: string[];
  benefits?: string[];
  source: string;
  source_url?: string;
}

export interface Job {
  id: UUID;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  preferred_qualifications?: string[];
  benefits?: string[];
  created_at: string;
  status: string;
  error?: string;
  source: string;
  source_url?: string;
  parsed_data?: JobData;
}

// Match analysis related types
export interface SkillMatch {
  skill: string;
  resume_level: number;
  job_importance: number;
  match: number;
  category: string;
  gap_description?: string;
  suggestions?: string;
  alternatives?: string[];
}

export interface ExperienceMatch {
  area: string;
  resume_level: number;
  job_requirement: number;
  match: number;
  years_needed?: number;
  years_present?: number;
  context?: string;
  suggestions?: string;
}

export interface EducationMatch {
  requirement: string;
  fulfilled: boolean;
  score: number;
  relevance: number;
  alternatives?: string[];
  suggestions?: string;
}

export interface KeywordMatch {
  keyword: string;
  occurrences_in_resume: number;
  occurrences_in_job: number;
  importance: number;
  context_job?: string;
  context_resume?: string;
  category?: string;
}

export interface SectionScore {
  name: string;
  score: number;
  weight: number;
  strengths: string[];
  weaknesses: string[];
  details: string;
}

export interface ImprovementSuggestion {
  priority: "High" | "Medium" | "Low";
  section: string;
  suggestion: string;
  implementation_difficulty: "Easy" | "Medium" | "Hard";
  impact: number;
  timeframe: "Immediate" | "Short-term" | "Long-term";
}

export interface AtsOptimizationTip {
  description: string;
  current_text?: string;
  suggested_text?: string;
  reason: string;
}

export interface MatchAnalysis {
  id: UUID;
  resume_id: UUID;
  job_id: UUID;
  overall_score: number;
  competitiveness?: string;
  summary: string;
  key_strengths: string[];
  key_gaps: string[];
  section_scores: SectionScore[];
  skill_matches: SkillMatch[];
  experience_matches: ExperienceMatch[];
  education_matches: EducationMatch[];
  keyword_matches: KeywordMatch[];
  improvement_suggestions: ImprovementSuggestion[];
  ats_optimization_tips?: AtsOptimizationTip[];
  interview_preparation?: string[];
  career_path_alignment?: string;
  created_at: string;
}

export interface MatchAnalysisCreate {
  resume_id: UUID;
  job_id: UUID;
  force_refresh?: boolean;
}

export interface BatchAnalysisRequest {
  resume_ids: UUID[];
  job_id: UUID;
  force_refresh?: boolean;
}

export interface ComparisonRequest {
  resume_ids: UUID[];
  job_id: UUID;
}

export interface DirectComparisonRequest {
  job_urls?: string[];
  resume_urls?: string[];
  job_text?: string;
  resume_text?: string;
}

export interface ComparisonResult {
  job_title: string;
  job_company?: string;
  analyses: {
    resume_name: string;
    overall_score: number;
    summary: string;
    detailed_analysis: any;
  }[];
}

export interface CandidateComparison {
  job_id?: UUID;
  candidate_count: number;
  rankings: {
    overall: any[];
    skills: any[];
    experience: any[];
    education: any[];
    fewest_gaps: any[];
  };
  candidates: any[];
  comparison_date: string;
}
