export interface TrackerConfig {
  appId: string;
  endpoint: string;
  environment?: string;
  debug?: boolean;
  batchSize?: number;
  flushInterval?: number;
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
