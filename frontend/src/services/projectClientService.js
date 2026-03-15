// src/services/projectClientService.js
async function parseJsonSafe(response) {
	return response.json().catch(() => null);
}

function getErrorMessage(data, response) {
	return typeof data?.message === 'string' && data.message.trim() !== ''
		? data.message.trim()
		: `HTTP ${response.status}`;
}

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

	const data = await parseJsonSafe(response);

	if (!response.ok) {
		throw new Error(getErrorMessage(data, response));
	}

	return data;
}

export async function updateProjectClient({
	projectId,
	title,
	description,
	contributors = [],
	initialContributorIds = [],
}) {
	const response = await fetch(`/api/projects/${projectId}`, {
		method: 'PUT',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			title,
			description,
			contributors,
			initialContributorIds,
		}),
	});

	const data = await parseJsonSafe(response);

	if (!response.ok) {
		throw new Error(getErrorMessage(data, response));
	}

	return data;
}

export async function deleteProjectClient(projectId) {
	const response = await fetch(`/api/projects/${projectId}`, {
		method: 'DELETE',
		credentials: 'include',
		headers: {
			Accept: 'application/json',
		},
	});

	const data = await parseJsonSafe(response);

	if (!response.ok) {
		throw new Error(getErrorMessage(data, response));
	}

	return data;
}
