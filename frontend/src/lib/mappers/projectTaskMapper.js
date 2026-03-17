/**
 * @file src/lib/mappers/projectTaskMapper.js
 * @description
 * Mappers backend -> front pour les tâches dans le contexte projet.
 */

import { getInitials } from './shared/identityMapper';
import { formatShortDueDate } from './shared/dateMapper';
import { mapTaskAssignees, mapTaskComments } from './shared/taskPeopleMapper';
import {
	compareTasksByStatusAndDueDate,
	mapTaskStatusLabel,
	mapTaskStatusVariant,
} from './shared/taskUiMapper';

/**
 * Mappe une tâche backend vers la carte projet.
 *
 * @param {Object} rawTask
 * @param {string} ownerId
 * @returns {Object}
 */
function mapProjectTask(rawTask, ownerId) {
	return {
		id: typeof rawTask?.id === 'string' ? rawTask.id : '',
		title:
			typeof rawTask?.title === 'string' && rawTask.title.trim() !== ''
				? rawTask.title.trim()
				: 'Tâche sans titre',
		description:
			typeof rawTask?.description === 'string'
				? rawTask.description.trim()
				: '',
		status: typeof rawTask?.status === 'string' ? rawTask.status : 'TODO',
		priority:
			typeof rawTask?.priority === 'string' ? rawTask.priority : 'LOW',
		statusLabel: mapTaskStatusLabel(rawTask?.status),
		statusVariant: mapTaskStatusVariant(rawTask?.status),
		dueDateRaw: typeof rawTask?.dueDate === 'string' ? rawTask.dueDate : '',
		dueDateLabel: formatShortDueDate(rawTask?.dueDate),
		assignees: mapTaskAssignees(rawTask?.assignees, ownerId, {
			includeEmail: true,
			preserveAssignmentId: false,
		}),
		comments: mapTaskComments(rawTask?.comments, ownerId),
		defaultExpanded: false,
	};
}

/**
 * Extrait puis mappe les tâches d'un projet.
 *
 * @param {Object} payload
 * @param {string} ownerId
 * @returns {Object[]}
 * @throws {Error}
 */
export function extractProjectTasks(payload, ownerId) {
	const tasks = payload?.data?.tasks;

	if (!Array.isArray(tasks)) {
		throw new Error('Project tasks not found in API payload');
	}

	return tasks
		.map((task) => mapProjectTask(task, ownerId))
		.sort(compareTasksByStatusAndDueDate);
}

/**
 * Reconstruit la barre des contributeurs à partir des tâches réellement affichées.
 *
 * - Conserve le propriétaire en premier.
 * - Ajoute ensuite les assignés distincts rencontrés dans les tâches.
 * - Exclut le propriétaire des membres gris.
 *
 * @param {Object} project
 * @param {Object[]} projectTasks
 * @returns {Object[]}
 */
export function buildProjectContributorsFromTasks(project, projectTasks) {
	const ownerId = typeof project?.ownerId === 'string' ? project.ownerId : '';
	const ownerName =
		typeof project?.ownerName === 'string' ? project.ownerName : '';

	const contributors = [];
	const seenUserIds = new Set();

	if (ownerId !== '') {
		contributors.push({
			id: ownerId,
			initials: getInitials(ownerName),
			name: ownerName,
			variant: 'owner',
			isOwner: true,
		});

		seenUserIds.add(ownerId);
	}

	const safeTasks = Array.isArray(projectTasks) ? projectTasks : [];

	for (const task of safeTasks) {
		const assignees = Array.isArray(task?.assignees) ? task.assignees : [];

		for (const assignee of assignees) {
			const assigneeUserId =
				typeof assignee?.userId === 'string'
					? assignee.userId
					: typeof assignee?.id === 'string'
						? assignee.id
						: '';

			if (assigneeUserId === '' || seenUserIds.has(assigneeUserId)) {
				continue;
			}

			seenUserIds.add(assigneeUserId);

			contributors.push({
				id: assigneeUserId,
				initials:
					typeof assignee?.initials === 'string'
						? assignee.initials
						: '??',
				name: typeof assignee?.name === 'string' ? assignee.name : '',
				variant: 'member',
				isOwner: false,
			});
		}
	}

	return contributors;
}
