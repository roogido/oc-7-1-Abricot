// src/app/(protected)/projects/[projectId]/page.js
/**
 * @file src/app/(protected)/projects/[projectId]/page.js
 * @description
 * Page detail d'un projet avec donnees backend reelles.
 */

import { cookies } from 'next/headers';

import ProjectHeader from '@/components/projects/ProjectHeader/ProjectHeader';
import ContributorsBar from '@/components/projects/ContributorsBar/ContributorsBar';
import ProjectTasksSection from '@/components/projects/ProjectTasksSection/ProjectTasksSection';
import ProjectEditAction from '@/components/projects/ProjectEditAction/ProjectEditAction';

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

	const editableContributors = project.contributors.filter(
		(contributor) => contributor?.isOwner !== true,
	);

	return (
		<section className={styles.page}>
			<ProjectHeader
				projectName={project.name}
				description={project.description}
				editHref={`/projects/${project.id}?edit=1`}
				backHref="/projects"
			/>

			<ProjectEditAction
				projectId={project.id}
				initialTitle={project.name}
				initialDescription={project.description}
				initialContributors={editableContributors}
			/>

			<ContributorsBar contributors={project.contributors} />

			<ProjectTasksSection
				tasks={projectTasks}
				errorMessage={tasksErrorMessage}
				currentUserInitials={currentUserInitials}
				currentUserAvatarVariant={currentUserAvatarVariant}
			/>
		</section>
	);
}
