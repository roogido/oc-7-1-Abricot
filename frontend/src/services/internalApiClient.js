/**
 * @file src/services/internalApiClient.js
 * @description
 * Client HTTP léger pour les routes internes Next.js (/api/*).
 */

/**
 * Parse une réponse JSON sans lever d'erreur si le corps est vide ou invalide.
 *
 * @param {Response} response
 * @returns {Promise<Object|null>}
 */
async function parseJsonSafe(response) {
	return response.json().catch(() => null);
}

/**
 * Retourne un message d'erreur exploitable à partir d'une réponse API.
 *
 * @param {Object|null} data
 * @param {Response} response
 * @returns {string}
 */
function getErrorMessage(data, response) {
	return typeof data?.message === 'string' && data.message.trim() !== ''
		? data.message.trim()
		: `HTTP ${response.status}`;
}

/**
 * Construit les en-têtes de la requête interne.
 *
 * @param {boolean} hasJsonBody
 * @returns {Object}
 */
function buildHeaders(hasJsonBody) {
	const headers = {
		Accept: 'application/json',
	};

	if (hasJsonBody) {
		headers['Content-Type'] = 'application/json';
	}

	return headers;
}

/**
 * Envoie une requête vers une route interne Next.js.
 *
 * @param {string} path
 * @param {Object} [options={}]
 * @param {string} [options.method='GET']
 * @param {Object|null} [options.body=null]
 * @returns {Promise<Object|null>}
 * @throws {Error}
 */
export async function internalApiRequest(
	path,
	{ method = 'GET', body = null } = {},
) {
	if (typeof path !== 'string' || path.trim() === '') {
		throw new Error('Internal API path is required');
	}

	const upperMethod = method.toUpperCase();
	const hasJsonBody =
		body !== null && upperMethod !== 'GET' && upperMethod !== 'HEAD';

	const response = await fetch(path, {
		method: upperMethod,
		credentials: 'include',
		headers: buildHeaders(hasJsonBody),
		body: hasJsonBody ? JSON.stringify(body) : undefined,
	});

	const data = await parseJsonSafe(response);

	if (!response.ok) {
		throw new Error(getErrorMessage(data, response));
	}

	return data;
}
