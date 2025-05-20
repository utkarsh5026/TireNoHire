import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { toast } from "sonner";

export type JobPosting = {
  title: string;
  company: string;
  location: string;
  type: string;
  seniority: string;
  description: string;
  requirements: {
    description: string;
    required: boolean;
    category: string;
    importance: number;
  }[];
  responsibilities: string[];
  preferred_qualifications: string[] | null;
  benefits: string[] | null;
  salary_range: string | null;
  industry: string;
  skills: string[];
  required_qualifications: string[];
};

type UrlRequest = {
  url: string;
};

type TextRequest = {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  preferred_qualifications?: string[];
  benefits?: string[];
  source?: string;
};

export const useJob = () => {
  const { mutate: uploadJobFile, isPending: isUploadingFile } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<JobPosting>("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response;
    },
    onSuccess: () => {
      toast.success("Job file uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload job file: ${error.message}`);
    },
  });

  const { mutate: processJobUrl, isPending: isProcessingUrl } = useMutation({
    mutationFn: async (urlRequest: UrlRequest) => {
      const response = await apiClient.post<JobPosting>(
        "/jobs/url",
        urlRequest
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Job URL processed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to process job URL: ${error.message}`);
    },
  });

  const { mutate: uploadJobText, isPending: isUploadingText } = useMutation({
    mutationFn: async (textRequest: TextRequest) => {
      const response = await apiClient.post<JobPosting>("/jobs", {
        ...textRequest,
        source: "text",
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Job information saved successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to save job information: ${error.message}`);
    },
  });

  return {
    uploadJobFile,
    processJobUrl,
    uploadJobText,
    isUploadingFile,
    isProcessingUrl,
    isUploadingText,
  };
};
