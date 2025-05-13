import { apiClient } from "./client";
import {
  MatchAnalysis,
  BatchAnalysisRequest,
  ComparisonRequest,
  CandidateComparison,
  DirectComparisonRequest,
  ComparisonResult,
} from "@/types";

/**
 * MatchApi
 *
 * Service for handling resume-job matching operations:
 * - Analyzing match between resumes and jobs
 * - Batch analyzing multiple resumes against a job
 * - Comparing candidates for a position
 * - Direct comparison of resumes and job descriptions without saving
 */
class MatchApi {
  private readonly baseUrl = "/matches";

  /**
   * Batch analyze multiple resumes against a job
   *
   * @param resumeIds List of resume IDs to analyze
   * @param jobId Job ID to match against
   * @param forceRefresh Whether to force new analyses
   * @returns List of match analyses
   */
  async batchAnalyze(
    resumeIds: string[],
    jobId: string,
    forceRefresh: boolean = false
  ): Promise<MatchAnalysis[]> {
    try {
      const request: BatchAnalysisRequest = {
        resume_ids: resumeIds,
        job_id: jobId,
        force_refresh: forceRefresh,
      };

      return await apiClient.post<MatchAnalysis[]>(
        `${this.baseUrl}/batch-analyze`,
        request
      );
    } catch (error) {
      console.error(
        `Failed to batch analyze resumes against job ${jobId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Compare multiple candidates against each other for a specific job
   *
   * @param resumeIds List of resume IDs to compare
   * @param jobId Job ID to match against
   * @returns Detailed comparison with rankings
   */
  async compareCandidates(
    resumeIds: string[],
    jobId: string
  ): Promise<CandidateComparison> {
    try {
      const request: ComparisonRequest = {
        resume_ids: resumeIds,
        job_id: jobId,
      };

      return await apiClient.post<CandidateComparison>(
        `${this.baseUrl}/compare-candidates`,
        request
      );
    } catch (error) {
      console.error(`Failed to compare candidates for job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Direct comparison of resumes and job descriptions without saving
   *
   * @param request Direct comparison request with URLs, files, or text
   * @returns Comparison results
   */
  async directComparison(
    request: DirectComparisonRequest
  ): Promise<ComparisonResult[]> {
    try {
      return await apiClient.post<ComparisonResult[]>(
        `${this.baseUrl}/direct-comparison`,
        request
      );
    } catch (error) {
      console.error("Failed to perform direct comparison:", error);
      throw error;
    }
  }

  /**
   * Direct comparison with uploaded files
   *
   * A specialized method that handles file uploads for direct comparison
   *
   * @param resumeFiles Resume files to analyze
   * @param jobFiles Job description files to analyze
   * @returns Comparison results
   */
  async directComparisonWithFiles(
    resumeFiles?: File[],
    jobFiles?: File[],
    resumeUrls?: string[],
    jobUrls?: string[]
  ): Promise<ComparisonResult[]> {
    try {
      const formData = new FormData();

      if (!resumeFiles && !resumeUrls) {
        throw new Error(
          "No files or URLs provided for the resume, Its an empty request, Please provide at least one file or URL for the comparison"
        );
      }

      if (!jobFiles && !jobUrls) {
        throw new Error(
          "No files or URLs provided for the job, Its an empty request, Please provide at least one file or URL for the comparison"
        );
      }

      resumeFiles?.forEach((file) => {
        formData.append(`resume_files`, file);
      });

      jobFiles?.forEach((file) => {
        formData.append(`job_files`, file);
      });

      resumeUrls?.forEach((url) => {
        formData.append(`resume_urls`, url);
      });

      jobUrls?.forEach((url) => {
        formData.append(`job_urls`, url);
      });

      const response = await apiClient
        .getAxiosInstance()
        .post(`${this.baseUrl}/direct-comparison`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

      return response.data;
    } catch (error) {
      console.error("Failed to perform direct comparison with files:", error);
      throw error;
    }
  }
}

export const matchApi = new MatchApi();
