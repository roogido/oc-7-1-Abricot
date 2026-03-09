/**
 * @file src/services/apiClient.js
 * @description
 * Client HTTP générique pour communiquer avec l'API backend Abricot.
 */

import { getApiBaseUrl } from '@/lib/env';

/**
 * Erreur HTTP structurée levée par le client API.
 */
export class ApiClientError extends Error {
	/**
	 * Crée une erreur API enrichie.
	 *
	 * @param {string} message Message d'erreur
	 * @param {Object} [options={}] Options de l'erreur
	 * @param {number} [options.status=500] Code HTTP
	 * @param {Object|null} [options.data=null] Corps de réponse associé
	 */
	constructor(message, { status = 500, data = null } = {}) {
		super(message);
		this.name = 'ApiClientError';
		this.status = status;
		this.data = data;
	}
}

/**
 * Normalise un chemin pour garantir une concaténation propre avec l'URL de base.
 *
 * @param {string} path Chemin d'API à normaliser
 * @returns {string} Chemin normalisé
 * @throws {Error} Si le chemin est vide ou invalide
 */
function normalizePath(path) {
	if (typeof path !== 'string' || path.trim() === '') {
		throw new Error('API path is required');
	}

	return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Construit les en-têtes finaux de la requête.
 *
 * @param {Object} options Options de construction
 * @param {Object} [options.headers={}] En-têtes additionnels
 * @param {string|null} [options.token=null] JWT éventuel
 * @param {boolean} [options.hasJsonBody=false] Indique si le body est JSON
 * @returns {Object} En-têtes HTTP finaux
 */
function buildHeaders({ headers = {}, token = null, hasJsonBody = false }) {
	const finalHeaders = {
		Accept: 'application/json',
		...headers,
	};

	if (hasJsonBody && !finalHeaders['Content-Type']) {
		finalHeaders['Content-Type'] = 'application/json';
	}

	if (token) {
		finalHeaders.Authorization = `Bearer ${token}`;
	}

	return finalHeaders;
}

/**
 * Parse la réponse en JSON si possible.
 *
 * @param {Response} response Réponse HTTP
 * @returns {Promise<Object|null>} Corps JSON ou null
 */
async function parseJsonResponse(response) {
	// Tolère les réponses vides ou non JSON
	return response.json().catch(() => null);
}

/**
 * Envoie une requête HTTP vers le backend Abricot.
 *
 * @param {string} path Chemin d'API
 * @param {Object} [options={}] Options de requête
 * @param {string} [options.method='GET'] Méthode HTTP
 * @param {Object|null} [options.body=null] Corps JSON à envoyer
 * @param {Object} [options.headers={}] En-têtes additionnels
 * @param {string|null} [options.token=null] JWT éventuel
 * @param {RequestCache} [options.cache='no-store'] Politique de cache fetch
 * @returns {Promise<Object|null>} Réponse JSON parsée
 * @throws {ApiClientError} Si la requête échoue
 */
export async function apiRequest(
	path,
	{
		method = 'GET',
		body = null,
		headers = {},
		token = null,
		cache = 'no-store',
	} = {},
) {
	const apiBaseUrl = getApiBaseUrl();
	const normalizedPath = normalizePath(path);
	const upperMethod = method.toUpperCase();
	const hasJsonBody =
		body !== null && upperMethod !== 'GET' && upperMethod !== 'HEAD';

	const response = await fetch(`${apiBaseUrl}${normalizedPath}`, {
		method: upperMethod,
		cache,
		headers: buildHeaders({ headers, token, hasJsonBody }),
		body: hasJsonBody ? JSON.stringify(body) : undefined,
	});

	const data = await parseJsonResponse(response);

	if (!response.ok) {
		throw new ApiClientError(data?.message || `HTTP ${response.status}`, {
			status: response.status,
			data,
		});
	}

	// Certains endpoints peuvent signaler un échec dans le payload JSON
	if (data && data.success === false) {
		throw new ApiClientError(data.message || 'API request failed', {
			status: response.status || 500,
			data,
		});
	}

	return data;
}
