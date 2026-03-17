/**
 * @file src/lib/mappers/projectMapper.js
 * @description
 * Mappers backend -> front pour les projets Abricot.
 */

import {
	extractRequiredArray,
	extractRequiredObject,
} from './shared/payloadMapper';
import { getInitials } from './shared/identityMapper';
import { DEFAULT_UNNAMED_PROJECT_LABEL } from './shared/mapperConstants';

/**
 * Extrait la liste brute depuis GET /projects.
 *
 * @param {Object} payload
 * @returns {Object[]}
 * @throws {Error}
 */
export function extractProjectsList(payload) {
	return extractRequiredArray(
		payload,
		(currentPayload) => currentPayload?.data?.projects,
		'Projects not found in API payload',
	);
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
				: DEFAULT_UNNAMED_PROJECT_LABEL,
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
	return extractRequiredObject(
		payload,
		(currentPayload) => currentPayload?.data?.project,
		'Project not found in API payload',
	);
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
				: DEFAULT_UNNAMED_PROJECT_LABEL,
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

export { getInitials as getUserInitials };