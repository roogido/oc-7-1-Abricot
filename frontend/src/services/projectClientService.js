/**
 * @file src/services/projectClientService.js
 * @description
 * Services client pour les projets via les routes internes Next.js.
 */

import { internalApiRequest } from '@/services/internalApiClient';

/**
 * Crée un projet via la route interne Next.js.
 *
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.description
 * @param {string[]} [params.contributors=[]]
 * @returns {Promise<Object|null>}
 */
export async function createProjectClient({
	title,
	description,
	contributors = [],
}) {
	return internalApiRequest('/api/projects', {
		method: 'POST',
		body: {
			title,
			description,
			contributors,
		},
	});
}

/**
 * Met à jour un projet via la route interne Next.js.
 *
 * @param {Object} params
 * @param {string} params.projectId
 * @param {string} params.title
 * @param {string} params.description
 * @param {string[]} [params.contributors=[]]
 * @param {string[]} [params.initialContributorIds=[]]
 * @returns {Promise<Object|null>}
 */
export async function updateProjectClient({
	projectId,
	title,
	description,
	contributors = [],
	initialContributorIds = [],
}) {
	return internalApiRequest(`/api/projects/${projectId}`, {
		method: 'PUT',
		body: {
			title,
			description,
			contributors,
			initialContributorIds,
		},
	});
}

/**
 * Supprime un projet via la route interne Next.js.
 *
 * @param {string} projectId
 * @returns {Promise<Object|null>}
 */
export async function deleteProjectClient(projectId) {
	return internalApiRequest(`/api/projects/${projectId}`, {
		method: 'DELETE',
	});
}
