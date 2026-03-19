'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Chip from '@/components/ui/Chip/Chip';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import TaskCardProject from '@/components/tasks/TaskCardProject/TaskCardProject';
import ProjectTaskEditAction from '@/components/projects/ProjectTaskEditAction/ProjectTaskEditAction';
import ProjectTasksCalendarView from '@/components/projects/ProjectTasksCalendarView/ProjectTasksCalendarView';

import { createTaskCommentClient } from '@/services/commentClientService';

import arrowDownIcon from '@/assets/icons/arrow-down-icon.png';
import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';

import styles from './ProjectTasksSection.module.css';

const STATUS_OPTIONS = [
	{ value: 'ALL', label: 'Tous' },
	{ value: 'TODO', label: 'A faire' },
	{ value: 'IN_PROGRESS', label: 'En cours' },
	{ value: 'DONE', label: 'Terminee' },
];

// Normalise les textes pour comparer la recherche sans effet de casse.
function normalizeValue(value) {
	return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

// Fait porter la recherche sur les champs visibles les plus utiles.
function matchesSearch(task, normalizedSearchTerm) {
	if (normalizedSearchTerm === '') {
		return true;
	}

	const titleValue = normalizeValue(task?.title);
	const descriptionValue = normalizeValue(task?.description);
	const statusLabelValue = normalizeValue(task?.statusLabel);
	const assigneesValue = Array.isArray(task?.assignees)
		? task.assignees
				.map((assignee) => normalizeValue(assignee?.name))
				.join(' ')
		: '';

	return (
		titleValue.includes(normalizedSearchTerm) ||
		descriptionValue.includes(normalizedSearchTerm) ||
		statusLabelValue.includes(normalizedSearchTerm) ||
		assigneesValue.includes(normalizedSearchTerm)
	);
}

export default function ProjectTasksSection({
	projectId,
	tasks = [],
	currentUserInitials,
	currentUserAvatarVariant,
	errorMessage = '',
}) {
	const router = useRouter();
	const statusButtonRef = useRef(null);
	const statusMenuItemRefs = useRef([]);

	const [viewMode, setViewMode] = useState('list');
	const [statusFilter, setStatusFilter] = useState('ALL');
	const [searchTerm, setSearchTerm] = useState('');
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const [editedTask, setEditedTask] = useState(null);

	const [submittingCommentTaskId, setSubmittingCommentTaskId] = useState('');
	const [commentErrorByTaskId, setCommentErrorByTaskId] = useState({});

	const normalizedSearchTerm = normalizeValue(searchTerm);

	// Applique d'abord le filtre de statut, puis la recherche libre.
	const filteredTasks = useMemo(() => {
		const safeTasks = Array.isArray(tasks) ? tasks : [];

		return safeTasks.filter((task) => {
			const matchesStatus =
				statusFilter === 'ALL' || task?.status === statusFilter;

			if (!matchesStatus) {
				return false;
			}

			return matchesSearch(task, normalizedSearchTerm);
		});
	}, [tasks, statusFilter, normalizedSearchTerm]);

	const currentStatusLabel =
		STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label ??
		'Statut';
	const currentStatusIndex = Math.max(
		0,
		STATUS_OPTIONS.findIndex((option) => option.value === statusFilter),
	);

	const tasksSubtitle =
		viewMode === 'calendar'
			? 'Par date d écheance'
			: 'Par ordre de priorité';

	function handleOpenEditTask(task) {
		setEditedTask(task);
	}

	function handleCloseEditTask() {
		setEditedTask(null);
	}

	function focusStatusButton() {
		if (statusButtonRef.current instanceof HTMLButtonElement) {
			statusButtonRef.current.focus();
		}
	}

	function focusStatusItemAt(index) {
		const target = statusMenuItemRefs.current[index];

		if (target instanceof HTMLButtonElement) {
			target.focus();
		}
	}

	function closeStatusMenu({ returnFocus = false } = {}) {
		setIsStatusOpen(false);

		if (returnFocus) {
			requestAnimationFrame(() => {
				focusStatusButton();
			});
		}
	}

	function handleStatusButtonKeyDown(event) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();

			if (!isStatusOpen) {
				setIsStatusOpen(true);

				requestAnimationFrame(() => {
					focusStatusItemAt(currentStatusIndex);
				});

				return;
			}

			focusStatusItemAt(currentStatusIndex);
		}

		if (event.key === 'Escape' && isStatusOpen) {
			event.preventDefault();
			closeStatusMenu();
		}
	}

	function handleStatusItemKeyDown(event, index) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeStatusMenu({ returnFocus: true });
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			focusStatusItemAt((index + 1) % STATUS_OPTIONS.length);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			focusStatusItemAt(
				(index - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length,
			);
		}
	}

	// Reposte le commentaire puis recharge la source de verite serveur.
	async function handleCommentSubmit(taskId, content) {
		setSubmittingCommentTaskId(taskId);
		setCommentErrorByTaskId((prev) => ({
			...prev,
			[taskId]: '',
		}));

		try {
			await createTaskCommentClient({
				projectId,
				taskId,
				content,
			});

			router.refresh();
		} catch (error) {
			setCommentErrorByTaskId((prev) => ({
				...prev,
				[taskId]:
					error instanceof Error
						? error.message
						: 'Impossible d ajouter le commentaire.',
			}));

			throw error;
		} finally {
			setSubmittingCommentTaskId('');
		}
	}

	return (
		<section className={styles.tasksFrame} aria-label="Tâches du projet">
			<div className={styles.tasksHeader}>
				<div className={styles.tasksHeading}>
					<h2 className={styles.tasksTitle}>Tâches</h2>
					<p className={styles.tasksSubtitle}>{tasksSubtitle}</p>
				</div>

				<div className={styles.tasksControls}>
					<Chip
						icon={checkedIcon}
						active={viewMode === 'list'}
						onClick={() => {
							setViewMode('list');
							setIsStatusOpen(false);
						}}
					>
						Liste
					</Chip>

					<Chip
						icon={kanbanIcon}
						active={viewMode === 'calendar'}
						onClick={() => {
							setViewMode('calendar');
							setIsStatusOpen(false);
						}}
					>
						Calendrier
					</Chip>

					{viewMode === 'list' ? (
						<>
							<div className={styles.statusDropdown}>
								<button
									ref={statusButtonRef}
									type="button"
									className={styles.tasksFilter}
									onClick={() =>
										setIsStatusOpen((previous) => !previous)
									}
									onKeyDown={handleStatusButtonKeyDown}
									aria-expanded={isStatusOpen}
									aria-haspopup="menu"
									aria-controls="project-tasks-status-menu"
								>
									<span>{currentStatusLabel}</span>
									<Image
										src={arrowDownIcon}
										alt=""
										aria-hidden="true"
										className={styles.statusIcon}
									/>
								</button>

								{isStatusOpen ? (
									<div
										id="project-tasks-status-menu"
										className={styles.statusMenu}
										role="menu"
										aria-label="Filtrer les tâches par statut"
									>
										{STATUS_OPTIONS.map((option, index) => (
											<button
												key={option.value}
												ref={(element) => {
													statusMenuItemRefs.current[
														index
													] = element;
												}}
												type="button"
												className={
													styles.statusMenuItem
												}
												onKeyDown={(event) =>
													handleStatusItemKeyDown(
														event,
														index,
													)
												}
												onClick={() => {
													setStatusFilter(
														option.value,
													);
													closeStatusMenu({
														returnFocus: true,
													});
												}}
												role="menuitemradio"
												aria-checked={
													statusFilter ===
													option.value
												}
											>
												{option.label}
											</button>
										))}
									</div>
								) : null}
							</div>

							<SearchInput
								value={searchTerm}
								onChange={(event) =>
									setSearchTerm(event.target.value)
								}
								placeholder="Rechercher une tâche"
								ariaLabel="Rechercher une tâche"
							/>
						</>
					) : null}
				</div>
			</div>

			{errorMessage !== '' ? (
				<p className={styles.feedbackMessage} role="alert">
					Taches : {errorMessage}
				</p>
			) : viewMode === 'list' ? (
				filteredTasks.length === 0 ? (
					<p
						className={styles.feedbackMessage}
						role="status"
						aria-live="polite"
					>
						Aucune tache ne correspond aux filtres actuels.
					</p>
				) : (
					<div className={styles.tasksList}>
						{filteredTasks.map((task) => (
							<TaskCardProject
								key={task.id}
								title={task.title}
								description={task.description}
								statusLabel={task.statusLabel}
								statusVariant={task.statusVariant}
								dueDateLabel={task.dueDateLabel}
								assignees={task.assignees}
								comments={task.comments}
								defaultExpanded={task.defaultExpanded}
								onMoreClick={() => handleOpenEditTask(task)}
								currentUserInitials={currentUserInitials}
								currentUserAvatarVariant={
									currentUserAvatarVariant
								}
								onCommentSubmit={(content) =>
									handleCommentSubmit(task.id, content)
								}
								isCommentSubmitting={
									submittingCommentTaskId === task.id
								}
								commentErrorMessage={
									commentErrorByTaskId[task.id] || ''
								}
							/>
						))}
					</div>
				)
			) : (
				<ProjectTasksCalendarView
					tasks={tasks}
					currentUserInitials={currentUserInitials}
					currentUserAvatarVariant={currentUserAvatarVariant}
					onTaskMoreClick={handleOpenEditTask}
					onTaskCommentSubmit={handleCommentSubmit}
					submittingCommentTaskId={submittingCommentTaskId}
					commentErrorByTaskId={commentErrorByTaskId}
				/>
			)}

			<ProjectTaskEditAction
				projectId={projectId}
				task={editedTask}
				isOpen={editedTask !== null}
				onClose={handleCloseEditTask}
			/>
		</section>
	);
}
