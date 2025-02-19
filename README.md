# Analytics Tracker Package

A TypeScript-based analytics tracking package with automatic configuration for web applications. This package provides an easy way to track and analyze user interactions in your applications.

## Features

- Easy application registration through CLI
- Automatic API key generation
- MongoDB integration for data storage
- TypeScript support
- Simple tracking initialization

## Installation

```bash
npm install analytics-tracker-package
# or
yarn add analytics-tracker-package
# or
pnpm add analytics-tracker-package
```

## Setup

After installation, the package will automatically run the setup process. If you need to run it manually, you can use:

```bash
npm run setup
# or
yarn setup
# or
pnpm setup
```

During setup, you'll be prompted to:

1. Enter your application name
2. The system will automatically generate an API key for your application

## Usage

After completing the setup, you can start using the tracker in your application:

```typescript
import { Tracker } from "analytics-tracker";

const tracker = new Tracker({
  appId: "YOUR_APP_ID",
  endpoint: "https://your-custom-endpoint.com",
  environment: "production",
  debug: true,
});

await tracker.initialize();
```

## API Reference

### Tracker Configuration

```typescript
interface TrackingConfig {
  apiKey: string; // Your application's API key
  appName: string; // Your application name
  endpoint?: string; // Optional custom endpoint
}
```

### Application Registration

```typescript
interface AppRegistration {
  name: string; // Application name
  active: boolean; // Application status
}
```

### Event Tracking

```typescript
interface TrackerEvent {
    eventName: string; // Name of the event
    timestamp: number; // Event timestamp
    path: string; // Path where the event occurred
    location: {
      href: string; // Full URL of the page
      pathname: string; // Pathname of the URL
      search: string; // Query string of the URL
      hash: string; // Fragment identifier of the URL
    };
    metadata?: Record<string, unknown>; // Optional additional metadata
  }
}
```

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm, yarn, or pnpm
- MongoDB database

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## License

MIT

## Author

Auratech Team
