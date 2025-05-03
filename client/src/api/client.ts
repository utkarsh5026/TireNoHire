/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

/**
 * ApiClient Class
 *
 * A centralized API client that handles all HTTP requests,
 * providing consistent error handling, authentication,
 * and request/response transformations.
 */
class ApiClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
      timeout: 30000, // 30 seconds timeout (larger for LLM operations)
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        // Add timestamp to track request duration
        config.metadata = { startTime: new Date().getTime() };

        // Add auth token if available
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (import.meta.env.DEV) {
          console.log(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
          );
        }

        return config;
      },
      (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        // Calculate response time
        const startTime = response.config.metadata?.startTime;
        const endTime = new Date().getTime();
        const duration = startTime ? endTime - startTime : 0;

        if (import.meta.env.DEV) {
          console.log(
            `✅ API Response [${response.status}]:`,
            response.config.url,
            `(${duration}ms)`
          );
        }
        return response;
      },
      (error: AxiosError) => {
        // Calculate response time for errors too
        const startTime = error.config?.metadata?.startTime;
        const endTime = new Date().getTime();
        const duration = startTime ? endTime - startTime : 0;

        const statusCode = error.response?.status;
        const data = error.response?.data;

        const errorMessage = error.message ?? "An unexpected error occurred";

        if (import.meta.env.DEV) {
          console.error(`❌ API Error [${statusCode ?? "Network"}]:`, {
            url: error.config?.url,
            message: errorMessage,
            data: data,
            duration: `${duration}ms`,
          });
        }

        // Create a proper Error object with additional properties
        const enhancedError = new Error(errorMessage) as Error & {
          status?: number;
          data?: any;
          originalError?: AxiosError;
        };

        enhancedError.status = statusCode ?? 0;
        enhancedError.data = data;
        enhancedError.originalError = error;

        return Promise.reject(enhancedError);
      }
    );
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload a file with form data
   */
  async uploadFile<T>(
    url: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    // Add any additional form fields
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  /**
   * Get the raw axios instance for custom requests
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
