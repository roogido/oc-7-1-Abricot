/**
 * @file src/app/(protected)/dashboard/projects/page.js
 * @description
 * Page dashboard en vue projets.
 */

import { cookies } from 'next/headers';

import PageIntro from '@/components/layout/PageIntro/PageIntro';
import Chip from '@/components/ui/Chip/Chip';
import Button from '@/components/ui/Button/Button';
import DashboardCardsFrame from '@/components/dashboard/DashboardCardsFrame/DashboardCardsFrame';
import TaskCardDashboardList from '@/components/tasks/TaskCardDashboardList/TaskCardDashboardList';

import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';
import projectIcon from '@/assets/icons/project-icon.png';

import { TOKEN_COOKIE } from '@/lib/authConstants';
import { requireUser } from '@/lib/authServer';
import { extractProjectsWithAssignedTasks } from '@/lib/mappers/taskMapper';
import { getProjectsWithTasks } from '@/services/dashboardService';

import styles from './page.module.css';

export default async function DashboardProjectsPage() {
	const user = await requireUser();

	const cookieStore = await cookies();
	const token = cookieStore.get(TOKEN_COOKIE)?.value;

	let projectsWithTasks = [];
	let errorMessage = '';

	if (!token) {
		errorMessage = 'Session introuvable.';
	} else {
		try {
			const response = await getProjectsWithTasks(token);
			projectsWithTasks = extractProjectsWithAssignedTasks(
				response,
				user?.id ?? '',
			);
		} catch (error) {
			errorMessage =
				error instanceof Error
					? error.message
					: 'Impossible de charger les projets du tableau de bord.';
		}
	}

	return (
		<section className={styles.page}>
			<PageIntro
				title="Tableau de bord"
				subtitle={`Bonjour ${user.name || 'utilisateur'}, voici un aperçu de vos projets et tâches`}
				actions={<Button>+ Créer un projet</Button>}
			/>

			<div className={styles.viewSwitch}>
				<Chip icon={checkedIcon} href="/dashboard">
					Liste
				</Chip>

				<Chip icon={kanbanIcon} href="/dashboard/kanban">
					Kanban
				</Chip>

				<Chip icon={projectIcon} href="/dashboard/projects" active>
					Projets
				</Chip>
			</div>

			{errorMessage ? (
				<section className={styles.feedbackSection}>
					<p className={styles.feedbackMessage}>{errorMessage}</p>
				</section>
			) : projectsWithTasks.length === 0 ? (
				<section className={styles.feedbackSection}>
					<p className={styles.feedbackMessage}>
						Aucun projet avec tâches assignées pour le moment.
					</p>
				</section>
			) : (
				<div className={styles.projectsGroups}>
					<DashboardCardsFrame
						title="Mes projets"
						subtitle="Projets dans lesquels vous avez des tâches assignées"
					>
						<div className={styles.projectsList}>
							{projectsWithTasks.map((project) => (
								<section
									key={project.id}
									className={styles.projectGroup}
									aria-labelledby={`dashboard-project-${project.id}`}
								>
									<header className={styles.projectHeader}>
										<h3
											id={`dashboard-project-${project.id}`}
											className={styles.projectTitle}
										>
											{project.name}
										</h3>

										{project.description ? (
											<p
												className={
													styles.projectSubtitle
												}
											>
												{project.description}
											</p>
										) : null}
									</header>

									<div className={styles.cardsList}>
										{project.tasks.map((task) => (
											<TaskCardDashboardList
												key={task.id}
												title={task.title}
												description={task.description}
												statusVariant={
													task.statusVariant
												}
												statusLabel={task.statusLabel}
												projectName={task.projectName}
												dueDate={task.dueDateLabel}
												commentsCount={
													task.commentsCount
												}
												viewHref={`/projects/${task.projectId}/tasks/${task.id}`}
											/>
										))}
									</div>
								</section>
							))}
						</div>
					</DashboardCardsFrame>
				</div>
			)}
		</section>
	);
}
