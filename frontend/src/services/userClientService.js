// src/services/userClientService.js
export async function searchUsersClient(query) {
	const normalizedQuery = typeof query === 'string' ? query.trim() : '';

	if (normalizedQuery.length < 2) {
		return [];
	}

	const response = await fetch(
		`/api/users/search?query=${encodeURIComponent(normalizedQuery)}`,
		{
			method: 'GET',
			credentials: 'include',
			headers: {
				Accept: 'application/json',
			},
		},
	);

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		const message =
			typeof data?.message === 'string' && data.message.trim() !== ''
				? data.message.trim()
				: `HTTP ${response.status}`;

		throw new Error(message);
	}

	return Array.isArray(data?.data?.users) ? data.data.users : [];
}
