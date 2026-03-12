/**
 * @file src/app/(protected)/dashboard/page.js
 * @description
 * Page "Tableau de bord" en vue liste.
 */

import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import PageIntro from '@/components/layout/PageIntro/PageIntro';
import SearchInput from '@/components/ui/SearchInput/SearchInput';

import DashboardCardsFrame from '@/components/dashboard/DashboardCardsFrame/DashboardCardsFrame';
import TaskCardDashboardList from '@/components/tasks/TaskCardDashboardList/TaskCardDashboardList';

import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';

import styles from './page.module.css';

/**
 * Donnees de demonstration.
 */
const currentUser = {
	firstName: 'Alice',
	lastName: 'Dupont',
};

const assignedTasks = [
	{
		id: 1,
		title: 'Nom de la tâche',
		description: 'Description de la tâche',
		statusVariant: 'red',
		statusLabel: 'À faire',
		projectName: 'Nom du projet',
		dueDate: '9 mars',
		commentsCount: 2,
	},
	{
		id: 2,
		title: 'Nom de la tâche',
		description: 'Description de la tâche',
		statusVariant: 'orange',
		statusLabel: 'En cours',
		projectName: 'Nom du projet',
		dueDate: '9 mars',
		commentsCount: 2,
	},
	{
		id: 3,
		title: 'Nom de la tâche',
		description: 'Description de la tâche',
		statusVariant: 'red',
		statusLabel: 'À faire',
		projectName: 'Nom du projet',
		dueDate: '9 mars',
		commentsCount: 2,
	},
	{
		id: 4,
		title: 'Nom de la tâche',
		description: 'Description de la tâche',
		statusVariant: 'red',
		statusLabel: 'À faire',
		projectName: 'Nom du projet',
		dueDate: '9 mars',
		commentsCount: 2,
	},
];

/**
 * Page principale du tableau de bord en vue liste.
 *
 * @returns {JSX.Element} Interface du dashboard liste
 */
export default function DashboardPage() {
	const fullName = `${currentUser.firstName} ${currentUser.lastName}`;

	return (
		<section className={styles.page}>
			<PageIntro
				title="Tableau de bord"
				subtitle={`Bonjour ${fullName}, voici un aperçu de vos projets et tâches`}
				actions={<Button type="button">+ Créer un projet</Button>}
			/>

			<div className={styles.viewSwitch}>
				<Chip icon={checkedIcon} active>
					Liste
				</Chip>

				<Chip icon={kanbanIcon}>Kanban</Chip>
			</div>

			<DashboardCardsFrame>
				<div className={styles.frameHeader}>
					<div className={styles.frameHeading}>
						<h2 className={styles.frameTitle}>
							Mes tâches assignées
						</h2>
						<p className={styles.frameSubtitle}>
							Par ordre de priorité
						</p>
					</div>

					<SearchInput
						placeholder="Rechercher une tâche"
						ariaLabel="Rechercher une tâche"
					/>
				</div>

				<div className={styles.cardsList}>
					{assignedTasks.map((task) => (
						<TaskCardDashboardList key={task.id} {...task} />
					))}
				</div>
			</DashboardCardsFrame>
		</section>
	);
}
