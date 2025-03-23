import axios, { AxiosInstance } from 'axios';
import { ApiResponse, User, Blob, Knowledge, KnowledgeRelation } from './types.js';
import { config } from '../config.js';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'Accept': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log('==================== API Request ====================');
        console.log(`URL: ${config.baseURL}${config.url}`);
        console.log(`Method: ${config.method?.toUpperCase()}`);
        console.log('Headers:', JSON.stringify(config.headers, null, 2));
        if (config.data) {
          console.log('Body:', JSON.stringify(config.data, null, 2));
        }
        console.log('==================================================');
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error.message);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('==================== API Response ===================');
        console.log(`Status: ${response.status}`);
        console.log(`URL: ${response.config.baseURL}${response.config.url}`);
        console.log(`Method: ${response.config.method?.toUpperCase()}`);
        console.log('Headers:', JSON.stringify(response.headers, null, 2));
        console.log('Body:', JSON.stringify(response.data, null, 2));
        console.log('==================================================');
        return response.data;
      },
      (error) => {
        if (error.response) {
          // Server responded with error
          console.error('==================== API Error =====================');
          console.error(`Status: ${error.response.status}`);
          console.error(`URL: ${error.config.baseURL}${error.config.url}`);
          console.error(`Method: ${error.config.method?.toUpperCase()}`);
          console.error('Request Headers:', JSON.stringify(error.config.headers, null, 2));
          console.error('Request Body:', JSON.stringify(error.config.data, null, 2));
          console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
          console.error('Response Body:', JSON.stringify(error.response.data, null, 2));
          console.error('==================================================');
          throw new Error(error.response.data?.error || error.response.statusText);
        } else if (error.request) {
          // Request made but no response
          console.error(`[API Error] No Response ${error.config.method?.toUpperCase()} ${error.config.url}`);
          throw new Error('No response from server');
        } else {
          // Request setup error
          console.error('[API Error] Request Setup Failed:', error.message);
          throw new Error(error.message);
        }
      }
    );
  }

  // User endpoints
  async createUser(name: string): Promise<ApiResponse<User>> {
    return this.client.post('/api/v1/users', { data: { ANY: name } });
  }

  async getUser(uid: string): Promise<ApiResponse<User>> {
    return this.client.get(`/api/v1/users/${uid}`);
  }

  async updateUser(uid: string, name: string): Promise<ApiResponse<User>> {
    return this.client.put(`/users/${uid}`, { data: { name } });
  }

  async deleteUser(uid: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/users/${uid}`);
  }

  // Blob endpoints
  async createBlob(uid: string, blob_type: string, blob_data: any): Promise<ApiResponse<Blob>> {
    return this.client.post(`/users/${uid}/blobs`, { blob_type, blob_data });
  }

  async getBlob(uid: string, bid: string): Promise<ApiResponse<Blob>> {
    return this.client.get(`/users/${uid}/blobs/${bid}`);
  }

  async deleteBlob(uid: string, bid: string): Promise<ApiResponse<void>> {
    return this.client.delete(`/users/${uid}/blobs/${bid}`);
  }

  // Knowledge endpoints
  async queryKnowledge(uid: string, query: string, filters?: any, limit?: number): Promise<ApiResponse<Knowledge[]>> {
    return this.client.post(`/users/${uid}/knowledge/query`, { query, filters, limit });
  }

  async addKnowledge(uid: string, content: string, metadata: any): Promise<ApiResponse<Knowledge>> {
    return this.client.post(`/users/${uid}/knowledge`, { content, metadata });
  }

  async updateKnowledge(uid: string, kid: string, content?: string, metadata?: any): Promise<ApiResponse<Knowledge>> {
    return this.client.put(`/users/${uid}/knowledge/${kid}`, { content, metadata });
  }

  async relateKnowledge(
    uid: string,
    source_kid: string,
    target_kid: string,
    relation_type: string,
    weight: number
  ): Promise<ApiResponse<KnowledgeRelation>> {
    return this.client.post(`/users/${uid}/knowledge/relations`, {
      source_kid,
      target_kid,
      relation_type,
      weight,
    });
  }
}

export const apiClient = new ApiClient();
