// src/app/(protected)/projects/[projectId]/page.js
import Image from 'next/image';
import ProjectHeader from '@/components/projects/ProjectHeader/ProjectHeader';
import ContributorsBar from '@/components/projects/ContributorsBar/ContributorsBar';
import Chip from '@/components/ui/Chip/Chip';
import SearchInput from '@/components/ui/SearchInput/SearchInput';

import arrowDownIcon from '@/assets/icons/arrow-down-icon.png';
import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';

import TaskCardProject from '@/components/tasks/TaskCardProject/TaskCardProject';
import styles from './page.module.css';

// Exemple de données
const tasks = [
	{
		id: 1,
		title: 'Authentification JWT',
		description:
			"Implémenter le système d'authentification avec tokens JWT",
		statusVariant: 'red',
		statusLabel: 'À faire',
		dueDateLabel: '9 mars',
		commentCount: 1,
		assignees: [
			{
				id: 'user_1',
				initials: 'BD',
				name: 'Bertrand Dupont',
			},
			{
				id: 'user_2',
				initials: 'AD',
				name: 'Anne Dupont',
			},
		],
	},
	{
		id: 2,
		title: 'Authentification JWT',
		description:
			"Implémenter le système d'authentification avec tokens JWT",
		statusVariant: 'orange',
		statusLabel: 'En cours',
		dueDateLabel: '9 mars',
		commentCount: 1,
		assignees: [
			{
				id: 'user_1',
				initials: 'BD',
				name: 'Bertrand Dupont',
			},
			{
				id: 'user_2',
				initials: 'AD',
				name: 'Anne Dupont',
			},
		],
	},
	{
		id: 3,
		title: 'Authentification JWT',
		description:
			"Implémenter le système d'authentification avec tokens JWT",
		statusVariant: 'green',
		statusLabel: 'Terminée',
		dueDateLabel: '9 mars',
		commentCount: 1,
		assignees: [
			{
				id: 'user_1',
				initials: 'BD',
				name: 'Bertrand Dupont',
			},
			{
				id: 'user_2',
				initials: 'AD',
				name: 'Anne Dupont',
			},
		],
	},
];

const projectTasks = [
	{
		id: 1,
		title: 'Authentification JWT',
		description:
			"Implémenter le système d'authentification avec tokens JWT",
		statusLabel: 'À faire',
		statusVariant: 'red',
		dueDateLabel: '9 mars',
		assignees: [
			{
				id: 1,
				initials: 'BD',
				name: 'Bertrand Dupont',
				variant: 'member',
			},
			{
				id: 2,
				initials: 'AD',
				name: 'Anne Dupont',
				variant: 'member',
			},
		],
		comments: [
			{
				id: 1,
				authorInitials: 'BD',
				authorName: 'Bertrand Dupont',
				authorVariant: 'member',
				dateLabel: '23 mars, 11:20',
				message:
					"Attention à bien gérer l'expiration des tokens et le refresh automatique côté client.",
			},
		],
		defaultExpanded: false,
	},
];

/**
 * Exemple de donnees
 */
const contributors = [
	{
		id: 1,
		initials: 'AD',
		role: 'Proprietaire',
	},
	{
		id: 2,
		initials: 'BD',
		name: 'Bertrand Dupont',
	},
	{
		id: 3,
		initials: 'AD',
		name: 'Anne Dupont',
	},
];

export default function ProjectDetailPage() {
	return (
		<section className={styles.page}>
			<ProjectHeader
				projectName="Nom du projet"
				description="Développement de la nouvelle version de l'API REST avec authentification JWT"
				editHref="#"
			/>

			<ContributorsBar contributors={contributors} />

			<section
				className={styles.tasksFrame}
				aria-label="Taches du projet"
			>
				<div className={styles.tasksHeader}>
					<div className={styles.tasksHeading}>
						<h2 className={styles.tasksTitle}>Tâches</h2>
						<p className={styles.tasksSubtitle}>
							Par ordre de priorité
						</p>
					</div>

					<div className={styles.tasksControls}>
						<Chip icon={checkedIcon} compact>
							Liste
						</Chip>

						<Chip icon={kanbanIcon} compact>
							Calendrier
						</Chip>

						<button type="button" className={styles.tasksFilter}>
							<span>Statut</span>
							<Image
								src={arrowDownIcon}
								alt=""
								aria-hidden="true"
								className={styles.statusIcon}
							/>
						</button>

						<SearchInput
							placeholder="Rechercher une tâche"
							ariaLabel="Rechercher une tâche"
						/>
					</div>
				</div>

				<div className={styles.tasksList}>
					{projectTasks.map((task) => (
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
						/>
					))}
				</div>
			</section>
		</section>
	);
}
