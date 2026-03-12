/**
 * @file src/app/(protected)/dashboard/page.js
 * @description
 * Page dashboard en vue liste.
 */

import PageIntro from '@/components/layout/PageIntro/PageIntro';
import Chip from '@/components/ui/Chip/Chip';
import Button from '@/components/ui/Button/Button';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import DashboardCardsFrame from '@/components/dashboard/DashboardCardsFrame/DashboardCardsFrame';
import TaskCardDashboardList from '@/components/tasks/TaskCardDashboardList/TaskCardDashboardList';

import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';

import styles from './page.module.css';

const fullName = 'Alice Dupont';

const assignedTasks = [
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
		statusVariant: 'orange',
		statusLabel: 'En cours',
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
	{
		id: 4,
		title: 'Nom de la tâche',
		description: 'Description de la tâche',
		statusVariant: 'red',
		statusLabel: 'À faire',
		projectName: 'Nom du projet',
		dueDate: '9 mars',
		commentCount: 2,
	},
];

export default function DashboardPage() {
	return (
		<section className={styles.page}>
			<PageIntro
				title="Tableau de bord"
				subtitle={`Bonjour ${fullName}, voici un aperçu de vos projets et tâches`}
				actions={<Button>+ Créer un projet</Button>}
			/>

			<div className={styles.viewSwitch}>
				<Chip icon={checkedIcon} href="/dashboard" active>
					Liste
				</Chip>

				<Chip icon={kanbanIcon} href="/dashboard/kanban">
					Kanban
				</Chip>
			</div>

			<DashboardCardsFrame
				title="Mes tâches assignées"
				subtitle="Par ordre de priorité"
				actions={<SearchInput placeholder="Rechercher une tâche" />}
			>
				<div className={styles.cardsList}>
					{assignedTasks.map((task) => (
						<TaskCardDashboardList key={task.id} {...task} />
					))}
				</div>
			</DashboardCardsFrame>
		</section>
	);
}
