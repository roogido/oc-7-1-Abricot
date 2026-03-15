/**
 * @file src/lib/mappers/projectMapper.js
 * @description
 * Mappers backend -> front pour les projets Abricot.
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
 * Retourne un ordre numerique associe au statut d'une tache.
 *
 * @param {string} status
 * @returns {number}
 */
function getTaskStatusOrder(status) {
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
 * Retourne le timestamp de la date d'echeance d'une tache.
 *
 * @param {Object} task
 * @returns {number}
 */
function getTaskDueDateTime(task) {
	if (typeof task?.dueDateRaw !== 'string' || task.dueDateRaw.trim() === '') {
		return Number.MAX_SAFE_INTEGER;
	}

	const timestamp = new Date(task.dueDateRaw).getTime();

	return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
}

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
 * Extrait les taches brutes d'un projet.
 *
 * @param {Object|null} payload
 * @returns {Object[]}
 */
function extractProjectTasksFromPayload(payload) {
	const tasks = payload?.data?.tasks;

	return Array.isArray(tasks) ? tasks : [];
}

/**
 * Retourne le nombre de taches terminees.
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
 * Retourne les initiales des membres non proprietaires.
 *
 * @param {Object} project
 * @returns {string[]}
 */
function mapMemberInitials(project) {
	const ownerId =
		typeof project?.owner?.id === 'string'
			? project.owner.id
			: typeof project?.ownerId === 'string'
				? project.ownerId
				: '';

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
 * Construit le modele UI pour la carte projet de la page /projects.
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
	const ownerId =
		typeof project?.owner?.id === 'string'
			? project.owner.id
			: typeof project?.ownerId === 'string'
				? project.ownerId
				: '';

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
	const ownerId =
		typeof project?.owner?.id === 'string'
			? project.owner.id
			: typeof project?.ownerId === 'string'
				? project.ownerId
				: '';

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
		status: typeof rawTask?.status === 'string' ? rawTask.status : 'TODO',
		statusLabel: mapTaskStatusLabel(rawTask?.status),
		statusVariant: mapTaskStatusVariant(rawTask?.status),
		dueDateRaw: typeof rawTask?.dueDate === 'string' ? rawTask.dueDate : '',
		dueDateLabel: formatDueDateLabel(rawTask?.dueDate),
		assignees: assignees.map((assignee) => {
			const assigneeUser = assignee?.user;
			const assigneeUserId =
				typeof assigneeUser?.id === 'string' ? assigneeUser.id : '';
			const assigneeName =
				typeof assigneeUser?.name === 'string' ? assigneeUser.name : '';

			return {
				id: assigneeUserId,
				userId: assigneeUserId,
				initials: getInitials(assigneeName),
				name: assigneeName,
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

	return tasks
		.map((task) => mapProjectTask(task, ownerId))
		.sort((a, b) => {
			const statusOrderDiff =
				getTaskStatusOrder(a.status) - getTaskStatusOrder(b.status);

			if (statusOrderDiff !== 0) {
				return statusOrderDiff;
			}

			return getTaskDueDateTime(a) - getTaskDueDateTime(b);
		});
}

/**
 * Reconstruit la barre des contributeurs a partir des taches reellement affichees.
 *
 * - Conserve le proprietaire en premier.
 * - Ajoute ensuite les assignees distincts rencontres dans les taches.
 * - Exclut le proprietaire des membres gris.
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

/**
 * Expose un helper simple d'initiales pour l'utilisateur courant.
 *
 * @param {string|null|undefined} fullName
 * @returns {string}
 */
export function getUserInitials(fullName) {
	return getInitials(fullName);
}
