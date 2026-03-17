/**
 * @file src/lib/mappers/taskMapper.js
 * @description
 * Mappers des tâches backend vers les modèles front utilisés par l'UI.
 */

import { extractProjectsList } from './projectMapper';
import { formatMediumDueDate } from './shared/dateMapper';
import {
	DEFAULT_ASSOCIATED_PROJECT_NAME,
	DEFAULT_TASK_TITLE,
} from './shared/mapperConstants';
import {
	compareTasksByStatusAndDueDate,
	getTaskDueDateTime,
	getTaskPriorityOrder,
	getTaskStatusOrder,
	mapTaskStatusLabel,
	mapTaskStatusVariant,
} from './shared/taskUiMapper';

const KANBAN_COLUMNS_CONFIG = [
	{
		id: 'todo',
		title: 'À faire',
		status: 'TODO',
	},
	{
		id: 'in-progress',
		title: 'En cours',
		status: 'IN_PROGRESS',
	},
	{
		id: 'done',
		title: 'Terminées',
		status: 'DONE',
	},
];

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
 * Retourne l'identifiant du projet lié à une tâche.
 *
 * @param {Object} rawTask
 * @returns {string}
 */
function getTaskProjectId(rawTask) {
	if (typeof rawTask?.projectId === 'string') {
		return rawTask.projectId;
	}

	if (typeof rawTask?.project?.id === 'string') {
		return rawTask.project.id;
	}

	return '';
}

/**
 * Retourne le nom du projet lié à une tâche.
 *
 * @param {Object} rawTask
 * @param {Map<string, string>} projectsMap
 * @returns {string}
 */
function getTaskProjectName(rawTask, projectsMap) {
	const projectId = getTaskProjectId(rawTask);

	if (projectId !== '') {
		return projectsMap.get(projectId) ?? DEFAULT_ASSOCIATED_PROJECT_NAME;
	}

	return DEFAULT_ASSOCIATED_PROJECT_NAME;
}

/**
 * Mappe une tâche dashboard vers le format attendu par une carte Kanban.
 *
 * @param {Object} task
 * @returns {Object}
 */
function mapTaskToKanbanCard(task) {
	return {
		id: task.id,
		title: task.title,
		description: task.description,
		statusVariant: task.statusVariant,
		statusLabel: task.statusLabel,
		projectName: task.projectName,
		dueDate: task.dueDateLabel,
		commentsCount: task.commentsCount,
		viewHref: `/projects/${task.projectId}/tasks/${task.id}`,
	};
}

/**
 * Construit une colonne Kanban.
 *
 * @param {Object} config
 * @param {Object[]} tasks
 * @returns {Object}
 */
function buildKanbanColumn(config, tasks) {
	const filteredTasks = tasks
		.filter((task) => task.status === config.status)
		.sort(compareTasksByStatusAndDueDate);

	return {
		id: config.id,
		title: config.title,
		count: filteredTasks.length,
		tasks: filteredTasks.map(mapTaskToKanbanCard),
	};
}

/**
 * Construit une map projectId -> projectName.
 *
 * @param {Object} payload
 * @returns {Map<string, string>}
 */
export function buildProjectsNameMap(payload) {
	const projects = extractProjectsList(payload);
	const projectsMap = new Map();

	for (const project of projects) {
		const projectId = typeof project?.id === 'string' ? project.id : '';
		const projectName =
			typeof project?.name === 'string' && project.name.trim() !== ''
				? project.name.trim()
				: DEFAULT_ASSOCIATED_PROJECT_NAME;

		if (projectId !== '') {
			projectsMap.set(projectId, projectName);
		}
	}

	return projectsMap;
}

/**
 * Transforme une tâche API en modèle front pour la vue liste du dashboard.
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

	const projectId = getTaskProjectId(rawTask);
	const projectName = getTaskProjectName(rawTask, projectsMap);

	return {
		id: typeof rawTask.id === 'string' ? rawTask.id : '',
		title:
			typeof rawTask.title === 'string' && rawTask.title.trim() !== ''
				? rawTask.title.trim()
				: DEFAULT_TASK_TITLE,
		description:
			typeof rawTask.description === 'string'
				? rawTask.description.trim()
				: '',
		status: typeof rawTask.status === 'string' ? rawTask.status : 'TODO',
		priority:
			typeof rawTask.priority === 'string' ? rawTask.priority : 'LOW',
		statusLabel: mapTaskStatusLabel(rawTask.status),
		statusVariant: mapTaskStatusVariant(rawTask.status),
		projectId,
		projectName,
		dueDateRaw: typeof rawTask.dueDate === 'string' ? rawTask.dueDate : '',
		dueDateLabel: formatMediumDueDate(rawTask.dueDate),
		commentsCount: Array.isArray(rawTask.comments)
			? rawTask.comments.length
			: 0,
	};
}

/**
 * Extrait puis transforme la liste des tâches assignées.
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
		.sort(compareTasksByStatusAndDueDate);
}

/**
 * Construit les colonnes Kanban du dashboard à partir des tâches assignées.
 *
 * @param {Object[]} tasks
 * @returns {Object[]}
 */
export function buildDashboardKanbanColumns(tasks) {
	const safeTasks = Array.isArray(tasks) ? tasks : [];

	return KANBAN_COLUMNS_CONFIG.map((config) =>
		buildKanbanColumn(config, safeTasks),
	);
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
	const projects = extractProjectsList(payload);

	return projects
		.map((project) => {
			const projectId = typeof project?.id === 'string' ? project.id : '';
			const projectName =
				typeof project?.name === 'string' && project.name.trim() !== ''
					? project.name.trim()
					: DEFAULT_ASSOCIATED_PROJECT_NAME;

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
				.sort(compareTasksByStatusAndDueDate);

			return {
				id: projectId,
				name: projectName,
				description:
					typeof project?.description === 'string'
						? project.description.trim()
						: '',
				tasks: mappedTasks,
				firstTaskPriorityOrder:
					mappedTasks.length > 0
						? getTaskPriorityOrder(mappedTasks[0].priority)
						: 99,
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
			const priorityDiff =
				a.firstTaskPriorityOrder - b.firstTaskPriorityOrder;

			if (priorityDiff !== 0) {
				return priorityDiff;
			}

			const statusDiff = a.firstTaskStatusOrder - b.firstTaskStatusOrder;

			if (statusDiff !== 0) {
				return statusDiff;
			}

			return a.firstTaskDueDateTime - b.firstTaskDueDateTime;
		});
}
