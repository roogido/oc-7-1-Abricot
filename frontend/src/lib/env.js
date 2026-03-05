/**
 * @file @/lib/env.js
 * @description 
 * Centralise l'accès aux variables d'environnement
 * utilisées par l'application (API, configuration runtime, etc.).
 *
 * @author Salem Hadjali
 * @date 05-03-2026
 */


export function getApiBaseUrl() {
	const url =
		process.env.API_BASE_URL ||
		(process.env.NODE_ENV === 'development'
			? 'http://localhost:8000'
			: null);

	if (!url) {
		throw new Error('API_BASE_URL must be defined in production');
	}

	return url.replace(/\/+$/, '');
}