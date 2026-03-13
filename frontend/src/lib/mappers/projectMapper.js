/**
 * @file src/lib/mappers/projectMapper.js
 * @description
 * Mappers backend -> front pour la page detail projet.
 */

/**
 * Construit des initiales a partir d'un nom.
 *
 * @param {string|null|undefined} fullName
 * @returns {string}
 */
function getInitials(fullName) {
	if (typeof fullName !== 'string' || fullName.trim() === '') {
		return '??';
	}

	const parts = fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2);

	return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

/**
 * Formate une date d'echeance courte.
 *
 * @param {string|null|undefined} dateValue
 * @returns {string}
 */
function formatDueDateLabel(dateValue) {
	if (typeof dateValue !== 'string' || dateValue.trim() === '') {
		return '';
	}

	const date = new Date(dateValue);

	if (Number.isNaN(date.getTime())) {
		return '';
	}

	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'short',
	}).format(date);
}

/**
 * Formate une date de commentaire.
 *
 * @param {string|null|undefined} dateValue
 * @returns {string}
 */
function formatCommentDateLabel(dateValue) {
	if (typeof dateValue !== 'string' || dateValue.trim() === '') {
		return '';
	}

	const date = new Date(dateValue);

	if (Number.isNaN(date.getTime())) {
		return '';
	}

	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

/**
 * Mappe le statut backend vers le libelle UI.
 *
 * @param {string} status
 * @returns {string}
 */
function mapTaskStatusLabel(status) {
	switch (status) {
		case 'TODO':
			return 'À faire';
		case 'IN_PROGRESS':
			return 'En cours';
		case 'DONE':
			return 'Terminée';
		default:
			return 'Inconnue';
	}
}

/**
 * Mappe le statut backend vers la variante visuelle UI.
 *
 * @param {string} status
 * @returns {'red'|'orange'|'green'}
 */
function mapTaskStatusVariant(status) {
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
 * Mappe les contributeurs pour la barre projet.
 *
 * - Le proprietaire est affiche a part.
 * - Le compteur ne doit concerner que les autres membres.
 *
 * @param {Object} project
 * @returns {Object[]}
 */
export function mapProjectContributors(project) {
	const ownerId =
		typeof project?.owner?.id === 'string'
			? project.owner.id
			: typeof project?.ownerId === 'string'
				? project.ownerId
				: '';

	const ownerName =
		typeof project?.owner?.name === 'string' ? project.owner.name : '';

	const contributors = [];

	if (ownerId !== '') {
		contributors.push({
			id: ownerId,
			initials: getInitials(ownerName),
			role: 'Proprietaire',
		});
	}

	const members = Array.isArray(project?.members) ? project.members : [];

	for (const member of members) {
		const memberUser = member?.user;
		const memberId =
			typeof memberUser?.id === 'string' ? memberUser.id : '';
		const memberName =
			typeof memberUser?.name === 'string' ? memberUser.name : '';

		if (memberId === '' || memberId === ownerId) {
			continue;
		}

		contributors.push({
			id: memberId,
			initials: getInitials(memberName),
			name: memberName,
			variant: 'member',
		});
	}

	return contributors;
}

/**
 * Mappe les informations principales du projet.
 *
 * @param {Object} project
 * @returns {Object}
 */
export function mapProjectDetail(project) {
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
		ownerId:
			typeof project?.owner?.id === 'string'
				? project.owner.id
				: typeof project?.ownerId === 'string'
					? project.ownerId
					: '',
		userRole:
			typeof project?.userRole === 'string' ? project.userRole : null,
		contributors: mapProjectContributors(project),
	};
}

/**
 * Mappe une tache backend vers la carte projet.
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
		statusLabel: mapTaskStatusLabel(rawTask?.status),
		statusVariant: mapTaskStatusVariant(rawTask?.status),
		dueDateLabel: formatDueDateLabel(rawTask?.dueDate),
		assignees: assignees.map((assignee) => {
			const assigneeUser = assignee?.user;
			const assigneeId =
				typeof assigneeUser?.id === 'string' ? assigneeUser.id : '';
			const assigneeName =
				typeof assigneeUser?.name === 'string' ? assigneeUser.name : '';

			return {
				id: assignee?.id ?? assigneeId,
				initials: getInitials(assigneeName),
				name: assigneeName,
				variant: assigneeId === ownerId ? 'owner' : 'member',
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
 * Extrait puis mappe les taches d'un projet.
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

	return tasks.map((task) => mapProjectTask(task, ownerId));
}

/**
 * Expose un helper simple d'initiales pour l'utilisateur courant.
 *
 * @param {string|null|undefined} fullName
 * @returns {string}
 */
export function getUserInitials(fullName) {
	return getInitials(fullName);
}
