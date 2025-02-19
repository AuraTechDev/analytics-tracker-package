import { TrackerConfig } from "../types/tracker.config";
import { TrackingEvent } from "../types/event";

/**
 * Example usage of AutoTracker:
 *
 * import { AutoTracker, loadTrackerConfig } from 'track-analytics';
 *
 * // Load configuration from environment variables
 * const config = loadTrackerConfig();
 *
 * // Initialize the tracker with configuration
 * const tracker = new AutoTracker({
 *   appId: config.appId,
 *   endpoint: config.endpoint,
 *   environment: config.environment,
 *   debug: config.debug,
 *   batchSize: 10,
 *   flushInterval: 5000,
 *   // Optional: customize what to track
 *   trackingOptions: {
 *     clicks: true,
 *     navigation: true,
 *     forms: true,
 *     errors: true,
 *     performance: true,
 *     scrolling: true,
 *     network: true,
 *   },
 * });
 *
 * // The tracker will automatically start collecting data
 * // Clean up when done
 * window.addEventListener('beforeunload', () => {
 *   tracker.destroy();
 * });
 */

export class AutoTracker {
  private events: TrackingEvent[] = [];
  private config: TrackerConfig;
  private flushIntervalId?: number;
  private performanceObserver?: PerformanceObserver;
  private scrollThrottleTimeout?: number;
  private lastScrollPosition: number = 0;

  constructor(config: TrackerConfig) {
    if (!config.appId) {
      throw new Error(
        "AppID is required. Please set TRACKER_APP_ID in your environment variables."
      );
    }

    this.config = {
      batchSize: 10,
      flushInterval: 5000,
      debug: false,
      trackingOptions: {
        clicks: true,
        navigation: true,
        forms: true,
        errors: true,
        performance: true,
        scrolling: true,
        network: true,
      },
      ...config,
    };

    this.initialize();
  }

  private initialize(): void {
    if (typeof window === "undefined") return;

    this.setupFlushInterval();
    this.setupEventListeners();
    this.trackInitialPageLoad();
  }

  private setupEventListeners(): void {
    const { trackingOptions } = this.config;

    if (trackingOptions?.clicks) {
      this.setupClickTracking();
    }

    if (trackingOptions?.navigation) {
      this.setupNavigationTracking();
    }

    if (trackingOptions?.forms) {
      this.setupFormTracking();
    }

    if (trackingOptions?.errors) {
      this.setupErrorTracking();
    }

    if (trackingOptions?.performance) {
      this.setupPerformanceTracking();
    }

    if (trackingOptions?.scrolling) {
      this.setupScrollTracking();
    }

    if (trackingOptions?.network) {
      this.setupNetworkTracking();
    }
  }

