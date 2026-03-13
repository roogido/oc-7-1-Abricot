/**
 * @file src/services/projectService.js
 * @description
 * Services metier des projets Abricot.
 */

import { apiRequest } from '@/services/apiClient';

/**
 * Recupere tous les projets de l'utilisateur connecte.
 *
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function getProjects(token) {
	return apiRequest('/projects', {
		method: 'GET',
		token,
	});
}

/**
 * Recupere un projet par son identifiant.
 *
 * @param {string} token
 * @param {string} projectId
 * @returns {Promise<Object>}
 */
export async function getProjectById(token, projectId) {
	return apiRequest(`/projects/${projectId}`, {
		method: 'GET',
		token,
	});
}

/**
 * Recupere toutes les taches d'un projet.
 *
 * @param {string} token
 * @param {string} projectId
 * @returns {Promise<Object>}
 */
export async function getProjectTasks(token, projectId) {
	return apiRequest(`/projects/${projectId}/tasks`, {
		method: 'GET',
		token,
	});
}
