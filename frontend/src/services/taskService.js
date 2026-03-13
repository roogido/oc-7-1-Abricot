/**
 * @file src/services/taskService.js
 * @description
 * Services metier des taches Abricot.
 */

import { apiRequest } from '@/services/apiClient';

/**
 * Recupere le detail d'une tache.
 *
 * @param {string} token
 * @param {string} projectId
 * @param {string} taskId
 * @returns {Promise<Object>}
 */
export async function getTaskById(token, projectId, taskId) {
	return apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
		method: 'GET',
		token,
	});
}
