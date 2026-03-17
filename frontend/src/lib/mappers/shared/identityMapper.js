/**
 * @file src/lib/mappers/shared/identityMapper.js
 * @description
 * Helpers d'identité partagés pour les mappers Abricot.
 */

import { DEFAULT_INITIALS } from './mapperConstants';

/**
 * Construit des initiales à partir d'un nom complet.
 *
 * @param {string|null|undefined} fullName
 * @returns {string}
 */
export function getInitials(fullName) {
	if (typeof fullName !== 'string' || fullName.trim() === '') {
		return DEFAULT_INITIALS;
	}

	const parts = fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2);

	return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}
