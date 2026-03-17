// components/projects/ProjectTasksCalendarView/ProjectTasksCalendarView.js

'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import TaskCardProject from '@/components/tasks/TaskCardProject/TaskCardProject';

import arrowLeftIcon from '@/assets/icons/arrow-left-icon.png';

import styles from './ProjectTasksCalendarView.module.css';

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getDateKey(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function getLocalDateFromRaw(rawValue) {
	if (typeof rawValue !== 'string' || rawValue.trim() === '') {
		return null;
	}

	const matchedDate = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

	if (matchedDate) {
		const year = Number(matchedDate[1]);
		const monthIndex = Number(matchedDate[2]) - 1;
		const day = Number(matchedDate[3]);

		return new Date(year, monthIndex, day);
	}

	const parsedDate = new Date(rawValue);

	if (Number.isNaN(parsedDate.getTime())) {
		return null;
	}

	return new Date(
		parsedDate.getFullYear(),
		parsedDate.getMonth(),
		parsedDate.getDate(),
	);
}

function getMonthLabel(date) {
	return new Intl.DateTimeFormat('fr-FR', {
		month: 'long',
		year: 'numeric',
	}).format(date);
}

function getMonthStart(date) {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getPreviousMonth(date) {
	return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

function getNextMonth(date) {
	return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function getMonthDayEntries(monthDate) {
	const year = monthDate.getFullYear();
	const monthIndex = monthDate.getMonth();

	const firstDayOfMonth = new Date(year, monthIndex, 1);
	const firstWeekdayIndex = (firstDayOfMonth.getDay() + 6) % 7;
	const gridStartDate = new Date(year, monthIndex, 1 - firstWeekdayIndex);

	return Array.from({ length: 42 }, (_, index) => {
		const currentDate = new Date(
			gridStartDate.getFullYear(),
			gridStartDate.getMonth(),
			gridStartDate.getDate() + index,
		);

		return {
			date: currentDate,
			key: getDateKey(currentDate),
			isCurrentMonth: currentDate.getMonth() === monthIndex,
		};
	});
}

function buildTasksByDay(tasks) {
	const safeTasks = Array.isArray(tasks) ? tasks : [];
	const tasksByDay = new Map();

	for (const task of safeTasks) {
		const dueDate = getLocalDateFromRaw(task?.dueDateRaw);

		if (!dueDate) {
			continue;
		}

		const dayKey = getDateKey(dueDate);
		const currentTasks = tasksByDay.get(dayKey) ?? [];

		currentTasks.push(task);
		tasksByDay.set(dayKey, currentTasks);
	}

	return tasksByDay;
}

function getMarkerVariants(tasks) {
	const safeTasks = Array.isArray(tasks) ? tasks : [];
	const markerSet = new Set();

	for (const task of safeTasks) {
		if (task?.status === 'TODO') {
			markerSet.add('todo');
		}

		if (task?.status === 'IN_PROGRESS') {
			markerSet.add('in-progress');
		}

		if (task?.status === 'DONE') {
			markerSet.add('done');
		}
	}

	return Array.from(markerSet);
}

function getFirstTaskDayKey(tasksByDay) {
	return Array.from(tasksByDay.keys()).sort()[0] ?? '';
}

function getFirstTaskDayKeyForMonth(tasksByDay, monthDate) {
	const targetYear = monthDate.getFullYear();
	const targetMonthIndex = monthDate.getMonth();

	const matchingKeys = Array.from(tasksByDay.keys())
		.filter((dayKey) => {
			const dayDate = getLocalDateFromRaw(dayKey);

			return (
				dayDate &&
				dayDate.getFullYear() === targetYear &&
				dayDate.getMonth() === targetMonthIndex
			);
		})
		.sort();

	return matchingKeys[0] ?? '';
}

export default function ProjectTasksCalendarView({
	tasks = [],
	currentUserInitials,
	currentUserAvatarVariant,
	onTaskMoreClick,
	onTaskCommentSubmit,
	submittingCommentTaskId,
	commentErrorByTaskId,
}) {
	const tasksByDay = useMemo(() => buildTasksByDay(tasks), [tasks]);

	const [currentMonth, setCurrentMonth] = useState(() => {
		const firstTaskDayKey = getFirstTaskDayKey(tasksByDay);

		if (firstTaskDayKey !== '') {
			const firstTaskDate = getLocalDateFromRaw(firstTaskDayKey);

			if (firstTaskDate) {
				return getMonthStart(firstTaskDate);
			}
		}

		return getMonthStart(new Date());
	});

	const [selectedDayKey, setSelectedDayKey] = useState(() =>
		getFirstTaskDayKey(tasksByDay),
	);

	const monthDayEntries = useMemo(
		() => getMonthDayEntries(currentMonth),
		[currentMonth],
	);

	const selectedDayTasks = useMemo(() => {
		if (selectedDayKey === '') {
			return [];
		}

		return tasksByDay.get(selectedDayKey) ?? [];
	}, [selectedDayKey, tasksByDay]);

	function handleChangeMonth(nextMonth) {
		setCurrentMonth(nextMonth);

		const firstDayKeyInMonth = getFirstTaskDayKeyForMonth(
			tasksByDay,
			nextMonth,
		);

		setSelectedDayKey(firstDayKeyInMonth);
	}

	const dueTasksCount = Array.from(tasksByDay.values()).reduce(
		(total, dayTasks) => total + dayTasks.length,
		0,
	);

	if (dueTasksCount === 0) {
		return (
			<div className={styles.emptyState}>
				Aucune tâche avec date d&apos;écheance exploitable à afficher
				dans le calendrier.
			</div>
		);
	}

	return (
		<div className={styles.calendarView}>
			<div className={styles.calendarHeader}>
				<button
					type="button"
					className={styles.monthButton}
					onClick={() =>
						handleChangeMonth(getPreviousMonth(currentMonth))
					}
					aria-label="Mois précédent"
				>
					<ChevronLeft size={18} strokeWidth={2} />
				</button>

				<p className={styles.monthLabel}>
					{getMonthLabel(currentMonth)}
				</p>

				<button
					type="button"
					className={styles.monthButton}
					onClick={() =>
						handleChangeMonth(getNextMonth(currentMonth))
					}
					aria-label="Mois suivant"
				>
					<ChevronRight size={18} strokeWidth={2} />
				</button>
			</div>

			<div className={styles.weekdaysGrid} aria-hidden="true">
				{WEEKDAY_LABELS.map((weekday) => (
					<span key={weekday} className={styles.weekdayCell}>
						{weekday}
					</span>
				))}
			</div>

			<div className={styles.daysGrid}>
				{monthDayEntries.map((entry) => {
					const dayTasks = tasksByDay.get(entry.key) ?? [];
					const markerVariants = getMarkerVariants(dayTasks);
					const isSelected = selectedDayKey === entry.key;
					const hasTasks = dayTasks.length > 0;

					return (
						<button
							key={entry.key}
							type="button"
							className={`${styles.dayCell} ${
								entry.isCurrentMonth
									? ''
									: styles.dayCellOutside
							} ${hasTasks ? styles.dayCellHasTasks : ''} ${
								isSelected ? styles.dayCellSelected : ''
							}`.trim()}
							onClick={() =>
								setSelectedDayKey(hasTasks ? entry.key : '')
							}
							aria-pressed={isSelected}
							aria-label={
								hasTasks
									? `${entry.date.getDate()} - ${dayTasks.length} tâche(s)`
									: `${entry.date.getDate()}`
							}
						>
							<span className={styles.dayNumber}>
								{entry.date.getDate()}
							</span>

							{hasTasks ? (
								<span className={styles.dayMarkers}>
									{markerVariants.map((variant) => (
										<span
											key={variant}
											className={`${styles.dayMarker} ${
												variant === 'todo'
													? styles.dayMarkerTodo
													: variant === 'in-progress'
														? styles.dayMarkerInProgress
														: styles.dayMarkerDone
											}`.trim()}
											aria-hidden="true"
										/>
									))}

									{dayTasks.length > 3 ? (
										<span className={styles.dayCountExtra}>
											+{dayTasks.length - 3}
										</span>
									) : null}
								</span>
							) : null}
						</button>
					);
				})}
			</div>

			<div className={styles.selectedDaySection}>
				<h3 className={styles.selectedDayTitle}>
					{selectedDayKey === ''
						? 'Aucune date sélectionnée'
						: `Tâches du ${new Intl.DateTimeFormat('fr-FR', {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							}).format(getLocalDateFromRaw(selectedDayKey))}`}
				</h3>

				{selectedDayTasks.length === 0 ? (
					<p className={styles.selectedDayEmpty}>
						Sélectionner un jour avec des tâches pour afficher le
						détail.
					</p>
				) : (
					<div className={styles.selectedDayTasks}>
						{selectedDayTasks.map((task) => (
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
								onMoreClick={() => onTaskMoreClick(task)}
								currentUserInitials={currentUserInitials}
								currentUserAvatarVariant={
									currentUserAvatarVariant
								}
								onCommentSubmit={(content) =>
									onTaskCommentSubmit(task.id, content)
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
			</div>
		</div>
	);
}
