export * from "./cli";
export * from "./env.config";
export * from "./event";
export * from "./tracker.config";

export interface TrackingConfig {
  apiKey: string;
  appName: string;
  endpoint?: string;
}

export interface TrackingEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface AppRegistration {
  appName: string;
  apiKey: string;
  endpoint: string;
  createdAt: Date;
  active: boolean;
}
