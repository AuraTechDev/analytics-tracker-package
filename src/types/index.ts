export * from "./cli";

export interface TrackingConfig {
  apiKey: string;
  appName: string;
  endpoint?: string;
}

export interface TrackingEvent {
  type: string;
  timestamp: number;
  data: Record<string, any>;
}

export interface AppRegistration {
  appName: string;
  apiKey: string;
  endpoint: string;
  createdAt: Date;
  active: boolean;
}
