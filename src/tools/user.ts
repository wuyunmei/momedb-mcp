import { McpError, ErrorCode } from '../mcp/types.js';
import { apiClient } from '../api/client.js';
import type { CreateUserRequest, GetUserRequest, UpdateUserRequest, DeleteUserRequest } from '../api/types.js';

export async function createUser(params: CreateUserRequest) {
  console.log('[MCP Tool] create_user', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.createUser(params.name);
    if (!response.success) {
      console.error('[MCP Tool Error] create_user failed:', response.error);
      throw new Error(response.error || 'Failed to create user');
    }
    console.log('[MCP Tool Success] create_user', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    const errorMsg = `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] create_user:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}

export async function getUser(params: GetUserRequest) {
  console.log('[MCP Tool] get_user', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.getUser(params.uid);
    if (!response.success) {
      console.error('[MCP Tool Error] get_user failed:', response.error);
      throw new Error(response.error || 'Failed to get user');
    }
    console.log('[MCP Tool Success] get_user', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    const errorMsg = `Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] get_user:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}

export async function updateUser(params: UpdateUserRequest) {
  console.log('[MCP Tool] update_user', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.updateUser(params.uid, params.name);
    if (!response.success) {
      console.error('[MCP Tool Error] update_user failed:', response.error);
      throw new Error(response.error || 'Failed to update user');
    }
    console.log('[MCP Tool Success] update_user', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    const errorMsg = `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] update_user:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}

export async function deleteUser(params: DeleteUserRequest) {
  console.log('[MCP Tool] delete_user', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.deleteUser(params.uid);
    if (!response.success) {
      console.error('[MCP Tool Error] delete_user failed:', response.error);
      throw new Error(response.error || 'Failed to delete user');
    }
    console.log('[MCP Tool Success] delete_user completed');
    return { success: true };
  } catch (error) {
    const errorMsg = `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] delete_user:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}
