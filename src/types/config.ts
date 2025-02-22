export interface AnalyticsConfig {
  apiUrl: string;
  apiKey?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface AnalyticsOptions extends AnalyticsConfig {
  debug?: boolean;
  retryAttempts?: number;
}
