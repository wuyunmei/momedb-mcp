import { McpError, ErrorCode } from '../mcp/types.js';
import { apiClient } from '../api/client.js';
import type {
  QueryKnowledgeRequest,
  AddKnowledgeRequest,
  UpdateKnowledgeRequest,
  RelateKnowledgeRequest,
} from '../api/types.js';

export async function queryKnowledge(params: QueryKnowledgeRequest) {
  console.log('[MCP Tool] query_knowledge', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.queryKnowledge(
      params.uid,
      params.query,
      params.filters,
      params.limit
    );
    if (!response.success) {
      console.error('[MCP Tool Error] query_knowledge failed:', response.error);
      throw new Error(response.error || 'Failed to query knowledge');
    }
    console.log('[MCP Tool Success] query_knowledge', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    const errorMsg = `Failed to query knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] query_knowledge:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}

export async function addKnowledge(params: AddKnowledgeRequest) {
  console.log('[MCP Tool] add_knowledge', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.addKnowledge(
      params.uid,
      params.content,
      params.metadata
    );
    if (!response.success) {
      console.error('[MCP Tool Error] add_knowledge failed:', response.error);
      throw new Error(response.error || 'Failed to add knowledge');
    }
    console.log('[MCP Tool Success] add_knowledge', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    const errorMsg = `Failed to add knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] add_knowledge:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}

export async function updateKnowledge(params: UpdateKnowledgeRequest) {
  console.log('[MCP Tool] update_knowledge', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.updateKnowledge(
      params.uid,
      params.kid,
      params.content,
      params.metadata
    );
    if (!response.success) {
      console.error('[MCP Tool Error] update_knowledge failed:', response.error);
      throw new Error(response.error || 'Failed to update knowledge');
    }
    console.log('[MCP Tool Success] update_knowledge', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    const errorMsg = `Failed to update knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] update_knowledge:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}

export async function relateKnowledge(params: RelateKnowledgeRequest) {
  console.log('[MCP Tool] relate_knowledge', JSON.stringify(params, null, 2));
  try {
    const response = await apiClient.relateKnowledge(
      params.uid,
      params.source_kid,
      params.target_kid,
      params.relation_type,
      params.weight
    );
    if (!response.success) {
      console.error('[MCP Tool Error] relate_knowledge failed:', response.error);
      throw new Error(response.error || 'Failed to relate knowledge');
    }
    console.log('[MCP Tool Success] relate_knowledge', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    const errorMsg = `Failed to relate knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('[MCP Tool Error] relate_knowledge:', errorMsg);
    throw new McpError(ErrorCode.InternalError, errorMsg);
  }
}