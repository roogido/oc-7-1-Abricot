// src/lib/mappers/projectMapper.js
/**
 * @file src/lib/mappers/projectMapper.js
 * @description
 * Mappers backend -> front pour les projets Abricot.
 */

import { formatCommentDateLabel, formatShortDueDate } from './shared/dateMapper';
import { getInitials } from './shared/identityMapper';
import {
	compareTasksByStatusAndDueDate,
	mapTaskStatusLabel,
	mapTaskStatusVariant,
} from './shared/taskUiMapper';

/**
 * Extrait la liste brute depuis GET /projects.
 *
 * @param {Object} payload
 * @returns {Object[]}
 * @throws {Error}
 */
export function extractProjectsList(payload) {
	const projects = payload?.data?.projects;

	if (!Array.isArray(projects)) {
		throw new Error('Projects not found in API payload');
	}

	return projects;
}

/**
 * Extrait les tâches brutes d'un projet.
 *
 * @param {Object|null} payload
 * @returns {Object[]}
 */
function extractProjectTasksFromPayload(payload) {
	const tasks = payload?.data?.tasks;

	return Array.isArray(tasks) ? tasks : [];
}

/**
 * Retourne le nombre de tâches terminées.
 *
 * @param {Object[]} tasks
 * @returns {number}
 */
function countCompletedTasks(tasks) {
	return tasks.filter((task) => task?.status === 'DONE').length;
}

/**
 * Retourne le pourcentage d'avancement.
 *
 * @param {number} completedTasks
 * @param {number} totalTasks
 * @returns {number}
 */
function computeProgress(completedTasks, totalTasks) {
	if (totalTasks <= 0) {
		return 0;
	}

	return Math.round((completedTasks / totalTasks) * 100);
}

/**
 * Retourne l'identifiant du propriétaire.
 *
 * @param {Object} project
 * @returns {string}
 */
function getProjectOwnerId(project) {
	if (typeof project?.owner?.id === 'string') {
		return project.owner.id;
	}

	if (typeof project?.ownerId === 'string') {
		return project.ownerId;
	}

	return '';
}

/**
 * Retourne les initiales des membres non propriétaires.
 *
 * @param {Object} project
 * @returns {string[]}
 */
function mapMemberInitials(project) {
	const ownerId = getProjectOwnerId(project);
	const members = Array.isArray(project?.members) ? project.members : [];

	return members
		.map((member) => member?.user)
		.filter(
			(user) =>
				typeof user?.id === 'string' &&
				user.id !== '' &&
				user.id !== ownerId,
		)
		.map((user) => getInitials(user?.name));
}

/**
 * Construit le modèle UI pour la carte projet de la page /projects.
 *
 * @param {Object} project
 * @param {Object|null} tasksPayload
 * @returns {Object}
 */
function mapProjectListItem(project, tasksPayload) {
	const tasks = extractProjectTasksFromPayload(tasksPayload);
	const totalTasks = tasks.length;
	const completedTasks = countCompletedTasks(tasks);

	return {
		id: typeof project?.id === 'string' ? project.id : '',
		name:
			typeof project?.name === 'string' && project.name.trim() !== ''
				? project.name.trim()
				: 'Projet sans nom',
		description:
			typeof project?.description === 'string'
				? project.description.trim()
				: '',
		progress: computeProgress(completedTasks, totalTasks),
		completedTasks,
		totalTasks,
		ownerInitials: getInitials(project?.owner?.name),
		memberInitials: mapMemberInitials(project),
	};
}

/**
 * Construit les items UI de la page /projects.
 *
 * @param {Array<{project: Object, tasksPayload: Object|null}>} entries
 * @returns {Object[]}
 */
export function buildProjectsListItems(entries) {
	const safeEntries = Array.isArray(entries) ? entries : [];

	return safeEntries.map(({ project, tasksPayload }) =>
		mapProjectListItem(project, tasksPayload),
	);
}

/**
 * Mappe les contributeurs pour la barre projet.
 *
 * @param {Object} project
 * @returns {Object[]}
 */
