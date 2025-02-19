export interface TrackerEvent {
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
