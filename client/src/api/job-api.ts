import { apiClient } from "./client";
import { Job, JobCreate } from "../types";

/**
 * JobApi
 *
 * Service for handling job-related API operations:
 * - Uploading job description files
 * - Processing job descriptions from URLs
 * - Creating job descriptions from direct text input
 * - Retrieving and managing job listings
 */
class JobApi {
  private readonly baseUrl = "/jobs";

  /**
   * Upload a job description file (PDF, DOCX, etc.)
   *
   * @param file The job description file to upload
   * @returns Job record with tracking ID
   */
  async uploadJobFile(file: File): Promise<Job> {
    try {
      return await apiClient.uploadFile<Job>(`${this.baseUrl}/upload`, file);
    } catch (error) {
      console.error("Failed to upload job description file:", error);
      throw error;
    }
  }

  /**
   * Process a job description from a URL
   *
   * @param url URL pointing to a job description
   * @returns Job processing response with tracking ID
   */
  async processJobUrl(url: string): Promise<Job> {
    try {
      return await apiClient.post<Job>(`${this.baseUrl}/url`, { url });
    } catch (error) {
      console.error("Failed to process job URL:", error);
      throw error;
    }
  }

  /**
   * Create a job description from direct text input
   *
   * @param jobData The job description data
   * @returns Created job record
   */
  async createJobFromText(jobData: JobCreate): Promise<Job> {
    try {
      return await apiClient.post<Job>(`${this.baseUrl}/text`, jobData);
    } catch (error) {
      console.error("Failed to create job from text:", error);
      throw error;
    }
  }

  /**
   * Get a job by ID
   *
   * @param id Job ID
   * @returns Complete job with parsed data
   */
  async getJobById(id: string): Promise<Job> {
    try {
      return await apiClient.get<Job>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to get job with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all jobs
   *
   * @returns List of all jobs
   */
  async getAllJobs(): Promise<Job[]> {
    try {
      return await apiClient.get<Job[]>(this.baseUrl);
    } catch (error) {
      console.error("Failed to get all jobs:", error);
      throw error;
    }
  }

  /**
   * Delete a job
   *
   * @param id Job ID to delete
   * @returns Success indicator
   */
  async deleteJob(id: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete<{ success: boolean }>(
        `${this.baseUrl}/${id}`
      );
    } catch (error) {
      console.error(`Failed to delete job with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check job processing status
   *
   * @param id Job ID
   * @returns Current status of the job processing
   */
  async checkJobStatus(
    id: string
  ): Promise<{ status: string; message?: string }> {
    try {
      return await apiClient.get<{ status: string; message?: string }>(
        `${this.baseUrl}/${id}/status`
      );
    } catch (error) {
      console.error(`Failed to check job status for ID ${id}:`, error);
      throw error;
    }
  }
}

export const jobApi = new JobApi();
