import { McpError, ErrorCode } from '../mcp/types.js';
import { apiClient } from '../api/client.js';
import type { CreateUserRequest, GetUserRequest, UpdateUserRequest, DeleteUserRequest } from '../api/types.js';

export async function createUser(params: CreateUserRequest) {
  try {
    const response = await apiClient.createUser(params.name);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create user');
    }
    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function getUser(params: GetUserRequest) {
  try {
    const response = await apiClient.getUser(params.uid);
    if (!response.success) {
      throw new Error(response.error || 'Failed to get user');
    }
    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function updateUser(params: UpdateUserRequest) {
  try {
    const response = await apiClient.updateUser(params.uid, params.name);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update user');
    }
    return response.data;
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export async function deleteUser(params: DeleteUserRequest) {
  try {
    const response = await apiClient.deleteUser(params.uid);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user');
    }
    return { success: true };
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
