interface Config {
  apiBaseUrl: string;
  apiKey: string;
}

export const config: Config = {
  apiBaseUrl: process.env.MEMOBASE_API_URL || 'https://api.memobase.dev',
  apiKey: process.env.MEMOBASE_API_KEY || '',
};
