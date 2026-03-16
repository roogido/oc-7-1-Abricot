'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import Chip from '@/components/ui/Chip/Chip';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import TaskCardProject from '@/components/tasks/TaskCardProject/TaskCardProject';
import ProjectTaskEditAction from '@/components/projects/ProjectTaskEditAction/ProjectTaskEditAction';

import { createTaskCommentClient } from '@/services/taskClientService';

import arrowDownIcon from '@/assets/icons/arrow-down-icon.png';
import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';

import styles from './ProjectTasksSection.module.css';

const STATUS_OPTIONS = [
	{ value: 'ALL', label: 'Tous' },
	{ value: 'TODO', label: 'À faire' },
	{ value: 'IN_PROGRESS', label: 'En cours' },
	{ value: 'DONE', label: 'Terminée' },
];

function normalizeValue(value) {
	return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

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

	const [statusFilter, setStatusFilter] = useState('ALL');
	const [searchTerm, setSearchTerm] = useState('');
	const [isStatusOpen, setIsStatusOpen] = useState(false);
	const [editedTask, setEditedTask] = useState(null);

	const [submittingCommentTaskId, setSubmittingCommentTaskId] = useState('');
	const [commentErrorByTaskId, setCommentErrorByTaskId] = useState({});

	const normalizedSearchTerm = normalizeValue(searchTerm);

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

	function handleOpenEditTask(task) {
		setEditedTask(task);
	}

	function handleCloseEditTask() {
		setEditedTask(null);
	}

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
						: 'Impossible d’ajouter le commentaire.',
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
					<p className={styles.tasksSubtitle}>
						Par ordre de priorité
					</p>
				</div>

				<div className={styles.tasksControls}>
					<Chip icon={checkedIcon} compact active>
						Liste
					</Chip>

					<Chip icon={kanbanIcon} compact>
						Calendrier
					</Chip>

					<div className={styles.statusDropdown}>
						<button
							type="button"
							className={styles.tasksFilter}
							onClick={() =>
								setIsStatusOpen((previous) => !previous)
							}
							aria-expanded={isStatusOpen}
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
							<div className={styles.statusMenu}>
								{STATUS_OPTIONS.map((option) => (
									<button
										key={option.value}
										type="button"
										className={styles.statusMenuItem}
										onClick={() => {
											setStatusFilter(option.value);
											setIsStatusOpen(false);
										}}
									>
										{option.label}
									</button>
								))}
							</div>
						) : null}
					</div>

					<SearchInput
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Rechercher une tâche"
						ariaLabel="Rechercher une tâche"
					/>
				</div>
			</div>

			{errorMessage !== '' ? (
				<p className={styles.feedbackMessage}>
					Tâches : {errorMessage}
				</p>
			) : filteredTasks.length === 0 ? (
				<p className={styles.feedbackMessage}>
					Aucune tâche ne correspond aux filtres actuels.
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
							currentUserAvatarVariant={currentUserAvatarVariant}
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
