interface Config {
  apiBaseUrl: string;
  apiKey: string;
}

export const config: Config = {
  apiBaseUrl: process.env.MEMOBASE_API_URL || 'https://api.memobase.dev',
  apiKey: process.env.MEMOBASE_API_KEY || 'sk-proj-0f89a6ddf181c547-5a2e86d2ae8c57a88ed15f68da1ea45f',
};
