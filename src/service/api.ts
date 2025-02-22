import dotenv from "dotenv";
import { createAnalyticsService } from "./axios-instance";

dotenv.config();

let analyticsService: ReturnType<typeof createAnalyticsService>;

export const initializeAnalytics = (config?: {
  customHeaders?: Record<string, string>;
}) => {
  analyticsService = createAnalyticsService({
    apiUrl: process.env.API_URL as string,
    apiKey: process.env.API_KEY,
    debug: process.env.NODE_ENV === "development",
    timeout: 10000,
    headers: {
      ...(config?.customHeaders || {}),
    },
  });

  return analyticsService;
};

export const getAnalyticsInstance = () => {
  if (!analyticsService) {
    throw new Error(
      "Analytics service not initialized. Call initializeAnalytics first."
    );
  }
  return analyticsService;
};
