interface Config {
  apiBaseUrl: string;
}

export const config: Config = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
};
