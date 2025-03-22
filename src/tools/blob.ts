import { McpError, ErrorCode } from '../mcp/types.js';
import { apiClient } from '../api/client.js';
import type { CreateBlobRequest, GetBlobRequest, DeleteBlobRequest } from '../api/types.js';

export async function insertBlob(params: CreateBlobRequest) {
  try {
    const response = await apiClient.createBlob(
      params.uid,
      params.blob_type,
      params.blob_data
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to create blob');
    }
    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to create blob: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getBlob(params: GetBlobRequest) {
  try {
    const response = await apiClient.getBlob(params.uid, params.bid);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get blob');
    }
    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get blob: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function deleteBlob(params: DeleteBlobRequest) {
  try {
    const response = await apiClient.deleteBlob(params.uid, params.bid);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete blob');
    }
    return { success: true };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to delete blob: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
