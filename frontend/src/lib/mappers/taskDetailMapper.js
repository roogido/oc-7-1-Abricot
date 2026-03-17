/**
 * @file src/lib/mappers/taskDetailMapper.js
 * @description
 * Mappers backend -> front pour la page détail tâche.
 */

import { extractRequiredObject } from './shared/payloadMapper';
import { formatLongDueDate } from './shared/dateMapper';
import { mapTaskAssignees, mapTaskComments } from './shared/taskPeopleMapper';
import {
	DEFAULT_PROJECT_NAME,
	DEFAULT_TASK_TITLE,
} from './shared/mapperConstants';
import {
	mapTaskStatusLabel,
	mapTaskStatusVariant,
} from './shared/taskUiMapper';

/**
 * Extrait la tâche brute du payload backend.
 *
 * @param {Object} payload
 * @returns {Object}
 * @throws {Error}
 */
export function extractTask(payload) {
	return extractRequiredObject(
		payload,
		(currentPayload) => currentPayload?.data?.task,
		'Task not found in API payload',
	);
}

/**
 * Mappe une tâche backend vers le modèle front détail.
 *
 * @param {Object} rawTask
 * @param {string} ownerId
 * @returns {Object}
 */
export function mapTaskDetail(rawTask, ownerId = '') {
	return {
		id: typeof rawTask?.id === 'string' ? rawTask.id : '',
		projectId:
			typeof rawTask?.projectId === 'string' ? rawTask.projectId : '',
		projectName:
			typeof rawTask?.project?.name === 'string' &&
			rawTask.project.name.trim() !== ''
				? rawTask.project.name.trim()
				: DEFAULT_PROJECT_NAME,
		title:
			typeof rawTask?.title === 'string' && rawTask.title.trim() !== ''
				? rawTask.title.trim()
				: DEFAULT_TASK_TITLE,
		description:
			typeof rawTask?.description === 'string'
				? rawTask.description.trim()
				: '',
		statusLabel: mapTaskStatusLabel(rawTask?.status),
		statusVariant: mapTaskStatusVariant(rawTask?.status),
		dueDateLabel: formatLongDueDate(rawTask?.dueDate),
		assignees: mapTaskAssignees(rawTask?.assignees, ownerId, {
			includeEmail: false,
			preserveAssignmentId: true,
		}),
		comments: mapTaskComments(rawTask?.comments, ownerId),
	};
}
