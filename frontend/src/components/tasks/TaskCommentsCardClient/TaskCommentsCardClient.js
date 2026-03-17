/**
 * @file src/components/tasks/TaskCommentsCardClient/TaskCommentsCardClient.js
 * @description
 * Conteneur client reutilisable pour la gestion des commentaires d'une tache.
 */

'use client';

import { useState } from 'react';

import TaskCardProject from '@/components/tasks/TaskCardProject/TaskCardProject';
import { createTaskCommentClient } from '@/services/commentClientService';

function formatNowLabel() {
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date());
}

export default function TaskCommentsCardClient({
	task,
	currentUserId,
	currentUserName,
	currentUserInitials,
	currentUserAvatarVariant,
	showMoreButton = false,
}) {
	const [comments, setComments] = useState(task.comments || []);
	const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
	const [commentErrorMessage, setCommentErrorMessage] = useState('');

	async function handleCommentSubmit(content) {
		setIsCommentSubmitting(true);
		setCommentErrorMessage('');

		try {
			await createTaskCommentClient({
				projectId: task.projectId,
				taskId: task.id,
				content,
			});

			const nextComment = {
				id: `local-${Date.now()}`,
				authorInitials: currentUserInitials,
				authorName: currentUserName,
				authorVariant: currentUserAvatarVariant,
				dateLabel: formatNowLabel(),
				message: content,
				authorId: currentUserId,
			};

			setComments((prev) => [...prev, nextComment]);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Impossible d’ajouter le commentaire.';

			setCommentErrorMessage(message);
			throw error;
		} finally {
			setIsCommentSubmitting(false);
		}
	}

	return (
		<TaskCardProject
			title={task.title}
			description={task.description}
			statusLabel={task.statusLabel}
			statusVariant={task.statusVariant}
			dueDateLabel={task.dueDateLabel}
			assignees={task.assignees}
			comments={comments}
			defaultExpanded={true}
			currentUserInitials={currentUserInitials}
			currentUserAvatarVariant={currentUserAvatarVariant}
			showMoreButton={showMoreButton}
			onCommentSubmit={handleCommentSubmit}
			isCommentSubmitting={isCommentSubmitting}
			commentErrorMessage={commentErrorMessage}
		/>
	);
}
