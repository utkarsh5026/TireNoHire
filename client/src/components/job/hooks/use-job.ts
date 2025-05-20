import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { toast } from "sonner";
import {
  useJobStore,
  type JobPosting,
} from "@/components/job/store/use-job-store";

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
  const addRecentUrl = useJobStore((state) => state.addRecentUrl);

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
      const response = await apiClient.post<JobPosting & { url: string }>(
        "/jobs/url",
        urlRequest
      );
      return {
        ...response,
        url: urlRequest.url,
      };
    },
    onSuccess: ({ url }) => {
      toast.success("Job URL processed successfully");
      addRecentUrl(url);
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
