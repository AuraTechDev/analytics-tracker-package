export interface TrackerConfig {
  appId: string;
  endpoint: string;
  batchSize?: number;
  flushInterval?: number;
  environment?: string;
  debug?: boolean;
  trackingOptions?: {
    clicks?: boolean;
    navigation?: boolean;
    forms?: boolean;
    errors?: boolean;
    performance?: boolean;
    scrolling?: boolean;
    network?: boolean;
  };
}
