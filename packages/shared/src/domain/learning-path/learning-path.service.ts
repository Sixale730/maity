/**
 * Learning Path Service
 * Handles all learning path operations via Supabase RPC
 */

import { supabase } from '../../api/client/supabase';
import type {
  LearningPathNode,
  UserLearningPath,
  LearningPathSummary,
  CompleteNodeRequest,
  CompleteNodeResponse,
  TeamMemberProgress,
  LearningPathNodeRow,
  TeamProgressRow,
  LearningPathSummaryRow,
  NodeStatus,
  NodeType,
  VisualPosition,
} from './learning-path.types';

export class LearningPathService {
  /**
   * Get current user's learning path with progress
   */
  static async getUserLearningPath(userId: string): Promise<UserLearningPath> {
    const { data, error } = await supabase.rpc('get_user_learning_path', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching learning path:', error);
      throw error;
    }

    return this.transformPathData(data || []);
  }

  /**
   * Get learning path summary (lightweight)
   */
  static async getLearningPathSummary(userId: string): Promise<LearningPathSummary> {
    const { data, error } = await supabase.rpc('get_learning_path_summary', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching learning path summary:', error);
      throw error;
    }

    const row = data as LearningPathSummaryRow;
    return {
      hasPath: row.has_path,
      totalNodes: row.total_nodes,
      completedNodes: row.completed_nodes,
      inProgressNodes: row.in_progress_nodes,
      progressPercentage: row.progress_percentage,
    };
  }

  /**
   * Initialize learning path for a new user
   */
  static async initializePath(userId: string): Promise<string> {
    const { data, error } = await supabase.rpc('initialize_user_learning_path', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error initializing learning path:', error);
      throw error;
    }

    return data as string;
  }

  /**
   * Mark a node as completed and unlock next
   */
  static async completeNode(
    userId: string,
    request: CompleteNodeRequest
  ): Promise<CompleteNodeResponse> {
    const { data, error } = await supabase.rpc('complete_learning_node', {
      p_user_id: userId,
      p_node_id: request.nodeId,
      p_score: request.score ?? null,
      p_session_id: request.sessionId ?? null,
    });

    if (error) {
      console.error('Error completing node:', error);
      throw error;
    }

    const result = data as {
      success: boolean;
      completed_node_id: string;
      unlocked_node_id: string | null;
      path_completed: boolean;
    };

    return {
      success: result.success,
      completedNodeId: result.completed_node_id,
      unlockedNodeId: result.unlocked_node_id,
      pathCompleted: result.path_completed,
    };
  }

  /**
   * Start a node (mark as in_progress)
   */
  static async startNode(userId: string, nodeId: string): Promise<void> {
    const { error } = await supabase.rpc('start_learning_node', {
      p_user_id: userId,
      p_node_id: nodeId,
    });

    if (error) {
      console.error('Error starting node:', error);
      throw error;
    }
  }

  /**
   * Get team progress (for managers)
   */
  static async getTeamProgress(managerId: string): Promise<TeamMemberProgress[]> {
    const { data, error } = await supabase.rpc('get_team_learning_progress', {
      p_manager_id: managerId,
    });

    if (error) {
      console.error('Error fetching team progress:', error);
      throw error;
    }

    return (data as TeamProgressRow[]).map((row) => ({
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      totalNodes: row.total_nodes,
      completedNodes: row.completed_nodes,
      progressPercentage: row.progress_percentage,
      currentNodeTitle: row.current_node_title,
      lastActivity: row.last_activity,
    }));
  }

  /**
   * Check if user has a learning path
   */
  static async hasLearningPath(userId: string): Promise<boolean> {
    const summary = await this.getLearningPathSummary(userId);
    return summary.hasPath;
  }

  /**
   * Transform raw DB response to typed interface
   */
  private static transformPathData(data: LearningPathNodeRow[]): UserLearningPath {
    const nodes: LearningPathNode[] = data.map((row) => ({
      nodeId: row.node_id,
      orderIndex: row.order_index,
      visualPosition: row.visual_position as VisualPosition,
      nodeType: row.node_type as NodeType,
      title: row.title,
      description: row.description,
      icon: row.icon,
      color: row.color,
      estimatedDuration: row.estimated_duration,
      status: row.status as NodeStatus,
      score: row.score,
      attempts: row.attempts || 0,
      completedAt: row.completed_at,
      resourceId: row.resource_id,
      resourceUrl: row.resource_url,
      resourceTitle: row.resource_title,
      scenarioId: row.scenario_id,
      scenarioCode: row.scenario_code,
      scenarioName: row.scenario_name,
    }));

    const completedNodes = nodes.filter((n) => n.status === 'completed').length;
    const inProgressNodes = nodes.filter((n) => n.status === 'in_progress').length;

    return {
      nodes,
      totalNodes: nodes.length,
      completedNodes,
      inProgressNodes,
      progressPercentage:
        nodes.length > 0 ? Math.round((completedNodes / nodes.length) * 100) : 0,
    };
  }
}
