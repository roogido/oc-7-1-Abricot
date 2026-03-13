/**
 * @file src/components/tasks/TaskCardProject/TaskCardProject.js
 */

'use client';

import { useId, useMemo, useState } from 'react';

import Tag from '@/components/ui/Tag/Tag';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';

import arrowDownIcon from '@/assets/icons/arrow-down-icon.png';

import styles from './TaskCardProject.module.css';

export default function TaskCardProject({
	title,
	description,
	statusLabel,
	statusVariant = 'red',
	dueDateLabel,
	assignees = [],
	comments = [],
	defaultExpanded = false,
	onMoreClick,
	currentUserInitials = '??',
	currentUserAvatarVariant = 'member',
	showMoreButton = true,
	onCommentSubmit = null,
	isCommentSubmitting = false,
	commentErrorMessage = '',
}) {
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);
	const [commentText, setCommentText] = useState('');

	const textareaId = useId();
	const commentsSectionId = useMemo(
		() => `${textareaId}-comments-section`,
		[textareaId],
	);

	const commentsCount = comments.length;
	const isSubmitDisabled =
		commentText.trim() === '' || isCommentSubmitting === true;

	function handleToggleComments() {
		setIsExpanded((prev) => !prev);
	}

	async function handleSubmit(event) {
		event.preventDefault();

		const trimmedComment = commentText.trim();

		if (trimmedComment === '') {
			return;
		}

		if (typeof onCommentSubmit !== 'function') {
			return;
		}

		try {
			await onCommentSubmit(trimmedComment);
			setCommentText('');
		} catch {
			// L'erreur est geree par le conteneur parent.
		}
	}

	return (
		<article className={styles.card}>
			<div className={styles.topRow}>
				<div className={styles.mainContent}>
					<div className={styles.titleRow}>
						<h3 className={styles.title}>{title}</h3>

						{statusLabel ? (
							<Tag variant={statusVariant}>{statusLabel}</Tag>
						) : null}
					</div>

					{description ? (
						<p className={styles.description}>{description}</p>
					) : null}
				</div>

				{showMoreButton ? (
					<button
						type="button"
						className={styles.moreButton}
						onClick={onMoreClick}
						aria-label="Modifier la tâche"
					>
						<span className={styles.moreDots} aria-hidden="true">
							...
						</span>
					</button>
				) : null}
			</div>

			<div className={styles.metaBlock}>
				<div className={styles.metaRow}>
					<span className={styles.metaLabel}>Échéance :</span>

					<div className={styles.dateWrapper}>
						<span
							className={styles.calendarIcon}
							aria-hidden="true"
						>
							📅
						</span>
						<span className={styles.metaValue}>{dueDateLabel}</span>
					</div>
				</div>

				<div className={styles.metaRow}>
					<span className={styles.metaLabel}>Assigné à :</span>

					<div className={styles.assignees}>
						{assignees.map((assignee) => {
							const tagVariant =
								assignee.variant === 'owner' ? 'brand' : 'grey';

							return (
								<div
									key={assignee.id}
									className={styles.assigneeItem}
								>
									<UserAvatar
										initials={assignee.initials}
										variant={assignee.variant || 'member'}
									/>
									<Tag variant={tagVariant}>
										{assignee.name}
									</Tag>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<div className={styles.separator} />

			<button
				type="button"
				className={styles.commentsToggle}
				onClick={handleToggleComments}
				aria-expanded={isExpanded}
				aria-controls={commentsSectionId}
			>
				<span className={styles.commentsCount}>
					Commentaires ({commentsCount})
				</span>

				<img
					src={arrowDownIcon.src}
					alt=""
					aria-hidden="true"
					className={`${styles.chevron} ${
						isExpanded ? styles.chevronExpanded : ''
					}`.trim()}
				/>
			</button>

			{isExpanded ? (
				<div id={commentsSectionId} className={styles.commentsSection}>
					<div className={styles.commentsList}>
						{comments.map((comment) => (
							<div key={comment.id} className={styles.commentRow}>
								<div className={styles.commentAvatarWrapper}>
									<UserAvatar
										initials={comment.authorInitials}
										variant={
											comment.authorVariant || 'member'
										}
									/>
								</div>

								<div className={styles.commentBox}>
									<div className={styles.commentHeader}>
										<span className={styles.commentAuthor}>
											{comment.authorName}
										</span>

										<span className={styles.commentDate}>
											{comment.dateLabel}
										</span>
									</div>

									<p className={styles.commentText}>
										{comment.message}
									</p>
								</div>
							</div>
						))}
					</div>

					<form
						className={styles.addCommentForm}
						onSubmit={handleSubmit}
					>
						<div className={styles.commentRow}>
							<div className={styles.commentAvatarWrapper}>
								<UserAvatar
									initials={currentUserInitials}
									variant={currentUserAvatarVariant}
								/>
							</div>

							<label
								htmlFor={textareaId}
								className={styles.visuallyHidden}
							>
								Ajouter un commentaire
							</label>

							<textarea
								id={textareaId}
								className={styles.commentTextarea}
								placeholder="Ajouter un commentaire..."
								value={commentText}
								onChange={(event) =>
									setCommentText(event.target.value)
								}
								rows="1"
								disabled={isCommentSubmitting}
							/>
						</div>

						{commentErrorMessage ? (
							<p className={styles.commentErrorMessage}>
								{commentErrorMessage}
							</p>
						) : null}

						<div className={styles.formActions}>
							<button
								type="submit"
								className={`${styles.submitButton} ${
									!isSubmitDisabled
										? styles.submitButtonActive
										: ''
								}`.trim()}
								disabled={isSubmitDisabled}
							>
								{isCommentSubmitting ? 'Envoi...' : 'Envoyer'}
							</button>
						</div>
					</form>
				</div>
			) : null}
		</article>
	);
}