  private setupClickTracking(): void {
    window.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLElement;
        const interactiveElements = [
          "a",
          "button",
          "input",
          "select",
          "textarea",
        ];

        if (interactiveElements.includes(target.tagName.toLowerCase())) {
          this.trackEvent("element_click", {
            elementType: target.tagName.toLowerCase(),
            elementId: target.id,
            elementClass: target.className,
            elementText: target.textContent?.trim(),
            elementHref: (target as HTMLAnchorElement).href,
            elementValue: (target as HTMLInputElement).value,
          });
        }
      },
      { passive: true }
    );
  }

  private setupFormTracking(): void {
    // Track form submissions
    window.addEventListener("submit", (e) => {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const fields = Array.from(formData.entries()).map(([name]) => name);

      this.trackEvent("form_submit", {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
        fields: fields,
      });
    });

    // Track form field interactions
    document.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.form) {
        this.trackEvent("form_field_change", {
          formId: target.form.id,
          fieldName: target.name,
          fieldType: target.type,
          fieldValue: target.type === "password" ? "[REDACTED]" : target.value,
        });
      }
    });
  }

  private setupNavigationTracking(): void {
    // Track navigation events
    window.addEventListener("popstate", () => this.trackPageView());

    // Track hash changes
    window.addEventListener("hashchange", () => {
      this.trackEvent("hash_change", {
        newHash: window.location.hash,
      });
    });

    // Track navigation timing
    window.addEventListener("load", () => {
      if (window.performance) {
        const [navigationTiming] = performance.getEntriesByType(
          "navigation"
        ) as PerformanceNavigationTiming[];

        this.trackEvent("page_load_timing", {
          loadTime: navigationTiming.loadEventEnd - navigationTiming.startTime,
          domContentLoaded:
            navigationTiming.domContentLoadedEventEnd -
            navigationTiming.startTime,
          firstPaint: navigationTiming.responseEnd - navigationTiming.startTime,
          dnsLookup:
            navigationTiming.domainLookupEnd -
            navigationTiming.domainLookupStart,
          tcpConnection:
            navigationTiming.connectEnd - navigationTiming.connectStart,
        });
      }
    });
  }

  private setupErrorTracking(): void {
    window.addEventListener("error", (e) => {
      this.trackEvent("javascript_error", {
        message: e.message,
        filename: e.filename,
        lineNumber: e.lineno,
        columnNumber: e.colno,
        stack: e.error?.stack,
      });
    });

    window.addEventListener("unhandledrejection", (e) => {
      this.trackEvent("promise_rejection", {
        reason: String(e.reason),
      });
    });
  }

  private setupPerformanceTracking(): void {
    if (window.PerformanceObserver) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "largest-contentful-paint") {
            this.trackEvent("largest_contentful_paint", {
              value: entry.startTime,
              element: (
                entry as PerformanceEntry & { element?: { tagName: string } }
              ).element?.tagName,
            });
          } else if (entry.entryType === "first-input") {
            this.trackEvent("first_input_delay", {
              value: entry.startTime,
              processingStart: (
                entry as PerformanceEntry & { processingStart: number }
              ).processingStart,
              processingEnd: (
                entry as PerformanceEntry & { processingEnd: number }
              ).processingEnd,
            });
          }
        }
      });

      this.performanceObserver.observe({
        entryTypes: ["largest-contentful-paint", "first-input"],
      });
    }
  }

  private setupScrollTracking(): void {
    window.addEventListener(
      "scroll",
      () => {
        if (this.scrollThrottleTimeout) {
          return;
        }

        this.scrollThrottleTimeout = window.setTimeout(() => {
          const scrollPosition = window.scrollY;
          const scrollHeight = document.documentElement.scrollHeight;
          const viewportHeight = window.innerHeight;
          const scrollPercentage =
            (scrollPosition / (scrollHeight - viewportHeight)) * 100;

          if (Math.abs(scrollPosition - this.lastScrollPosition) > 100) {
            this.trackEvent("scroll", {
              scrollPosition,
              scrollPercentage: Math.round(scrollPercentage),
              direction:
                scrollPosition > this.lastScrollPosition ? "down" : "up",
            });
            this.lastScrollPosition = scrollPosition;
          }

          this.scrollThrottleTimeout = undefined;
        }, 500);
      },
      { passive: true }
    );
  }

  private setupNetworkTracking(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args): Promise<Response> => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        this.trackEvent("network_request", {
          url: typeof args[0] === "string" ? args[0] : (args[0] as Request).url,
          method: args[1]?.method || "GET",
          status: response.status,
          duration: performance.now() - startTime,
        });
        return response;
      } catch (error) {
        this.trackEvent("network_error", {
          url: typeof args[0] === "string" ? args[0] : (args[0] as Request).url,
          method: args[1]?.method || "GET",
          error: (error as Error).message,
          duration: performance.now() - startTime,
        });

        throw error;
      }
    };
  }

  private setupFlushInterval(): void {
    this.flushIntervalId = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private trackPageView(): void {
    const { title, referrer } = document;
    const { href, pathname, search, hash } = window.location;

    this.trackEvent("pageview", {
      title,
      referrer,
      url: href,
      pathname,
      search,
      hash,
    });
  }

  private trackInitialPageLoad(): void {
    this.trackPageView();

    // Track initial page metadata
    this.trackEvent("page_metadata", {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      devicePixelRatio: window.devicePixelRatio,
    });
  }

  private trackEvent(
    eventName: string,
    metadata?: Record<string, unknown>
  ): void {
    const event: TrackingEvent = {
      appId: this.config.appId,
      eventName,
      timestamp: Date.now(),
      path: window.location.pathname,
      location: {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
      metadata: {
        ...metadata,
        environment: this.config.environment,
      },
    };

    this.events.push(event);

    if (this.config.debug) {
      console.log("Tracked event:", event);
    }

    if (this.events.length >= (this.config.batchSize ?? 10)) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-ID": this.config.appId,
        },
        body: JSON.stringify(eventsToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (this.config.debug) {
        console.log("Events sent successfully:", eventsToSend);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error("Failed to send events:", error);
      }

      // Add events back to the queue
      this.events = [...eventsToSend, ...this.events];
    }
  }

  public destroy(): void {
    if (this.flushIntervalId) {
      window.clearInterval(this.flushIntervalId);
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    if (this.scrollThrottleTimeout) {
      window.clearTimeout(this.scrollThrottleTimeout);
    }
  }
}
