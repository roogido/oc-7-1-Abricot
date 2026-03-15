/**
 * @file src/lib/mappers/userMapper.js
 * @description
 * Fonctions de transformation des données utilisateur issues de l'API Abricot.
 * Permet de sécuriser et normaliser les objets utilisateur côté frontend.
 */

/**
 * Transforme un objet utilisateur brut provenant de l'API
 * en structure utilisateur sécurisée pour le frontend.
 *
 * @param {Object} rawUser
 * @returns {Object}
 * @throws {Error}
 */
export function mapApiUser(rawUser) {
	// Vérifie que le payload utilisateur est valide
	if (!rawUser || typeof rawUser !== 'object') {
		throw new Error('Invalid user payload');
	}

	return {
		// Normalisation des champs pour garantir un type stable côté frontend
		id: typeof rawUser.id === 'string' ? rawUser.id : '',
		email: typeof rawUser.email === 'string' ? rawUser.email : '',
		name: typeof rawUser.name === 'string' ? rawUser.name : '',

		// Dates retournées telles quelles si présentes
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
	// Supporte deux formats possibles de réponse API
	const candidate = payload?.data?.user ?? payload?.data ?? null;

	// Vérifie que l'utilisateur est bien présent dans la réponse
	if (!candidate || typeof candidate !== 'object') {
		throw new Error('User not found in API payload');
	}

	// Transforme l'utilisateur brut en objet frontend normalisé
	return mapApiUser(candidate);
}
