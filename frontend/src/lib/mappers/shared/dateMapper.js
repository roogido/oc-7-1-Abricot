/**
 * @file src/lib/mappers/shared/dateMapper.js
 * @description
 * Helpers de formatage de dates partagés pour les mappers Abricot.
 */

/**
 * Convertit une valeur de date en instance Date valide.
 *
 * @param {string|null|undefined} dateValue
 * @returns {Date|null}
 */
function toValidDate(dateValue) {
	if (typeof dateValue !== 'string' || dateValue.trim() === '') {
		return null;
	}

	const date = new Date(dateValue);

	return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formate une date d'échéance courte.
 *
 * Exemple : "15 févr."
 *
 * @param {string|null|undefined} dateValue
 * @returns {string}
 */
export function formatShortDueDate(dateValue) {
	const date = toValidDate(dateValue);

	if (!date) {
		return '';
	}

	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'short',
	}).format(date);
}

/**
 * Formate une date d'échéance longue.
 *
 * Exemple : "15 février 2026"
 *
 * @param {string|null|undefined} dateValue
 * @returns {string}
 */
export function formatLongDueDate(dateValue) {
	const date = toValidDate(dateValue);

	if (!date) {
		return '';
	}

	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(date);
}

/**
 * Formate une date d'échéance intermédiaire.
 *
 * Exemple : "15 février"
 *
 * @param {string|null|undefined} dateValue
 * @returns {string}
 */
export function formatMediumDueDate(dateValue) {
	const date = toValidDate(dateValue);

	if (!date) {
		return '';
	}

	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
	}).format(date);
}

/**
 * Formate une date de commentaire.
 *
 * Exemple : "15 février, 10:30"
 *
 * @param {string|null|undefined} dateValue
 * @returns {string}
 */
export function formatCommentDateLabel(dateValue) {
	const date = toValidDate(dateValue);

	if (!date) {
		return '';
	}

	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}
