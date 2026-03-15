// src/services/taskClientService.js
async function parseJsonSafe(response) {
	return response.json().catch(() => null);
}

function getErrorMessage(data, response) {
	return typeof data?.message === 'string' && data.message.trim() !== ''
		? data.message.trim()
		: `HTTP ${response.status}`;
}

export async function createTaskClient({
	projectId,
	title,
	description,
	dueDate,
	assigneeIds = [],
}) {
	const response = await fetch(`/api/projects/${projectId}/tasks`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			title,
			description,
			dueDate,
			assigneeIds,
		}),
	});

	const data = await parseJsonSafe(response);

	if (!response.ok) {
		throw new Error(getErrorMessage(data, response));
	}

	return data;
}
