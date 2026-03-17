/**
 * @file src/services/taskClientService.js
 * @description
 * Services client pour les tâches via les routes internes Next.js.
 */

import { internalApiRequest } from '@/services/internalApiClient';

/**
 * Crée une tâche via la route interne Next.js.
 *
 * @param {Object} params
 * @param {string} params.projectId
 * @param {string} params.title
 * @param {string} params.description
 * @param {string} params.dueDate
 * @param {string} [params.priority='LOW']
 * @param {string[]} [params.assigneeIds=[]]
 * @returns {Promise<Object|null>}
 */
export async function createTaskClient({
	projectId,
	title,
	description,
	dueDate,
	priority = 'LOW',
	assigneeIds = [],
}) {
	return internalApiRequest(`/api/projects/${projectId}/tasks`, {
		method: 'POST',
		body: {
			title,
			description,
			dueDate,
			priority,
			assigneeIds,
		},
	});
}

/**
 * Met à jour une tâche via la route interne Next.js.
 *
 * @param {Object} params
 * @param {string} params.projectId
 * @param {string} params.taskId
 * @param {string} params.title
 * @param {string} params.description
 * @param {string} params.dueDate
 * @param {string} params.status
 * @param {string} params.priority
 * @param {string[]} [params.assigneeIds=[]]
 * @returns {Promise<Object|null>}
 */
export async function updateTaskClient({
	projectId,
	taskId,
	title,
	description,
	dueDate,
	status,
	priority,
	assigneeIds = [],
}) {
	return internalApiRequest(`/api/projects/${projectId}/tasks/${taskId}`, {
		method: 'PUT',
		body: {
			title,
			description,
			dueDate,
			status,
			priority,
			assigneeIds,
		},
	});
}

/**
 * Supprime une tâche via la route interne Next.js.
 *
 * @param {string} projectId
 * @param {string} taskId
 * @returns {Promise<Object|null>}
 */
export async function deleteTaskClient(projectId, taskId) {
	return internalApiRequest(`/api/projects/${projectId}/tasks/${taskId}`, {
		method: 'DELETE',
	});
}
