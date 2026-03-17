/**
 * @file src/lib/mappers/shared/taskPeopleMapper.js
 * @description
 * Helpers partagés pour mapper les assignés et commentaires des tâches Abricot.
 */

import { formatCommentDateLabel } from './dateMapper';
import { getInitials } from './identityMapper';

/**
 * Mappe un assigné backend vers le modèle UI partagé.
 *
 * @param {Object} assignee
 * @param {string} ownerId
 * @param {boolean} includeEmail
 * @param {boolean} preserveAssignmentId
 * @returns {Object}
 */
export function mapTaskAssignee(
	assignee,
	ownerId = '',
	includeEmail = false,
	preserveAssignmentId = false,
) {
	const user = assignee?.user;
	const userId = typeof user?.id === 'string' ? user.id : '';
	const userName = typeof user?.name === 'string' ? user.name : '';
	const userEmail = typeof user?.email === 'string' ? user.email : '';

	const mappedAssignee = {
		id:
			preserveAssignmentId && typeof assignee?.id === 'string'
				? assignee.id
				: userId,
		initials: getInitials(userName),
		name: userName,
		variant: userId === ownerId ? 'owner' : 'member',
	};

	if (!preserveAssignmentId) {
		mappedAssignee.userId = userId;
	}

	if (includeEmail) {
		mappedAssignee.email = userEmail;
	}

	return mappedAssignee;
}

/**
 * Mappe une liste d'assignés backend vers le modèle UI partagé.
 *
 * @param {Object[]|null|undefined} assignees
 * @param {string} ownerId
 * @param {Object} options
 * @param {boolean} [options.includeEmail=false]
 * @param {boolean} [options.preserveAssignmentId=false]
 * @returns {Object[]}
 */
export function mapTaskAssignees(assignees, ownerId = '', options = {}) {
	const safeAssignees = Array.isArray(assignees) ? assignees : [];
	const { includeEmail = false, preserveAssignmentId = false } = options;

	return safeAssignees.map((assignee) =>
		mapTaskAssignee(assignee, ownerId, includeEmail, preserveAssignmentId),
	);
}

/**
 * Mappe un commentaire backend vers le modèle UI partagé.
 *
 * @param {Object} comment
 * @param {string} ownerId
 * @returns {Object}
 */
export function mapTaskComment(comment, ownerId = '') {
	const author = comment?.author;
	const authorId = typeof author?.id === 'string' ? author.id : '';
	const authorName = typeof author?.name === 'string' ? author.name : '';

	return {
		id: typeof comment?.id === 'string' ? comment.id : '',
		authorInitials: getInitials(authorName),
		authorName,
		authorVariant: authorId === ownerId ? 'owner' : 'member',
		dateLabel: formatCommentDateLabel(comment?.createdAt),
		message:
			typeof comment?.content === 'string' ? comment.content.trim() : '',
	};
}

/**
 * Mappe une liste de commentaires backend vers le modèle UI partagé.
 *
 * @param {Object[]|null|undefined} comments
 * @param {string} ownerId
 * @returns {Object[]}
 */
export function mapTaskComments(comments, ownerId = '') {
	const safeComments = Array.isArray(comments) ? comments : [];

	return safeComments.map((comment) => mapTaskComment(comment, ownerId));
}
