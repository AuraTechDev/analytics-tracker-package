import axios, { AxiosInstance } from "axios";
import { AnalyticsOptions } from "../types/config";

class AnalyticsService {
  private static instance: AnalyticsService;
  private axiosInstance: AxiosInstance;
  private options: AnalyticsOptions;

  private constructor(options: AnalyticsOptions) {
    this.options = {
      debug: false,
      retryAttempts: 3,
      timeout: 5000,
      ...options,
    };

    this.axiosInstance = axios.create({
      baseURL: options.apiUrl,
      timeout: this.options.timeout,
      headers: {
        "Content-Type": "application/json",
        ...(options.apiKey && { "X-API-Key": options.apiKey }),
        ...options.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // if (this.options.debug) {
        //   console.log("Request:", config);
        // }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        // if (this.options.debug) {
        //   console.log("Response:", response);
        // }
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(options: AnalyticsOptions): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService(options);
    }
    return AnalyticsService.instance;
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const createAnalyticsService = (
  options: AnalyticsOptions
): AnalyticsService => {
  return AnalyticsService.getInstance(options);
};

export default AnalyticsService;
