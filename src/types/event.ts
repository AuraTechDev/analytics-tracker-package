export interface TrackingEvent {
  appId: string;
  eventName: string;
  timestamp: number;
  path: string;
  location: {
    href: string;
    pathname: string;
    search: string;
    hash: string;
  };
  metadata?: Record<string, unknown>;
}
