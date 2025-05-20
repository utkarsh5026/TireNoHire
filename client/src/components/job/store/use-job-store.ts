import { create } from "zustand";

export type JobRequirements = {
  description: string;
  required: boolean;
  category: string;
  importance: number;
};

export type JobPosting = {
  title: string;
  company: string;
  location: string;
  type: string;
  seniority: string;
  description: string;
  requirements: JobRequirements[];
  responsibilities: string[];
  preferred_qualifications: string[] | null;
  benefits: string[] | null;
  salary_range: string | null;
  industry: string;
  skills: string[];
  required_qualifications: string[];
};

type State = {
  currentJob: JobPosting | null;
  recentUrls: string[];
  progress: number;
};

type Action = {
  setCurrentJob: (job: JobPosting) => void;
  addRecentUrl: (url: string) => void;
  setProgress: (progress: number) => void;
};

export const useJobStore = create<State & Action>((set, get) => ({
  currentJob: null,
  recentUrls: [],
  progress: 0,
  setCurrentJob: (job) => set({ currentJob: job }),
  addRecentUrl: (url) => {
    const urlSet = new Set(get().recentUrls);
    urlSet.add(url);
    set({ recentUrls: Array.from(urlSet) });
  },
  setProgress: (progress) => set({ progress }),
}));
