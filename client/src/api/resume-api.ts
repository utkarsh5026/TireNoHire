import { apiClient } from "./client";
import { Resume, ResumeUploadResponse } from "../types";

/**
 * ResumeApi
 *
 * Service for handling resume-related API operations:
 * - Uploading resume files
 * - Processing resumes from URLs
 * - Retrieving and managing resumes
 */
class ResumeApi {
  private readonly baseUrl = "/resumes";

  /**
   * Upload a resume file (PDF, DOCX, etc.)
   *
   * @param file The resume file to upload
   * @param name Optional name for the resume
   * @returns Resume upload response with tracking ID
   */
  async uploadResumeFile(
    file: File,
    name?: string
  ): Promise<ResumeUploadResponse> {
    const additionalData: Record<string, string> = {};
    if (name) {
      additionalData.name = name;
    }

    try {
      return await apiClient.uploadFile<ResumeUploadResponse>(
        `${this.baseUrl}/upload`,
        file,
        additionalData
      );
    } catch (error) {
      console.error("Failed to upload resume file:", error);
      throw error;
    }
  }

  /**
   * Process a resume from a URL
   *
   * @param url URL pointing to a resume document
   * @returns Resume processing response with tracking ID
   */
  async processResumeUrl(url: string): Promise<ResumeUploadResponse> {
    try {
      return await apiClient.post<ResumeUploadResponse>(`${this.baseUrl}/url`, {
        url,
      });
    } catch (error) {
      console.error("Failed to process resume URL:", error);
      throw error;
    }
  }

  /**
   * Get a resume by ID
   *
   * @param id Resume ID
   * @returns Complete resume with parsed data
   */
  async getResumeById(id: string): Promise<Resume> {
    try {
      return await apiClient.get<Resume>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to get resume with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all resumes
   *
   * @returns List of all resumes
   */
  async getAllResumes(): Promise<Resume[]> {
    try {
      return await apiClient.get<Resume[]>(this.baseUrl);
    } catch (error) {
      console.error("Failed to get all resumes:", error);
      throw error;
    }
  }

  /**
   * Delete a resume
   *
   * @param id Resume ID to delete
   * @returns Success indicator
   */
  async deleteResume(id: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete<{ success: boolean }>(
        `${this.baseUrl}/${id}`
      );
    } catch (error) {
      console.error(`Failed to delete resume with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check resume processing status
   *
   * @param id Resume ID
   * @returns Current status of the resume processing
   */
  async checkResumeStatus(
    id: string
  ): Promise<{ status: string; message?: string }> {
    try {
      return await apiClient.get<{ status: string; message?: string }>(
        `${this.baseUrl}/${id}/status`
      );
    } catch (error) {
      console.error(`Failed to check resume status for ID ${id}:`, error);
      throw error;
    }
  }
}

export const resumeApi = new ResumeApi();
