export interface SetupAnswers {
  appName: string;
  endpoint: string;
  useCustomDb: boolean;
  mongoUri?: string;
}

export interface ConfigFile {
  appName: string;
  apiKey: string;
  endpoint: string;
  mongoUri?: string;
}
