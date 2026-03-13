/**
 * @file src/components/dashboard/DashboardAssignedTasksPanel/DashboardAssignedTasksPanel.js
 * @description
 * Panneau client du dashboard pour la recherche et l'affichage
 * des taches assignees en vue liste.
 */

'use client';

import { useMemo, useState } from 'react';

import SearchInput from '@/components/ui/SearchInput/SearchInput';
import DashboardCardsFrame from '@/components/dashboard/DashboardCardsFrame/DashboardCardsFrame';
import TaskCardDashboardList from '@/components/tasks/TaskCardDashboardList/TaskCardDashboardList';

import styles from './DashboardAssignedTasksPanel.module.css';

/**
 * Normalise une valeur texte pour la recherche.
 *
 * @param {string|null|undefined} value
 * @returns {string}
 */
function normalizeSearchValue(value) {
	return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Panneau interactif de recherche et liste des taches assignees.
 *
 * @param {Object} props
 * @param {Object[]} props.tasks
 * @param {string} [props.title='Mes tâches assignées']
 * @param {string} [props.subtitle='Par ordre de priorité']
 * @returns {JSX.Element}
 */
export default function DashboardAssignedTasksPanel({
	tasks,
	title = 'Mes tâches assignées',
	subtitle = 'Par ordre de priorité',
}) {
	const [searchTerm, setSearchTerm] = useState('');

	const normalizedSearchTerm = normalizeSearchValue(searchTerm);

	const filteredTasks = useMemo(() => {
		if (normalizedSearchTerm === '') {
			return tasks;
		}

		return tasks.filter((task) => {
			const titleValue = normalizeSearchValue(task.title);
			const descriptionValue = normalizeSearchValue(task.description);
			const projectNameValue = normalizeSearchValue(task.projectName);
			const statusLabelValue = normalizeSearchValue(task.statusLabel);

			return (
				titleValue.includes(normalizedSearchTerm) ||
				descriptionValue.includes(normalizedSearchTerm) ||
				projectNameValue.includes(normalizedSearchTerm) ||
				statusLabelValue.includes(normalizedSearchTerm)
			);
		});
	}, [tasks, normalizedSearchTerm]);

	return (
		<DashboardCardsFrame
			title={title}
			subtitle={subtitle}
			actions={
				<SearchInput
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
					placeholder="Rechercher une tâche"
					ariaLabel="Rechercher une tâche assignée"
				/>
			}
		>
			{filteredTasks.length === 0 ? (
				<p className={styles.feedbackMessage}>
					{normalizedSearchTerm === ''
						? 'Aucune tâche assignée pour le moment.'
						: 'Aucune tâche ne correspond à votre recherche.'}
				</p>
			) : (
				<div className={styles.cardsList}>
					{filteredTasks.map((task) => (
						<TaskCardDashboardList
							key={task.id}
							title={task.title}
							description={task.description}
							statusVariant={task.statusVariant}
							statusLabel={task.statusLabel}
							projectName={task.projectName}
							dueDate={task.dueDateLabel}
							commentsCount={task.commentsCount}
							viewHref={`/projects/${task.projectId}/tasks/${task.id}`}
						/>
					))}
				</div>
			)}
		</DashboardCardsFrame>
	);
}
