/**
 * @file src/services/dashboardService.js
 * @description
 * Services metier du dashboard Abricot.
 */

import { apiRequest } from '@/services/apiClient';

/**
 * Recupere les taches assignees a l'utilisateur connecte.
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
 * Recupere les projets dans lesquels l'utilisateur a des taches assignees.
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
