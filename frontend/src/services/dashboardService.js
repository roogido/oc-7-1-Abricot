/**
 * @file src/services/dashboardService.js
 * @description
 * Services metier du dashboard Abricot.
 */

import { apiRequest } from '@/services/apiClient';

/**
 * Recupere les tâches assignées à l'utilisateur connecté.
 *
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function getAssignedTasks(token) {
	return apiRequest('/dashboard/assigned-tasks', {
		method: 'GET',
		token,
	});
}

/**
 * Recupere les projets dans lesquels l'utilisateur a des tâches assignées.
 *
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function getProjectsWithTasks(token) {
	return apiRequest('/dashboard/projects-with-tasks', {
		method: 'GET',
		token,
	});
}
