/**
 * @file src/app/(protected)/projects/page.js
 * @description
 * Page listant les projets accessibles a l'utilisateur authentifie.
 */

import { cookies } from 'next/headers';

import PageIntro from '@/components/layout/PageIntro/PageIntro';
import ProjectsGrid from '@/components/projects/ProjectsGrid/ProjectsGrid';
import DashboardCreateProjectAction from '@/components/projects/DashboardCreateProjectAction/DashboardCreateProjectAction';

import { TOKEN_COOKIE } from '@/lib/authConstants';
import { requireUser } from '@/lib/authServer';
import {
	extractProjectsList,
	buildProjectsListItems,
} from '@/lib/mappers/projectMapper';
import { getProjects, getProjectTasks } from '@/services/projectService';

import styles from './page.module.css';

/**
 * Page principale des projets.
 *
 * @returns {Promise<JSX.Element>} Interface des projets
 */
export default async function ProjectsPage() {
	await requireUser();

	const cookieStore = await cookies();
	const token = cookieStore.get(TOKEN_COOKIE)?.value;

	let projects = [];
	let errorMessage = '';

	if (!token) {
		errorMessage = 'Session introuvable.';
	} else {
		try {
			const projectsResponse = await getProjects(token);
			const rawProjects = extractProjectsList(projectsResponse);

			const projectsWithTasks = await Promise.all(
				rawProjects.map(async (project) => {
					try {
						const tasksResponse = await getProjectTasks(
							token,
							project.id,
						);

						return {
							project,
							tasksPayload: tasksResponse,
						};
					} catch {
						return {
							project,
							tasksPayload: null,
						};
					}
				}),
			);

			projects = buildProjectsListItems(projectsWithTasks);
		} catch (error) {
			errorMessage =
				error instanceof Error
					? error.message
					: 'Impossible de charger les projets.';
		}
	}

	return (
		<section className={styles.page}>
			<PageIntro
				title="Mes projets"
				subtitle="Gérez vos projets"
				actions={<DashboardCreateProjectAction />}
			/>

			{errorMessage ? (
				<section className={styles.feedbackSection}>
					<p className={styles.feedbackMessage} role="alert">
						{errorMessage}
					</p>
				</section>
			) : projects.length === 0 ? (
				<section className={styles.feedbackSection}>
					<p
						className={styles.feedbackMessage}
						role="status"
						aria-live="polite"
					>
						Aucun projet pour le moment.
					</p>
				</section>
			) : (
				<ProjectsGrid projects={projects} />
			)}
		</section>
	);
}
