/**
 * @file src/services/commentClientService.js
 * @description
 * Services client pour les commentaires de tâches via les routes internes Next.js.
 */

import { internalApiRequest } from '@/services/internalApiClient';

/**
 * Crée un commentaire sur une tâche via la route interne Next.js.
 *
 * @param {Object} params
 * @param {string} params.projectId
 * @param {string} params.taskId
 * @param {string} params.content
 * @returns {Promise<Object|null>}
 */
export async function createTaskCommentClient({ projectId, taskId, content }) {
	return internalApiRequest(
		`/api/projects/${projectId}/tasks/${taskId}/comments`,
		{
			method: 'POST',
			body: {
				content,
			},
		},
	);
}
