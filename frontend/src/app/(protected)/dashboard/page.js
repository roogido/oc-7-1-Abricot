// src/app/(protected)/dashboard/page.js
import { cookies } from 'next/headers';

import PageIntro from '@/components/layout/PageIntro/PageIntro';
import Chip from '@/components/ui/Chip/Chip';
import DashboardAssignedTasksPanel from '@/components/dashboard/DashboardAssignedTasksPanel/DashboardAssignedTasksPanel';
import DashboardCreateProjectAction from '@/components/projects/DashboardCreateProjectAction/DashboardCreateProjectAction';

import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';
import projectIcon from '@/assets/icons/project-icon.png';

import { TOKEN_COOKIE } from '@/lib/authConstants';
import { requireUser } from '@/lib/authServer';
import {
	extractAssignedTasks,
	buildProjectsNameMap,
} from '@/lib/mappers/taskMapper';
import { getAssignedTasks } from '@/services/dashboardService';
import { getProjects } from '@/services/projectService';

import styles from './page.module.css';

export default async function DashboardPage() {
	const user = await requireUser();

	const cookieStore = await cookies();
	const token = cookieStore.get(TOKEN_COOKIE)?.value;

	let assignedTasks = [];
	let errorMessage = '';

	if (!token) {
		errorMessage = 'Session introuvable.';
	} else {
		try {
			const [assignedTasksResponse, projectsResponse] = await Promise.all([
				getAssignedTasks(token),
				getProjects(token),
			]);

			const projectsMap = buildProjectsNameMap(projectsResponse);
			assignedTasks = extractAssignedTasks(
				assignedTasksResponse,
				projectsMap,
			);
		} catch (error) {
			errorMessage =
				error instanceof Error
					? error.message
					: 'Impossible de charger le tableau de bord.';
		}
	}

	return (
		<section className={styles.page}>
			<PageIntro
				title="Tableau de bord"
				subtitle={`Bonjour ${user.name || 'utilisateur'}, voici un apercu de vos projets et taches`}
				actions={<DashboardCreateProjectAction />}
			/>

			<div className={styles.viewSwitch}>
				<Chip icon={checkedIcon} href="/dashboard" active>
					Liste
				</Chip>

				<Chip icon={kanbanIcon} href="/dashboard/kanban">
					Kanban
				</Chip>

				<Chip icon={projectIcon} href="/dashboard/projects">
					Projets
				</Chip>
			</div>

			{errorMessage ? (
				<section className={styles.feedbackSection}>
					<p className={styles.feedbackMessage}>{errorMessage}</p>
				</section>
			) : (
				<DashboardAssignedTasksPanel tasks={assignedTasks} />
			)}
		</section>
	);
}
