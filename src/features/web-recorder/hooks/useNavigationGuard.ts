/**
 * Navigation Guard Hook
 *
 * Intercepts navigation when there's an active recording.
 * Shows a modal to save the recording before leaving.
 *
 * NOTE: Does NOT use useBlocker (requires data router).
 * Instead uses:
 * - popstate event for browser back/forward
 * - click capture for internal links
 * - beforeunload for tab close/refresh
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseNavigationGuardOptions {
  /** Whether the guard is active (recording in progress) */
  isActive: boolean;
  /** Function to stop and save the recording, returns conversationId */
  onStopAndSave: () => Promise<string | undefined>;
}

interface UseNavigationGuardReturn {
  /** Whether the modal should be shown */
  showModal: boolean;
  /** Whether saving is in progress */
  isSaving: boolean;
  /** Handler to cancel and continue recording */
  onCancel: () => void;
  /** Handler to save and navigate */
  onConfirm: () => void;
}

export function useNavigationGuard({
  isActive,
  onStopAndSave,
}: UseNavigationGuardOptions): UseNavigationGuardReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const currentPathRef = useRef(location.pathname);

  // Keep current path in sync
  useEffect(() => {
    currentPathRef.current = location.pathname;
  }, [location.pathname]);

  // 1. Handle beforeunload for browser close/refresh
  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom messages, but we need to set returnValue
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive]);

  // 2. Handle popstate for browser back/forward buttons
  useEffect(() => {
    if (!isActive || isSaving) return;

    // Push current state to history stack so we can intercept back
    window.history.pushState(null, '', location.pathname);

    const handlePopState = () => {
      // Push state again to prevent navigation
      window.history.pushState(null, '', currentPathRef.current);
      setShowModal(true);
      setPendingPath(null); // No specific path for back button
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isActive, isSaving, location.pathname]);

  // 3. Click handler in capture phase to intercept internal links
  useEffect(() => {
    if (!isActive || isSaving) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement | null;

      if (!link) return;

      const href = link.getAttribute('href');

      // Ignore external links, hash links, or empty hrefs
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
        return;
      }

      // Ignore same page links
      if (href === location.pathname) {
        return;
      }

      // Intercept internal navigation
      e.preventDefault();
      e.stopPropagation();
      setShowModal(true);
      setPendingPath(href);
    };

    // Use capture phase to intercept before React Router
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isActive, isSaving, location.pathname]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setPendingPath(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsSaving(true);
    try {
      // Stop and save the recording
      const conversationId = await onStopAndSave();
      setShowModal(false);

      // Navigate to the saved conversation or pending path
      if (conversationId) {
        navigate(`/conversaciones?conversation=${conversationId}`);
      } else if (pendingPath) {
        navigate(pendingPath);
      } else {
        navigate('/conversaciones');
      }
    } catch (error) {
      console.error('[NavigationGuard] Error saving recording:', error);
      // Keep modal open on error, allow user to retry
      setIsSaving(false);
    }
  }, [onStopAndSave, navigate, pendingPath]);

  return {
    showModal,
    isSaving,
    onCancel: handleCancel,
    onConfirm: handleConfirm,
  };
}
