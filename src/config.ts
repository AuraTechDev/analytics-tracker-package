import { TrackerEnvConfig } from "./types/env.config";

export function loadTrackerConfig(): TrackerEnvConfig {
  const appId = process.env.TRACKER_APP_ID;

  if (!appId) {
    throw new Error(
      "TRACKER_APP_ID environment variable is required. Please set it in your .env file."
    );
  }

  return {
    appId,
    endpoint:
      process.env.TRACKER_ENDPOINT || "https://api.your-tracking-service.com",
    environment: process.env.NODE_ENV || "development",
    debug: process.env.TRACKER_DEBUG === "true",
  };
}