export function mapProjectContributors(project) {
	const ownerId = getProjectOwnerId(project);
	const ownerName =
		typeof project?.owner?.name === 'string' ? project.owner.name : '';
	const ownerEmail =
		typeof project?.owner?.email === 'string' ? project.owner.email : '';

	const contributors = [];

	if (ownerId !== '') {
		contributors.push({
			id: ownerId,
			initials: getInitials(ownerName),
			name: ownerName,
			email: ownerEmail,
			variant: 'owner',
			isOwner: true,
		});
	}

	const members = Array.isArray(project?.members) ? project.members : [];

	for (const member of members) {
		const memberUser = member?.user;
		const memberId =
			typeof memberUser?.id === 'string' ? memberUser.id : '';
		const memberName =
			typeof memberUser?.name === 'string' ? memberUser.name : '';
		const memberEmail =
			typeof memberUser?.email === 'string' ? memberUser.email : '';

		if (memberId === '' || memberId === ownerId) {
			continue;
		}

		contributors.push({
			id: memberId,
			initials: getInitials(memberName),
			name: memberName,
			email: memberEmail,
			variant: 'member',
			isOwner: false,
		});
	}

	return contributors;
}

/**
 * Extrait le projet brut depuis GET /projects/:id.
 *
 * @param {Object} payload
 * @returns {Object}
 * @throws {Error}
 */
export function extractProject(payload) {
	const project = payload?.data?.project;

	if (!project || typeof project !== 'object') {
		throw new Error('Project not found in API payload');
	}

	return project;
}

/**
 * Mappe les informations principales du projet.
 *
 * @param {Object} project
 * @returns {Object}
 */
export function mapProjectDetail(project) {
	const ownerId = getProjectOwnerId(project);
	const ownerName =
		typeof project?.owner?.name === 'string'
			? project.owner.name.trim()
			: '';

	return {
		id: typeof project?.id === 'string' ? project.id : '',
		name:
			typeof project?.name === 'string' && project.name.trim() !== ''
				? project.name.trim()
				: 'Projet sans nom',
		description:
			typeof project?.description === 'string'
				? project.description.trim()
				: '',
		ownerId,
		ownerName,
		userRole:
			typeof project?.userRole === 'string' ? project.userRole : null,
		contributors: mapProjectContributors(project),
	};
}

/**
 * Mappe une tâche backend vers la carte projet.
 *
 * @param {Object} rawTask
 * @param {string} ownerId
 * @returns {Object}
 */
function mapProjectTask(rawTask, ownerId) {
	const assignees = Array.isArray(rawTask?.assignees)
		? rawTask.assignees
		: [];
	const comments = Array.isArray(rawTask?.comments) ? rawTask.comments : [];

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
		assignees: assignees.map((assignee) => {
			const assigneeUser = assignee?.user;
			const assigneeUserId =
				typeof assigneeUser?.id === 'string' ? assigneeUser.id : '';
			const assigneeName =
				typeof assigneeUser?.name === 'string' ? assigneeUser.name : '';
			const assigneeEmail =
				typeof assigneeUser?.email === 'string'
					? assigneeUser.email
					: '';

			return {
				id: assigneeUserId,
				userId: assigneeUserId,
				initials: getInitials(assigneeName),
				name: assigneeName,
				email: assigneeEmail,
				variant: assigneeUserId === ownerId ? 'owner' : 'member',
			};
		}),
		comments: comments.map((comment) => {
			const author = comment?.author;
			const authorId = typeof author?.id === 'string' ? author.id : '';
			const authorName =
				typeof author?.name === 'string' ? author.name : '';

			return {
				id: typeof comment?.id === 'string' ? comment.id : '',
				authorInitials: getInitials(authorName),
				authorName,
				authorVariant: authorId === ownerId ? 'owner' : 'member',
				dateLabel: formatCommentDateLabel(comment?.createdAt),
				message:
					typeof comment?.content === 'string'
						? comment.content.trim()
						: '',
			};
		}),
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

export { getInitials as getUserInitials };