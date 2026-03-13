/**
 * @file src/services/commentService.js
 * @description
 * Services client pour les commentaires de taches.
 */

/**
 * Cree un commentaire sur une tache via la route interne Next.js.
 *
 * @param {Object} params
 * @param {string} params.projectId
 * @param {string} params.taskId
 * @param {string} params.content
 * @returns {Promise<Object|null>}
 */
export async function createTaskComment({ projectId, taskId, content }) {
	const response = await fetch(
		`/api/projects/${projectId}/tasks/${taskId}/comments`,
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({ content }),
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

	return data;
}
