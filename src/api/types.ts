export interface User {
  uid: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  alias?: string;
}

export interface BlobData {
  messages: Message[];
}

export interface Blob {
  bid: string;
  uid: string;
  blob_type: string;
  blob_data: BlobData;
  created_at: string;
  updated_at: string;
}

// Request Types
export interface CreateUserRequest {
  name: string;
}

export interface GetUserRequest {
  uid: string;
}

export interface UpdateUserRequest {
  uid: string;
  name: string;
}

export interface DeleteUserRequest {
  uid: string;
}

export interface CreateBlobRequest {
  uid: string;
  blob_type: string;
  blob_data: BlobData;
}

export interface GetBlobRequest {
  uid: string;
  bid: string;
}

export interface DeleteBlobRequest {
  uid: string;
  bid: string;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
