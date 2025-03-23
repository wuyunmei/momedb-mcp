import { McpError, ErrorCode } from '../mcp/types.js';
import { apiClient } from '../api/client.js';
import type { CreateUserRequest, GetUserRequest, UpdateUserRequest, DeleteUserRequest } from '../api/types.js';

export async function createUser(params: CreateUserRequest) {
  console.log('==================== MCP Tool Call ===================');
  console.log('Tool: create_user');
  console.log('Parameters:', JSON.stringify(params, null, 2));
  console.log('==================================================');
  try {
    const response = await apiClient.createUser(params.name);
    if (response.error) {
      console.error('[MCP Tool Error] create_user failed:', response.error);
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('No data returned from API');
    }
    console.log('[MCP Tool Success] create_user', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('==================== MCP Tool Error ==================');
    console.error('Tool: create_user');
    if (error instanceof Error) {
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    } else {
      console.error('Unknown Error:', error);
    }
    console.error('==================================================');
    const errorMsg = `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`;
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}

export async function getUser(params: GetUserRequest) {
  console.log('[MCP Tool] get_user', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.getUser(params.uid);
    if (response.error) {
      console.error('[MCP Tool Error] get_user failed:', response.error);
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('No data returned from API');
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
    if (response.error) {
      console.error('[MCP Tool Error] update_user failed:', response.error);
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('No data returned from API');
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
    if (response.error) {
      console.error('[MCP Tool Error] delete_user failed:', response.error);
      throw new Error(response.error);
    }
    console.log('[MCP Tool Success] delete_user completed');
    return { success: true };
  } catch (error) {
    const errorMsg = `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] delete_user:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}
