/**
 * @file src/app/(protected)/dashboard/kanban/page.js
 * @description
 * Page dashboard en vue kanban.
 */

import PageIntro from '@/components/layout/PageIntro/PageIntro';
import Chip from '@/components/ui/Chip/Chip';
import Button from '@/components/ui/Button/Button';
import DashboardKanbanBoard from '@/components/dashboard/DashboardKanbanBoard/DashboardKanbanBoard';

import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';

import styles from './page.module.css';

const fullName = 'Alice Dupont';

const kanbanColumns = [
	{
		id: 'todo',
		title: 'À faire',
		count: 4,
		tasks: [
			{
				id: 1,
				title: 'Nom de la tâche',
				description: 'Description de la tâche',
				statusVariant: 'red',
				statusLabel: 'À faire',
				projectName: 'Nom du projet',
				dueDate: '9 mars',
				commentCount: 2,
			},
			{
				id: 2,
				title: 'Nom de la tâche',
				description: 'Description de la tâche',
				statusVariant: 'red',
				statusLabel: 'À faire',
				projectName: 'Nom du projet',
				dueDate: '9 mars',
				commentCount: 2,
			},
			{
				id: 3,
				title: 'Nom de la tâche',
				description: 'Description de la tâche',
				statusVariant: 'red',
				statusLabel: 'À faire',
				projectName: 'Nom du projet',
				dueDate: '9 mars',
				commentCount: 2,
			},
		],
	},
	{
		id: 'in-progress',
		title: 'En cours',
		count: 4,
		tasks: [
			{
				id: 4,
				title: 'Nom de la tâche',
				description: 'Description de la tâche',
				statusVariant: 'orange',
				statusLabel: 'En cours',
				projectName: 'Nom du projet',
				dueDate: '9 mars',
				commentCount: 2,
			},
			{
				id: 5,
				title: 'Nom de la tâche',
				description: 'Description de la tâche',
				statusVariant: 'orange',
				statusLabel: 'En cours',
				projectName: 'Nom du projet',
				dueDate: '9 mars',
				commentCount: 2,
			},
			{
				id: 6,
				title: 'Nom de la tâche',
				description: 'Description de la tâche',
				statusVariant: 'orange',
				statusLabel: 'En cours',
				projectName: 'Nom du projet',
				dueDate: '9 mars',
				commentCount: 2,
			},
		],
	},
	{
		id: 'done',
		title: 'Terminées',
		count: 4,
		tasks: [
			{
				id: 7,
				title: 'Nom de la tâche',
				description: 'Description de la tâche',
				statusVariant: 'green',
				statusLabel: 'Terminée',
				projectName: 'Nom du projet',
				dueDate: '9 mars',
				commentCount: 2,
			},
			{
				id: 8,
				title: 'Nom de la tâche',
				description: 'Description de la tâche',
				statusVariant: 'green',
				statusLabel: 'Terminée',
				projectName: 'Nom du projet',
				dueDate: '9 mars',
				commentCount: 2,
			},
			{
				id: 9,
				title: 'Nom de la tâche',
				description: 'Description de la tâche',
				statusVariant: 'green',
				statusLabel: 'Terminée',
				projectName: 'Nom du projet',
				dueDate: '9 mars',
				commentCount: 2,
			},
		],
	},
];

/**
 * Page dashboard en vue kanban.
 *
 * @returns {JSX.Element} Interface dashboard kanban
 */
export default function DashboardKanbanPage() {
	return (
		<section className={styles.page}>
			<div className={styles.introSection}>
				<PageIntro
					title="Tableau de bord"
					subtitle={`Bonjour ${fullName}, voici un aperçu de vos projets et tâches`}
					actions={<Button>+ Créer un projet</Button>}
				/>

				<div className={styles.viewSwitch}>
					<Chip icon={checkedIcon}>Liste</Chip>

					<Chip icon={kanbanIcon} active>
						Kanban
					</Chip>
				</div>
			</div>

			<section className={styles.kanbanSection}>
				<DashboardKanbanBoard columns={kanbanColumns} />
			</section>
		</section>
	);
}
