import { McpError, ErrorCode } from '../mcp/types.js';
import { apiClient } from '../api/client.js';
import type { CreateBlobRequest, GetBlobRequest, DeleteBlobRequest } from '../api/types.js';

export async function insertBlob(params: CreateBlobRequest) {
  console.log('[MCP Tool] insert_blob', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.createBlob(
      params.uid,
      params.blob_type,
      params.blob_data
    );
    if (!response.success) {
      console.error('[MCP Tool Error] insert_blob failed:', response.error);
      throw new Error(response.error || 'Failed to create blob');
    }
    console.log('[MCP Tool Success] insert_blob', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    const errorMsg = `Failed to create blob: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] insert_blob:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}

export async function getBlob(params: GetBlobRequest) {
  console.log('[MCP Tool] get_blob', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.getBlob(params.uid, params.bid);
    if (!response.success) {
      console.error('[MCP Tool Error] get_blob failed:', response.error);
      throw new Error(response.error || 'Failed to get blob');
    }
    console.log('[MCP Tool Success] get_blob', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    const errorMsg = `Failed to get blob: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] get_blob:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}

export async function deleteBlob(params: DeleteBlobRequest) {
  console.log('[MCP Tool] delete_blob', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.deleteBlob(params.uid, params.bid);
    if (!response.success) {
      console.error('[MCP Tool Error] delete_blob failed:', response.error);
      throw new Error(response.error || 'Failed to delete blob');
    }
    console.log('[MCP Tool Success] delete_blob completed');
    return { success: true };
  } catch (error) {
    const errorMsg = `Failed to delete blob: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] delete_blob:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}
