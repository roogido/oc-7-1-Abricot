/**
 * @file src/lib/mappers/taskMapper.js
 * @description
 * Mappers des taches backend vers les modeles front utilises par l'UI.
 */

/**
 * Formate une date ISO en libelle court francais.
 *
 * @param {string|null|undefined} dateValue
 * @returns {string}
 */
function formatDueDate(dateValue) {
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
	}).format(date);
}

/**
 * Retourne le libelle UI du statut.
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
 * Retourne la variante visuelle UI du statut.
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
 * Extrait la liste brute des projets depuis le payload backend.
 *
 * @param {Object} payload
 * @returns {Object[]}
 * @throws {Error}
 */
function extractProjects(payload) {
	const projects = payload?.data?.projects;

	if (!Array.isArray(projects)) {
		throw new Error('Projects not found in API payload');
	}

	return projects;
}

/**
 * Retourne un ordre numérique associé au statut d'une tâche.
 * Permet de trier les tâches selon l'ordre métier :
 * TODO -> IN_PROGRESS -> DONE.
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
 * Retourne le timestamp de la date d'échéance d'une tâche.
 * Si la date est invalide ou absente, retourne une valeur maximale.
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
 * Compare deux tâches selon l'ordre métier du dashboard.
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
function compareDashboardTasks(a, b) {
	const statusOrderDiff =
		getTaskStatusOrder(a.status) - getTaskStatusOrder(b.status);

	if (statusOrderDiff !== 0) {
		return statusOrderDiff;
	}

	return getTaskDueDateTime(a) - getTaskDueDateTime(b);
}

/**
 * Vérifie si une tâche est assignée à l'utilisateur courant.
 *
 * @param {Object} rawTask
 * @param {string} currentUserId
 * @returns {boolean}
 */
function isTaskAssignedToUser(rawTask, currentUserId) {
	if (
		typeof currentUserId !== 'string' ||
		currentUserId.trim() === '' ||
		!Array.isArray(rawTask?.assignees)
	) {
		return true;
	}

	return rawTask.assignees.some(
		(assignee) => assignee?.user?.id === currentUserId,
	);
}

/**
 * Construit une map projectId -> projectName.
 *
 * @param {Object} payload
 * @returns {Map<string, string>}
 */
export function buildProjectsNameMap(payload) {
	const projects = extractProjects(payload);
	const projectsMap = new Map();

	for (const project of projects) {
		const projectId = typeof project?.id === 'string' ? project.id : '';
		const projectName =
			typeof project?.name === 'string' && project.name.trim() !== ''
				? project.name.trim()
				: 'Projet associé';

		if (projectId !== '') {
			projectsMap.set(projectId, projectName);
		}
	}

	return projectsMap;
}

/**
 * Transforme une tache API en modele front pour la vue liste du dashboard.
 *
 * @param {Object} rawTask
 * @param {Map<string, string>} projectsMap
 * @returns {Object}
 * @throws {Error}
 */
export function mapAssignedTaskToDashboardListItem(rawTask, projectsMap) {
	if (!rawTask || typeof rawTask !== 'object') {
		throw new Error('Invalid assigned task payload');
	}

	const projectId =
		typeof rawTask.projectId === 'string'
			? rawTask.projectId
			: typeof rawTask?.project?.id === 'string'
				? rawTask.project.id
				: '';

	const projectName =
		projectId !== ''
			? (projectsMap.get(projectId) ?? 'Projet associé')
			: 'Projet associé';

	return {
		id: typeof rawTask.id === 'string' ? rawTask.id : '',
		title:
			typeof rawTask.title === 'string' && rawTask.title.trim() !== ''
				? rawTask.title.trim()
				: 'Tâche sans titre',
		description:
			typeof rawTask.description === 'string'
				? rawTask.description.trim()
				: '',
		status: typeof rawTask.status === 'string' ? rawTask.status : 'TODO',
		statusLabel: mapTaskStatusLabel(rawTask.status),
		statusVariant: mapTaskStatusVariant(rawTask.status),
		projectId,
		projectName,
		dueDateRaw: typeof rawTask.dueDate === 'string' ? rawTask.dueDate : '',
		dueDateLabel: formatDueDate(rawTask.dueDate),
		commentsCount: Array.isArray(rawTask.comments)
			? rawTask.comments.length
			: 0,
	};
}

