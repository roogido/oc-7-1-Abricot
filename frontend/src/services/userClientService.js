/**
 * @file src/services/userClientService.js
 * @description
 * Services client pour les utilisateurs via les routes internes Next.js.
 */

import { internalApiRequest } from '@/services/internalApiClient';

/**
 * Recherche des utilisateurs via la route interne Next.js.
 *
 * @param {string} query
 * @returns {Promise<Object[]>}
 */
export async function searchUsersClient(query) {
	const normalizedQuery = typeof query === 'string' ? query.trim() : '';

	if (normalizedQuery.length < 2) {
		return [];
	}

	const data = await internalApiRequest(
		`/api/users/search?query=${encodeURIComponent(normalizedQuery)}`,
		{
			method: 'GET',
		},
	);

	return Array.isArray(data?.data?.users) ? data.data.users : [];
}
