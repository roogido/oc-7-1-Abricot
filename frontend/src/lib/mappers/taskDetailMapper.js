/**
 * @file src/lib/mappers/taskDetailMapper.js
 * @description
 * Mappers backend -> front pour la page detail tache.
 */

function getInitials(fullName) {
	if (typeof fullName !== 'string' || fullName.trim() === '') {
		return '??';
	}

	const parts = fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2);

	return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

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
		month: 'long',
		year: 'numeric',
	}).format(date);
}

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
 * Extrait la tache brute du payload backend.
 *
 * @param {Object} payload
 * @returns {Object}
 * @throws {Error}
 */
export function extractTask(payload) {
	const task = payload?.data?.task;

	if (!task || typeof task !== 'object') {
		throw new Error('Task not found in API payload');
	}

	return task;
}

/**
 * Mappe une tache backend vers le modele front detail.
 *
 * @param {Object} rawTask
 * @param {string} ownerId
 * @returns {Object}
 */
export function mapTaskDetail(rawTask, ownerId = '') {
	const assignees = Array.isArray(rawTask?.assignees)
		? rawTask.assignees
		: [];
	const comments = Array.isArray(rawTask?.comments) ? rawTask.comments : [];

	return {
		id: typeof rawTask?.id === 'string' ? rawTask.id : '',
		projectId:
			typeof rawTask?.projectId === 'string' ? rawTask.projectId : '',
		projectName:
			typeof rawTask?.project?.name === 'string' &&
			rawTask.project.name.trim() !== ''
				? rawTask.project.name.trim()
				: 'Projet',
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
			const user = assignee?.user;
			const userId = typeof user?.id === 'string' ? user.id : '';
			const userName = typeof user?.name === 'string' ? user.name : '';

			return {
				id: assignee?.id ?? userId,
				initials: getInitials(userName),
				name: userName,
				variant: userId === ownerId ? 'owner' : 'member',
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
	};
}
