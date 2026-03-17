/**
 * @file src/lib/mappers/shared/taskUiMapper.js
 * @description
 * Helpers UI partagés pour les tâches Abricot.
 */

import { DEFAULT_UNKNOWN_STATUS_LABEL } from './mapperConstants';

/**
 * Retourne le libellé UI du statut d'une tâche.
 *
 * @param {string} status
 * @returns {string}
 */
export function mapTaskStatusLabel(status) {
	switch (status) {
		case 'TODO':
			return 'À faire';
		case 'IN_PROGRESS':
			return 'En cours';
		case 'DONE':
			return 'Terminée';
		default:
			return DEFAULT_UNKNOWN_STATUS_LABEL;
	}
}

/**
 * Retourne la variante visuelle UI du statut d'une tâche.
 *
 * @param {string} status
 * @returns {'red'|'orange'|'green'}
 */
export function mapTaskStatusVariant(status) {
	switch (status) {
		case 'TODO':
			return 'red';
		case 'IN_PROGRESS':
			return 'orange';
		case 'DONE':
			return 'green';
		default:
			return 'red';
	}
}

/**
 * Retourne un ordre numérique associé à la priorité d'une tâche.
 *
 * Ordre métier :
 * HIGH -> MEDIUM -> LOW
 *
 * @param {string} priority
 * @returns {number}
 */
export function getTaskPriorityOrder(priority) {
	switch (priority) {
		case 'HIGH':
			return 0;
		case 'MEDIUM':
			return 1;
		case 'LOW':
			return 2;
		default:
			return 99;
	}
}

/**
 * Retourne un ordre numérique associé au statut d'une tâche.
 *
 * @param {string} status
 * @returns {number}
 */
export function getTaskStatusOrder(status) {
	switch (status) {
		case 'TODO':
			return 0;
		case 'IN_PROGRESS':
			return 1;
		case 'DONE':
			return 2;
		default:
			return 99;
	}
}

/**
 * Retourne le timestamp de la date d'échéance d'une tâche.
 *
 * @param {Object} task
 * @returns {number}
 */
export function getTaskDueDateTime(task) {
	if (typeof task?.dueDateRaw !== 'string' || task.dueDateRaw.trim() === '') {
		return Number.MAX_SAFE_INTEGER;
	}

	const timestamp = new Date(task.dueDateRaw).getTime();

	return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

/**
 * Compare deux tâches selon l'ordre métier :
 * priorité, puis statut, puis date d'échéance.
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
export function compareTasksByStatusAndDueDate(a, b) {
	const priorityOrderDiff =
		getTaskPriorityOrder(a?.priority) - getTaskPriorityOrder(b?.priority);

	if (priorityOrderDiff !== 0) {
		return priorityOrderDiff;
	}

	const statusOrderDiff =
		getTaskStatusOrder(a?.status) - getTaskStatusOrder(b?.status);

	if (statusOrderDiff !== 0) {
		return statusOrderDiff;
	}

	return getTaskDueDateTime(a) - getTaskDueDateTime(b);
}
