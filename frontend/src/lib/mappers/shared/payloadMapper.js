/**
 * @file src/lib/mappers/shared/payloadMapper.js
 * @description
 * Helpers partagés pour extraire et valider les données des payloads API Abricot.
 */

/**
 * Extrait une valeur d'un payload à partir d'un sélecteur.
 *
 * @param {Object} payload
 * @param {(payload: Object) => any} selector
 * @returns {any}
 */
function selectPayloadValue(payload, selector) {
	if (!payload || typeof payload !== 'object') {
		return undefined;
	}

	return selector(payload);
}

/**
 * Extrait un objet requis depuis un payload.
 *
 * @param {Object} payload
 * @param {(payload: Object) => any} selector
 * @param {string} errorMessage
 * @returns {Object}
 * @throws {Error}
 */
export function extractRequiredObject(payload, selector, errorMessage) {
	const candidate = selectPayloadValue(payload, selector);

	if (
		!candidate ||
		typeof candidate !== 'object' ||
		Array.isArray(candidate)
	) {
		throw new Error(errorMessage);
	}

	return candidate;
}

/**
 * Extrait un tableau requis depuis un payload.
 *
 * @param {Object} payload
 * @param {(payload: Object) => any} selector
 * @param {string} errorMessage
 * @returns {Object[]}
 * @throws {Error}
 */
export function extractRequiredArray(payload, selector, errorMessage) {
	const candidate = selectPayloadValue(payload, selector);

	if (!Array.isArray(candidate)) {
		throw new Error(errorMessage);
	}

	return candidate;
}
