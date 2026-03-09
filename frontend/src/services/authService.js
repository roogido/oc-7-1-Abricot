/**
 * @file src/services/authService.js
 * @description
 * Services metiers d'authentification pour communiquer avec
 * l'API backend Abricot.
 */

import { apiRequest } from '@/services/apiClient';

/**
 * Authentifie un utilisateur.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<Object>}
 */
export async function loginUser({ email, password }) {
	return apiRequest('/auth/login', {
		method: 'POST',
		body: {
			email,
			password,
		},
	});
}

/**
 * Inscrit un nouvel utilisateur.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<Object>}
 */
export async function registerUser({ email, password }) {
	return apiRequest('/auth/register', {
		method: 'POST',
		body: {
			email,
			password,
		},
	});
}

/**
 * Recupere le profil de l'utilisateur authentifie.
 *
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function getCurrentUser(token) {
	return apiRequest('/auth/profile', {
		method: 'GET',
		token,
	});
}

/**
 * Met a jour le profil de l'utilisateur authentifie.
 *
 * @param {string} token
 * @param {Object} payload
 * @param {string} [payload.name]
 * @param {string} [payload.email]
 * @returns {Promise<Object>}
 */
export async function updateCurrentUserProfile(token, payload) {
	return apiRequest('/auth/profile', {
		method: 'PUT',
		token,
		body: payload,
	});
}

/**
 * Met a jour le mot de passe de l'utilisateur authentifie.
 *
 * @param {string} token
 * @param {Object} payload
 * @param {string} payload.currentPassword
 * @param {string} payload.newPassword
 * @returns {Promise<Object>}
 */
export async function updateCurrentUserPassword(token, payload) {
	return apiRequest('/auth/password', {
		method: 'PUT',
		token,
		body: payload,
	});
}
