// src/services/projectClientService.js
export async function createProjectClient({
	title,
	description,
	contributors = [],
}) {
	const response = await fetch('/api/projects', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			title,
			description,
			contributors,
		}),
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		const message =
			typeof data?.message === 'string' && data.message.trim() !== ''
				? data.message.trim()
				: `HTTP ${response.status}`;

		throw new Error(message);
	}

	return data;
}
