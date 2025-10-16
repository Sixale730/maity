/**
 * RoleplayService Tests
 *
 * Tests the roleplay service that manages voice sessions, user progress,
 * practice profiles, and scenarios.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleplayService, type SessionUpdate } from '../roleplay.service';
import { supabase } from '../../../api/client/supabase';

// Mock the supabase client
vi.mock('../../../api/client/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    schema: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn(),
      })),
    })),
  }
}));

describe('RoleplayService', () => {
  const mockUserId = 'user-123';
  const mockAuthId = 'auth-456';
  const mockSessionId = 'session-789';
  const mockProfileId = 'profile-abc';
  const mockProfileName = 'CEO';
  const mockQuestionnaireId = 'questionnaire-xyz';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a voice session successfully', async () => {
      const mockSessionId = 'new-session-123';

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockSessionId,
        error: null
      });

      const sessionId = await RoleplayService.createSession(
        mockUserId,
        mockProfileName,
        mockQuestionnaireId
      );

      expect(sessionId).toBe(mockSessionId);
      expect(supabase.rpc).toHaveBeenCalledWith('create_voice_session', {
        p_user_id: mockUserId,
        p_profile_name: mockProfileName,
        p_questionnaire_id: mockQuestionnaireId
      });
    });

    it('should create session without questionnaire ID', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockSessionId,
        error: null
      });

      await RoleplayService.createSession(mockUserId, mockProfileName);

      expect(supabase.rpc).toHaveBeenCalledWith('create_voice_session', {
        p_user_id: mockUserId,
        p_profile_name: mockProfileName,
        p_questionnaire_id: ''
      });
    });

    it('should handle null questionnaire ID', async () => {
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockSessionId,
        error: null
      });

      await RoleplayService.createSession(mockUserId, mockProfileName, null);

      expect(supabase.rpc).toHaveBeenCalledWith('create_voice_session', {
        p_user_id: mockUserId,
        p_profile_name: mockProfileName,
        p_questionnaire_id: ''
      });
    });

    it('should throw error when RPC fails', async () => {
      const error = new Error('Failed to create session');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(
        RoleplayService.createSession(mockUserId, mockProfileName)
      ).rejects.toThrow('Failed to create session');
    });

    it('should log error to console when creation fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(
        RoleplayService.createSession(mockUserId, mockProfileName)
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating voice session:', error);
      consoleErrorSpy.mockRestore();
    });

    it('should handle different profile names', async () => {
      const profiles = ['CEO', 'MANAGER', 'SALES', 'CUSTOMER_SERVICE'];

      for (const profile of profiles) {
        vi.mocked(supabase.rpc).mockResolvedValueOnce({
          data: mockSessionId,
          error: null
        });

        await RoleplayService.createSession(mockUserId, profile);

        expect(supabase.rpc).toHaveBeenCalledWith('create_voice_session', {
          p_user_id: mockUserId,
          p_profile_name: profile,
          p_questionnaire_id: ''
        });
      }
    });
  });

  describe('getOrCreateProgress', () => {
    it('should get or create user progress successfully', async () => {
      const mockProgress = {
        user_id: mockUserId,
        profile_name: mockProfileName,
        current_level: 1,
        scenarios_completed: 0
      };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockProgress,
        error: null
      });

      const progress = await RoleplayService.getOrCreateProgress(mockUserId, mockProfileName);

      expect(progress).toEqual(mockProgress);
      expect(supabase.rpc).toHaveBeenCalledWith('get_or_create_user_progress', {
        p_user_id: mockUserId,
        p_profile_name: mockProfileName
      });
    });

    it('should throw error when RPC fails', async () => {
      const error = new Error('Failed to get progress');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(
        RoleplayService.getOrCreateProgress(mockUserId, mockProfileName)
      ).rejects.toThrow('Failed to get progress');
    });

    it('should log error to console when fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(
        RoleplayService.getOrCreateProgress(mockUserId, mockProfileName)
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting/creating user progress:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('createInitialProgress', () => {
    it('should create initial progress successfully', async () => {
      const mockResult = { success: true };

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockResult,
        error: null
      });

      const result = await RoleplayService.createInitialProgress(mockAuthId, mockProfileName);

      expect(result).toEqual(mockResult);
      expect(supabase.rpc).toHaveBeenCalledWith('create_initial_voice_progress', {
        p_auth_id: mockAuthId,
        p_profile_name: mockProfileName
      });
    });

    it('should throw error when RPC fails', async () => {
      const error = new Error('Failed to create initial progress');
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(
        RoleplayService.createInitialProgress(mockAuthId, mockProfileName)
      ).rejects.toThrow('Failed to create initial progress');
    });

    it('should log error to console when creation fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: null,
        error
      });

      await expect(
        RoleplayService.createInitialProgress(mockAuthId, mockProfileName)
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating initial progress:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getSessions', () => {
    it('should get all sessions for a user', async () => {
      const mockSessions = [
        { id: 'session-1', user_id: mockUserId, started_at: '2024-01-01' },
        { id: 'session-2', user_id: mockUserId, started_at: '2024-01-02' }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockSessions, error: null }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const sessions = await RoleplayService.getSessions(mockUserId);

      expect(sessions).toEqual(mockSessions);
      expect(mockSchema).toHaveBeenCalledWith('maity');
      expect(mockFrom).toHaveBeenCalledWith('voice_sessions');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockQuery.order).toHaveBeenCalledWith('started_at', { ascending: false });
    });

    it('should apply limit when provided', async () => {
      const mockSessions = [
        { id: 'session-1', user_id: mockUserId, started_at: '2024-01-01' }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockSessions, error: null }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await RoleplayService.getSessions(mockUserId, 10);

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Failed to fetch sessions');

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.getSessions(mockUserId)
      ).rejects.toThrow('Failed to fetch sessions');
    });

    it('should return empty array when no sessions found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const sessions = await RoleplayService.getSessions(mockUserId);

      expect(sessions).toEqual([]);
    });
  });

  describe('getSessionById', () => {
    it('should get session by ID successfully', async () => {
      const mockSession = {
        id: mockSessionId,
        user_id: mockUserId,
        started_at: '2024-01-01',
        status: 'active'
      };

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockSession, error: null })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const session = await RoleplayService.getSessionById(mockSessionId);

      expect(session).toEqual(mockSession);
      expect(mockSchema).toHaveBeenCalledWith('maity');
      expect(mockFrom).toHaveBeenCalledWith('voice_sessions');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', mockSessionId);
      expect(mockQuery.single).toHaveBeenCalled();
    });

    it('should throw error when session not found', async () => {
      const error = new Error('Session not found');

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.getSessionById(mockSessionId)
      ).rejects.toThrow('Session not found');
    });

    it('should log error to console when fetch fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.getSessionById(mockSessionId)
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching voice session:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateSession', () => {
    it('should update session successfully', async () => {
      const updates: SessionUpdate = {
        status: 'completed',
        score: 85,
        passed: true
      };

      const mockUpdatedSession = {
        id: mockSessionId,
        ...updates
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedSession, error: null })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const result = await RoleplayService.updateSession(mockSessionId, updates);

      expect(result).toEqual(mockUpdatedSession);
      expect(mockSchema).toHaveBeenCalledWith('maity');
      expect(mockFrom).toHaveBeenCalledWith('voice_sessions');
      expect(mockQuery.update).toHaveBeenCalledWith(updates);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', mockSessionId);
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.single).toHaveBeenCalled();
    });

    it('should update session with ended_at timestamp', async () => {
      const now = new Date().toISOString();
      const updates: SessionUpdate = {
        ended_at: now,
        status: 'completed'
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: null })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await RoleplayService.updateSession(mockSessionId, updates);

      expect(mockQuery.update).toHaveBeenCalledWith(updates);
    });

    it('should update session with transcript', async () => {
      const updates: SessionUpdate = {
        transcript: { messages: ['Hello', 'Hi there'] }
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: null })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await RoleplayService.updateSession(mockSessionId, updates);

      expect(mockQuery.update).toHaveBeenCalledWith(updates);
    });

    it('should update session with processed feedback', async () => {
      const updates: SessionUpdate = {
        processed_feedback: {
          strengths: ['Good communication'],
          improvements: ['Better pacing']
        }
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: null })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await RoleplayService.updateSession(mockSessionId, updates);

      expect(mockQuery.update).toHaveBeenCalledWith(updates);
    });

    it('should throw error when update fails', async () => {
      const error = new Error('Failed to update session');

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.updateSession(mockSessionId, {})
      ).rejects.toThrow('Failed to update session');
    });

    it('should log error to console when update fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.updateSession(mockSessionId, {})
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating voice session:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('endSession', () => {
    it('should end session successfully', async () => {
      const mockUpdatedSession = {
        id: mockSessionId,
        status: 'completed',
        ended_at: expect.any(String)
      };

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedSession, error: null })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const result = await RoleplayService.endSession(mockSessionId);

      expect(result).toBeDefined();
      expect(mockQuery.update).toHaveBeenCalledWith({
        ended_at: expect.any(String),
        status: 'completed'
      });
    });

    it('should set ended_at to current timestamp', async () => {
      const beforeCall = new Date().toISOString();

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: {}, error: null })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await RoleplayService.endSession(mockSessionId);

      const afterCall = new Date().toISOString();

      const updateCall = mockQuery.update.mock.calls[0][0];
      expect(updateCall.ended_at).toBeDefined();
      expect(new Date(updateCall.ended_at).getTime()).toBeGreaterThanOrEqual(new Date(beforeCall).getTime());
      expect(new Date(updateCall.ended_at).getTime()).toBeLessThanOrEqual(new Date(afterCall).getTime());
      expect(updateCall.status).toBe('completed');
    });

    it('should throw error when ending session fails', async () => {
      const error = new Error('Failed to end session');

      const mockQuery = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error })
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.endSession(mockSessionId)
      ).rejects.toThrow('Failed to end session');
    });
  });

  describe('getProfiles', () => {
    it('should get all practice profiles', async () => {
      const mockProfiles = [
        { id: 'profile-1', name: 'CEO', description: 'Executive leadership' },
        { id: 'profile-2', name: 'MANAGER', description: 'Team management' }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockProfiles, error: null }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const profiles = await RoleplayService.getProfiles();

      expect(profiles).toEqual(mockProfiles);
      expect(mockSchema).toHaveBeenCalledWith('maity');
      expect(mockFrom).toHaveBeenCalledWith('voice_agent_profiles');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('name', { ascending: true });
    });

    it('should return empty array when no profiles found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const profiles = await RoleplayService.getProfiles();

      expect(profiles).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Failed to fetch profiles');

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.getProfiles()
      ).rejects.toThrow('Failed to fetch profiles');
    });

    it('should log error to console when fetch fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.getProfiles()
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching practice profiles:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getScenariosByProfile', () => {
    it('should get scenarios for a profile', async () => {
      const mockScenarios = [
        { id: 'scenario-1', profile_id: mockProfileId, name: 'Scenario 1', order_index: 1 },
        { id: 'scenario-2', profile_id: mockProfileId, name: 'Scenario 2', order_index: 2 }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockScenarios, error: null }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const scenarios = await RoleplayService.getScenariosByProfile(mockProfileId);

      expect(scenarios).toEqual(mockScenarios);
      expect(mockSchema).toHaveBeenCalledWith('maity');
      expect(mockFrom).toHaveBeenCalledWith('voice_scenarios');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('profile_id', mockProfileId);
      expect(mockQuery.order).toHaveBeenCalledWith('order_index', { ascending: true });
    });

    it('should return empty array when no scenarios found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const scenarios = await RoleplayService.getScenariosByProfile(mockProfileId);

      expect(scenarios).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Failed to fetch scenarios');

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.getScenariosByProfile(mockProfileId)
      ).rejects.toThrow('Failed to fetch scenarios');
    });

    it('should log error to console when fetch fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.getScenariosByProfile(mockProfileId)
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching scenarios:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getUserProgress', () => {
    it('should get user progress for all profiles', async () => {
      const mockProgress = [
        { user_id: mockUserId, profile_name: 'CEO', current_level: 2, scenarios_completed: 3 },
        { user_id: mockUserId, profile_name: 'MANAGER', current_level: 1, scenarios_completed: 1 }
      ];

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockProgress, error: null }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const progress = await RoleplayService.getUserProgress(mockUserId);

      expect(progress).toEqual(mockProgress);
      expect(mockSchema).toHaveBeenCalledWith('maity');
      expect(mockFrom).toHaveBeenCalledWith('voice_user_progress');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', mockUserId);
    });

    it('should return empty array when no progress found', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [], error: null }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      const progress = await RoleplayService.getUserProgress(mockUserId);

      expect(progress).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Failed to fetch progress');

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.getUserProgress(mockUserId)
      ).rejects.toThrow('Failed to fetch progress');
    });

    it('should log error to console when fetch fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: null, error }))
      };

      const mockFrom = vi.fn(() => mockQuery);
      const mockSchema = vi.fn(() => ({ from: mockFrom }));

      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema as any);

      await expect(
        RoleplayService.getUserProgress(mockUserId)
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user progress:', error);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    it('should create session, update it, and end it', async () => {
      // Create session
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockSessionId,
        error: null
      });

      const sessionId = await RoleplayService.createSession(mockUserId, mockProfileName);
      expect(sessionId).toBe(mockSessionId);

      // Update session
      const mockQuery1 = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { score: 85 }, error: null })
      };

      const mockFrom1 = vi.fn(() => mockQuery1);
      const mockSchema1 = vi.fn(() => ({ from: mockFrom1 }));
      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema1 as any);

      await RoleplayService.updateSession(sessionId!, { score: 85 });

      // End session
      const mockQuery2 = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { status: 'completed' }, error: null })
      };

      const mockFrom2 = vi.fn(() => mockQuery2);
      const mockSchema2 = vi.fn(() => ({ from: mockFrom2 }));
      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema2 as any);

      await RoleplayService.endSession(sessionId!);
    });

    it('should handle complete user flow', async () => {
      // 1. Create initial progress
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { success: true },
        error: null
      });

      await RoleplayService.createInitialProgress(mockAuthId, mockProfileName);

      // 2. Get or create progress
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: { current_level: 1 },
        error: null
      });

      await RoleplayService.getOrCreateProgress(mockUserId, mockProfileName);

      // 3. Get profiles
      const mockQuery1 = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [{ name: 'CEO' }], error: null }))
      };

      const mockFrom1 = vi.fn(() => mockQuery1);
      const mockSchema1 = vi.fn(() => ({ from: mockFrom1 }));
      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema1 as any);

      const profiles = await RoleplayService.getProfiles();
      expect(profiles).toBeDefined();

      // 4. Get scenarios
      const mockQuery2 = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: [{ name: 'Scenario 1' }], error: null }))
      };

      const mockFrom2 = vi.fn(() => mockQuery2);
      const mockSchema2 = vi.fn(() => ({ from: mockFrom2 }));
      vi.mocked(supabase.schema).mockImplementationOnce(mockSchema2 as any);

      const scenarios = await RoleplayService.getScenariosByProfile(mockProfileId);
      expect(scenarios).toBeDefined();

      // 5. Create session
      vi.mocked(supabase.rpc).mockResolvedValueOnce({
        data: mockSessionId,
        error: null
      });

      const sessionId = await RoleplayService.createSession(mockUserId, mockProfileName);
      expect(sessionId).toBe(mockSessionId);
    });
  });
});
