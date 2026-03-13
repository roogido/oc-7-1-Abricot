/**
 * @file src/app/(protected)/dashboard/kanban/page.js
 * @description
 * Page dashboard en vue kanban.
 */

import { cookies } from 'next/headers';

import PageIntro from '@/components/layout/PageIntro/PageIntro';
import Chip from '@/components/ui/Chip/Chip';
import Button from '@/components/ui/Button/Button';
import DashboardKanbanBoard from '@/components/dashboard/DashboardKanbanBoard/DashboardKanbanBoard';

import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';
import projectIcon from '@/assets/icons/project-icon.png';

import { TOKEN_COOKIE } from '@/lib/authConstants';
import { requireUser } from '@/lib/authServer';
import {
	extractAssignedTasks,
	buildProjectsNameMap,
	buildDashboardKanbanColumns,
} from '@/lib/mappers/taskMapper';
import { getAssignedTasks } from '@/services/dashboardService';
import { getProjects } from '@/services/projectService';

import styles from './page.module.css';

/**
 * Page dashboard en vue kanban.
 *
 * @returns {Promise<JSX.Element>} Interface dashboard kanban
 */
export default async function DashboardKanbanPage() {
	const user = await requireUser();

	const cookieStore = await cookies();
	const token = cookieStore.get(TOKEN_COOKIE)?.value;

	let kanbanColumns = [];
	let errorMessage = '';

	if (!token) {
		errorMessage = 'Session introuvable.';
	} else {
		try {
			const [assignedTasksResponse, projectsResponse] = await Promise.all(
				[getAssignedTasks(token), getProjects(token)],
			);

			const projectsMap = buildProjectsNameMap(projectsResponse);
			const assignedTasks = extractAssignedTasks(
				assignedTasksResponse,
				projectsMap,
			);

			kanbanColumns = buildDashboardKanbanColumns(assignedTasks);
		} catch (error) {
			errorMessage =
				error instanceof Error
					? error.message
					: 'Impossible de charger le tableau kanban.';
		}
	}

	return (
		<div className={styles.page}>
			<section className={styles.introSection}>
				<PageIntro
					title="Tableau de bord"
					subtitle={`Bonjour ${user.name || 'utilisateur'}, voici un aperçu de vos projets et tâches`}
					actions={<Button>+ Créer un projet</Button>}
				/>

				<div className={styles.viewSwitch}>
					<Chip icon={checkedIcon} href="/dashboard">
						Liste
					</Chip>

					<Chip icon={kanbanIcon} href="/dashboard/kanban" active>
						Kanban
					</Chip>

					<Chip icon={projectIcon} href="/dashboard/projects">
						Projets
					</Chip>
				</div>
			</section>

			<section className={styles.kanbanSection}>
				{errorMessage ? (
					<p className={styles.feedbackMessage}>{errorMessage}</p>
				) : (
					<DashboardKanbanBoard columns={kanbanColumns} />
				)}
			</section>
		</div>
	);
}