/**
 * Extrait puis transforme la liste des taches assignees.
 *
 * @param {Object} payload
 * @param {Map<string, string>} projectsMap
 * @returns {Object[]}
 * @throws {Error}
 */
export function extractAssignedTasks(payload, projectsMap) {
	const tasks = payload?.data?.tasks;

	if (!Array.isArray(tasks)) {
		throw new Error('Assigned tasks not found in API payload');
	}

	return tasks
		.map((task) => mapAssignedTaskToDashboardListItem(task, projectsMap))
		.sort(compareDashboardTasks);
}

/**
 * Construit les colonnes Kanban du dashboard a partir des taches assignees.
 *
 * @param {Object[]} tasks
 * @returns {Object[]}
 */
export function buildDashboardKanbanColumns(tasks) {
	const safeTasks = Array.isArray(tasks) ? tasks : [];

	const todoTasks = safeTasks.filter((task) => task.status === 'TODO');
	const inProgressTasks = safeTasks.filter(
		(task) => task.status === 'IN_PROGRESS',
	);
	const doneTasks = safeTasks.filter((task) => task.status === 'DONE');

	return [
		{
			id: 'todo',
			title: 'À faire',
			count: todoTasks.length,
			tasks: todoTasks.map((task) => ({
				id: task.id,
				title: task.title,
				description: task.description,
				statusVariant: task.statusVariant,
				statusLabel: task.statusLabel,
				projectName: task.projectName,
				dueDate: task.dueDateLabel,
				commentsCount: task.commentsCount,
				viewHref: `/projects/${task.projectId}/tasks/${task.id}`,
			})),
		},
		{
			id: 'in-progress',
			title: 'En cours',
			count: inProgressTasks.length,
			tasks: inProgressTasks.map((task) => ({
				id: task.id,
				title: task.title,
				description: task.description,
				statusVariant: task.statusVariant,
				statusLabel: task.statusLabel,
				projectName: task.projectName,
				dueDate: task.dueDateLabel,
				commentsCount: task.commentsCount,
				viewHref: `/projects/${task.projectId}/tasks/${task.id}`,
			})),
		},
		{
			id: 'done',
			title: 'Terminées',
			count: doneTasks.length,
			tasks: doneTasks.map((task) => ({
				id: task.id,
				title: task.title,
				description: task.description,
				statusVariant: task.statusVariant,
				statusLabel: task.statusLabel,
				projectName: task.projectName,
				dueDate: task.dueDateLabel,
				commentsCount: task.commentsCount,
				viewHref: `/projects/${task.projectId}/tasks/${task.id}`,
			})),
		},
	];
}

/**
 * Construit la vue dashboard "Projets" en regroupant les tâches assignées
 * par projet, triées par urgence.
 *
 * @param {Object} payload
 * @param {string} currentUserId
 * @returns {Object[]}
 * @throws {Error}
 */
export function extractProjectsWithAssignedTasks(payload, currentUserId) {
	const projects = extractProjects(payload);

	return projects
		.map((project) => {
			const projectId = typeof project?.id === 'string' ? project.id : '';
			const projectName =
				typeof project?.name === 'string' && project.name.trim() !== ''
					? project.name.trim()
					: 'Projet associé';

			const rawTasks = Array.isArray(project?.tasks) ? project.tasks : [];

			const mappedTasks = rawTasks
				.filter((task) => isTaskAssignedToUser(task, currentUserId))
				.map((task) =>
					mapAssignedTaskToDashboardListItem(
						{
							...task,
							projectId,
							project: {
								id: projectId,
								name: projectName,
							},
						},
						new Map([[projectId, projectName]]),
					),
				)
				.sort(compareDashboardTasks);

			return {
				id: projectId,
				name: projectName,
				description:
					typeof project?.description === 'string'
						? project.description.trim()
						: '',
				tasks: mappedTasks,
				firstTaskStatusOrder:
					mappedTasks.length > 0
						? getTaskStatusOrder(mappedTasks[0].status)
						: 99,
				firstTaskDueDateTime:
					mappedTasks.length > 0
						? getTaskDueDateTime(mappedTasks[0])
						: Number.MAX_SAFE_INTEGER,
			};
		})
		.filter((project) => project.tasks.length > 0)
		.sort((a, b) => {
			const statusDiff = a.firstTaskStatusOrder - b.firstTaskStatusOrder;

			if (statusDiff !== 0) {
				return statusDiff;
			}

			return a.firstTaskDueDateTime - b.firstTaskDueDateTime;
		});
}
