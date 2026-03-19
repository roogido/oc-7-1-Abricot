/**
 * @file src/services/aiTaskClientService.js
 * @description
 * Services client pour la génération assistée de tâches via l'API interne Next.js.
 */

import { internalApiRequest } from '@/services/internalApiClient';

/**
 * Demande à l'API interne de générer une liste de tâches suggérées.
 *
 * @param {Object} params
 * @param {string} params.projectId
 * @param {string} params.projectName
 * @param {string} [params.projectDescription='']
 * @param {string} params.prompt
 * @returns {Promise<Object|null>}
 */
export async function generateTaskSuggestionsClient({
	projectId,
	projectName,
	projectDescription = '',
	prompt,
}) {
	return internalApiRequest('/api/ai/task-suggestions', {
		method: 'POST',
		body: {
			projectId,
			projectName,
			projectDescription,
			prompt,
		},
	});
}
