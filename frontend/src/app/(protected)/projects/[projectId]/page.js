/**
 * @file src/app/(protected)/projects/[projectId]/page.js
 * @description
 * Page detail d'un projet avec donnees backend reelles.
 */

import Image from 'next/image';
import { cookies } from 'next/headers';

import ProjectHeader from '@/components/projects/ProjectHeader/ProjectHeader';
import ContributorsBar from '@/components/projects/ContributorsBar/ContributorsBar';
import Chip from '@/components/ui/Chip/Chip';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import TaskCardProject from '@/components/tasks/TaskCardProject/TaskCardProject';

import arrowDownIcon from '@/assets/icons/arrow-down-icon.png';
import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';

import { TOKEN_COOKIE } from '@/lib/authConstants';
import { requireUser } from '@/lib/authServer';
import {
	extractProject,
	mapProjectDetail,
	extractProjectTasks,
	getUserInitials,
} from '@/lib/mappers/projectMapper';
import { getProjectById, getProjectTasks } from '@/services/projectService';

import styles from './page.module.css';

export default async function ProjectDetailPage({ params }) {
	const user = await requireUser();
	const { projectId } = await params;
	
	const cookieStore = await cookies();
	const token = cookieStore.get(TOKEN_COOKIE)?.value;

	let project = null;
	let projectTasks = [];
	let projectErrorMessage = '';
	let tasksErrorMessage = '';

	if (!token) {
		projectErrorMessage = 'Session introuvable.';
	} else {
		try {
			const projectResponse = await getProjectById(token, projectId);
			const rawProject = extractProject(projectResponse);
			project = mapProjectDetail(rawProject);
		} catch (error) {
			projectErrorMessage =
				error instanceof Error
					? error.message
					: 'Impossible de charger le projet.';
		}

		if (projectErrorMessage === '' && project) {
			try {
				const projectTasksResponse = await getProjectTasks(
					token,
					projectId,
				);

				projectTasks = extractProjectTasks(
					projectTasksResponse,
					project.ownerId,
				);
			} catch (error) {
				tasksErrorMessage =
					error instanceof Error
						? error.message
						: 'Impossible de charger les tâches du projet.';
			}
		}
	}

	if (projectErrorMessage !== '') {
		return (
			<section className={styles.page}>
				<p className={styles.feedbackMessage}>
					Projet : {projectErrorMessage}
				</p>
			</section>
		);
	}

	if (!project) {
		return (
			<section className={styles.page}>
				<p className={styles.feedbackMessage}>Projet introuvable.</p>
			</section>
		);
	}

	const currentUserInitials = getUserInitials(user?.name);
	const currentUserAvatarVariant =
		user?.id === project.ownerId ? 'owner' : 'member';

	return (
		<section className={styles.page}>
			<ProjectHeader
				projectName={project.name}
				description={project.description}
				editHref="#"
				backHref="/projects"
			/>

			<ContributorsBar contributors={project.contributors} />

			<section
				className={styles.tasksFrame}
				aria-label="Tâches du projet"
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

				{tasksErrorMessage !== '' ? (
					<p className={styles.feedbackMessage}>
						Tâches : {tasksErrorMessage}
					</p>
				) : projectTasks.length === 0 ? (
					<p className={styles.feedbackMessage}>
						Aucune tâche dans ce projet pour le moment.
					</p>
				) : (
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
								currentUserInitials={currentUserInitials}
								currentUserAvatarVariant={
									currentUserAvatarVariant
								}
							/>
						))}
					</div>
				)}
			</section>
		</section>
	);
}
