import { McpError, ErrorCode } from '../mcp/types.js';

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

// Knowledge Types
export interface Knowledge {
  kid: string;
  uid: string;
  content: string;
  embedding?: number[];
  metadata: {
    source: string;
    type: string;
    tags: string[];
    created_at: string;
    updated_at: string;
  };
}

export interface KnowledgeRelation {
  source_kid: string;
  target_kid: string;
  relation_type: string;
  weight: number;
  metadata: {
    created_at: string;
    updated_at: string;
  };
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

export interface QueryKnowledgeRequest {
  uid: string;
  query: string;
  filters?: {
    types?: string[];
    tags?: string[];
    sources?: string[];
  };
  limit?: number;
}

export interface AddKnowledgeRequest {
  uid: string;
  content: string;
  metadata: {
    source: string;
    type: string;
    tags: string[];
  };
}

export interface UpdateKnowledgeRequest {
  uid: string;
  kid: string;
  content?: string;
  metadata?: {
    source?: string;
    type?: string;
    tags?: string[];
  };
}

export interface RelateKnowledgeRequest {
  uid: string;
  source_kid: string;
  target_kid: string;
  relation_type: string;
  weight: number;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
