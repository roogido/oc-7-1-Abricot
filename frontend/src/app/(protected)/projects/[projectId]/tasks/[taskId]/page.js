/**
 * @file src/app/(protected)/projects/[projectId]/tasks/[taskId]/page.js
 * @description
 * Page detail d'une tache.
 * Appelée depuis les 3 vues de dashboard : Liste, Kanban, Projets
 */

import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';

import TaskCommentsCardClient from '@/components/tasks/TaskCommentsCardClient/TaskCommentsCardClient';

import arrowLeftIcon from '@/assets/icons/arrow-left-icon.png';

import { TOKEN_COOKIE } from '@/lib/authConstants';
import { requireUser } from '@/lib/authServer';
import { extractProject, mapProjectDetail } from '@/lib/mappers/projectMapper';
import { extractTask, mapTaskDetail } from '@/lib/mappers/taskDetailMapper';
import { getProjectById } from '@/services/projectService';
import { getTaskById } from '@/services/taskService';

import styles from './page.module.css';

function getCurrentUserInitials(fullName) {
	if (typeof fullName !== 'string' || fullName.trim() === '') {
		return '??';
	}

	return fullName
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('');
}

export default async function TaskDetailPage({ params }) {
	const user = await requireUser();
	const { projectId, taskId } = await params;

	const cookieStore = await cookies();
	const token = cookieStore.get(TOKEN_COOKIE)?.value;

	let project = null;
	let task = null;
	let projectErrorMessage = '';
	let taskErrorMessage = '';

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
				const taskResponse = await getTaskById(
					token,
					projectId,
					taskId,
				);
				const rawTask = extractTask(taskResponse);
				task = mapTaskDetail(rawTask, project.ownerId);
			} catch (error) {
				taskErrorMessage =
					error instanceof Error
						? error.message
						: 'Impossible de charger la tâche.';
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

	if (taskErrorMessage !== '') {
		return (
			<section className={styles.page}>
				<div className={styles.header}>
					<Link
						href="/dashboard"
						className={styles.backButton}
						aria-label="Retour au tableau de bord"
					>
						<Image
							src={arrowLeftIcon}
							alt=""
							aria-hidden="true"
							className={styles.backIcon}
						/>
					</Link>
				</div>

				<p className={styles.feedbackMessage}>
					Tâche : {taskErrorMessage}
				</p>
			</section>
		);
	}

	if (!task) {
		return (
			<section className={styles.page}>
				<p className={styles.feedbackMessage}>Tâche introuvable.</p>
			</section>
		);
	}

	const currentUserInitials = getCurrentUserInitials(user?.name);
	const currentUserAvatarVariant =
		user?.id === project.ownerId ? 'owner' : 'member';

	return (
		<section className={styles.page}>
			<div className={styles.header}>
				<Link
					href="/dashboard"
					className={styles.backButton}
					aria-label="Retour au tableau de bord"
				>
					<Image
						src={arrowLeftIcon}
						alt=""
						aria-hidden="true"
						className={styles.backIcon}
					/>
				</Link>

				<div className={styles.headingBlock}>
					<h1 className={styles.title}>Détail de la tâche</h1>
					<p className={styles.subtitle}>
						{task.projectName} - {task.title}
					</p>
				</div>
			</div>

			<div className={styles.cardWrapper}>
				<TaskCommentsCardClient
					task={task}
					currentUserId={user?.id ?? ''}
					currentUserName={user?.name ?? ''}
					currentUserInitials={currentUserInitials}
					currentUserAvatarVariant={currentUserAvatarVariant}
					showMoreButton={false}
				/>
			</div>
		</section>
	);
}
