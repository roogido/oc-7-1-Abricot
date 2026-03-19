/**
 * @file src/app/(protected)/projects/[projectId]/ProjectDetailClientActions.js
 * @description
 * Actions clientes de la page détail projet : création classique et génération IA.
 */

'use client';

import { useState } from 'react';

import ProjectHeader from '@/components/projects/ProjectHeader/ProjectHeader';
import ProjectTaskCreateAction from '@/components/projects/ProjectTaskCreateAction/ProjectTaskCreateAction';
import ProjectAiTaskGenerationAction from '@/components/projects/ProjectAiTaskGenerationAction/ProjectAiTaskGenerationAction';

// Gère les actions interactives disponibles sur la page détail d'un projet.
export default function ProjectDetailClientActions({
	projectId,
	projectName,
	description,
	canEditProject,
	canCreateTask,
	children,
}) {
	const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
	const [isAiTaskOpen, setIsAiTaskOpen] = useState(false);

	// Ouvre la modale de création classique si l'utilisateur y a droit.
	function handleOpenCreateTask() {
		if (!canCreateTask) {
			return;
		}

		setIsCreateTaskOpen(true);
	}

	// Ferme la modale de création classique.
	function handleCloseCreateTask() {
		setIsCreateTaskOpen(false);
	}

	// Ouvre la modale de génération IA si l'utilisateur y a droit.
	function handleOpenAiTask() {
		if (!canCreateTask) {
			return;
		}

		setIsAiTaskOpen(true);
	}

	// Ferme la modale de génération IA.
	function handleCloseAiTask() {
		setIsAiTaskOpen(false);
	}

	return (
		<>
			{/* Affiche l'en-tête du projet et branche les actions disponibles. */}
			<ProjectHeader
				projectName={projectName}
				description={description}
				editHref={
					canEditProject ? `/projects/${projectId}?edit=1` : undefined
				}
				canEditProject={canEditProject}
				backHref="/projects"
				onCreateTask={handleOpenCreateTask}
				onAI={handleOpenAiTask}
			/>

			{/* Monte la modale de création manuelle seulement si l'action est autorisée. */}
			{canCreateTask ? (
				<ProjectTaskCreateAction
					projectId={projectId}
					isOpen={isCreateTaskOpen}
					onClose={handleCloseCreateTask}
				/>
			) : null}

			{/* Monte la modale de génération IA seulement si l'action est autorisée. */}
			{canCreateTask ? (
				<ProjectAiTaskGenerationAction
					projectId={projectId}
					projectName={projectName}
					projectDescription={description}
					isOpen={isAiTaskOpen}
					onClose={handleCloseAiTask}
				/>
			) : null}

			{children}
		</>
	);
}
