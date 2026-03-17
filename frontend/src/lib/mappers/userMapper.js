/**
 * @file src/lib/mappers/userMapper.js
 * @description
 * Fonctions de transformation des données utilisateur issues de l'API Abricot.
 * Permet de sécuriser et normaliser les objets utilisateur côté frontend.
 */

import { extractRequiredObject } from './shared/payloadMapper';

/**
 * Transforme un objet utilisateur brut provenant de l'API
 * en structure utilisateur sécurisée pour le frontend.
 *
 * @param {Object} rawUser
 * @returns {Object}
 * @throws {Error}
 */
export function mapApiUser(rawUser) {
	if (!rawUser || typeof rawUser !== 'object' || Array.isArray(rawUser)) {
		throw new Error('Invalid user payload');
	}

	return {
		id: typeof rawUser.id === 'string' ? rawUser.id : '',
		email: typeof rawUser.email === 'string' ? rawUser.email : '',
		name: typeof rawUser.name === 'string' ? rawUser.name : '',
		createdAt: rawUser.createdAt ?? null,
		updatedAt: rawUser.updatedAt ?? null,
	};
}

/**
 * Extrait l'utilisateur depuis un payload API Abricot
 * puis applique la normalisation via mapApiUser().
 *
 * @param {Object} payload
 * @returns {Object}
 * @throws {Error}
 */
export function extractApiUser(payload) {
	const user = extractRequiredObject(
		payload,
		(currentPayload) => currentPayload?.data?.user ?? currentPayload?.data,
		'User not found in API payload',
	);

	return mapApiUser(user);
}
