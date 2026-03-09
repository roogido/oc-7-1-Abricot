/**
 * @file @/lib/env.js
 * @description
 * Centralise l'accès aux variables d'environnement de l'application.
 */

/**
 * Retourne l'URL de base de l'API backend.
 * Utilise API_BASE_URL si définie, sinon une valeur par défaut en développement.
 *
 * @returns {string} URL de base de l'API
 * @throws {Error} Si aucune URL n'est définie en production
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

	// Supprime les slashs finaux éventuels
	return url.replace(/\/+$/, '');
}
