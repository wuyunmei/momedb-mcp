import axios, { AxiosInstance } from 'axios';
import { ApiResponse, User, Blob } from './types.js';
import { config } from '../config.js';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to standardize error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response) {
          // Server responded with error
          throw new Error(error.response.data?.error || error.response.statusText);
        } else if (error.request) {
          // Request made but no response
          throw new Error('No response from server');
        } else {
          // Request setup error
          throw new Error(error.message);
        }
      }
    );
  }

  // User endpoints
  async createUser(name: string): Promise<ApiResponse<User>> {
    return this.client.post('/users', { name });
  }

  async getUser(uid: string): Promise<ApiResponse<User>> {
    return this.client.get(`/users/${uid}`);
  }

  async updateUser(uid: string, name: string): Promise<ApiResponse<User>> {
    return this.client.put(`/users/${uid}`, { name });
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
}

export const apiClient = new ApiClient();
