// src/services/taskClientService.js
async function parseJsonSafe(response) {
	return response.json().catch(() => null);
}

function getErrorMessage(data, response) {
	return typeof data?.message === 'string' && data.message.trim() !== ''
		? data.message.trim()
		: `HTTP ${response.status}`;
}

export async function createTaskCommentClient({
	projectId,
	taskId,
	content,
}) {
	const response = await fetch(
		`/api/projects/${projectId}/tasks/${taskId}/comments`,
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				content,
			}),
		},
	);

	const data = await parseJsonSafe(response);

	if (!response.ok) {
		throw new Error(getErrorMessage(data, response));
	}

	return data;
}

export async function createTaskClient({
	projectId,
	title,
	description,
	dueDate,
	priority = 'LOW',
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
			priority,
			assigneeIds,
		}),
	});

	const data = await parseJsonSafe(response);

	if (!response.ok) {
		throw new Error(getErrorMessage(data, response));
	}

	return data;
}

export async function updateTaskClient({
	projectId,
	taskId,
	title,
	description,
	dueDate,
	status,
	priority,
	assigneeIds = [],
}) {
	const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
		method: 'PUT',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			title,
			description,
			dueDate,
			status,
			priority,
			assigneeIds,
		}),
	});

	const data = await parseJsonSafe(response);

	if (!response.ok) {
		throw new Error(getErrorMessage(data, response));
	}

	return data;
}

export async function deleteTaskClient(projectId, taskId) {
	const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
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
