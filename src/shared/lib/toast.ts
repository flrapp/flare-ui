import { toast as sonnerToast } from 'sonner';

/**
 * Centralized toast notification utilities.
 *
 * Provides standardized toast message patterns across the application.
 * Wraps Sonner toast library with consistent formatting.
 *
 * Message patterns:
 * - Success: "{Entity} {action} successfully"
 * - Error: "Failed to {action} {entity}. {reason?}"
 * - Info: "{Information or status update}"
 *
 * @example
 * toast.success('project', 'created');
 * // "Project created successfully"
 *
 * @example
 * toast.error('project', 'create', 'Name already exists');
 * // "Failed to create project. Name already exists"
 *
 * @example
 * toast.info('Password must be changed on next login');
 */

export const toast = {
  /**
   * Show success toast with standardized message format.
   * Pattern: "{Entity} {action} successfully"
   *
   * @param entity - The entity being acted upon (e.g., 'project', 'user', 'flag')
   * @param action - The action performed (e.g., 'created', 'updated', 'deleted')
   */
  success: (entity: string, action: string) => {
    const capitalizedEntity = entity.charAt(0).toUpperCase() + entity.slice(1);
    sonnerToast.success(`${capitalizedEntity} ${action} successfully`);
  },

  /**
   * Show error toast with standardized message format.
   * Pattern: "Failed to {action} {entity}. {reason?}"
   *
   * @param entity - The entity being acted upon (e.g., 'project', 'user', 'flag')
   * @param action - The action attempted (e.g., 'create', 'update', 'delete')
   * @param reason - Optional reason for the failure
   */
  error: (entity: string, action: string, reason?: string) => {
    const message = `Failed to ${action} ${entity}${reason ? `. ${reason}` : ''}`;
    sonnerToast.error(message);
  },

  /**
   * Show info toast with custom message.
   *
   * @param message - The informational message to display
   */
  info: (message: string) => {
    sonnerToast.info(message);
  },

  /**
   * Show toast for a promise with loading, success, and error states.
   *
   * @param promise - The promise to track
   * @param messages - Messages for each state
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },
};
