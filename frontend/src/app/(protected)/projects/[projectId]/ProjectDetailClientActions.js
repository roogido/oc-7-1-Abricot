// src/app/(protected)/projects/[projectId]/ProjectDetailClientActions.js
'use client';

import { useState } from 'react';

import ProjectHeader from '@/components/projects/ProjectHeader/ProjectHeader';
import ProjectTaskCreateAction from '@/components/projects/ProjectTaskCreateAction/ProjectTaskCreateAction';

export default function ProjectDetailClientActions({
	projectId,
	projectName,
	description,
	canEditProject,
	canCreateTask,
	children,
}) {
	const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

	function handleOpenCreateTask() {
		if (!canCreateTask) {
			return;
		}

		setIsCreateTaskOpen(true);
	}

	function handleCloseCreateTask() {
		setIsCreateTaskOpen(false);
	}

	return (
		<>
			<ProjectHeader
				projectName={projectName}
				description={description}
				editHref={
					canEditProject ? `/projects/${projectId}?edit=1` : undefined
				}
				canEditProject={canEditProject}
				backHref="/projects"
				onCreateTask={handleOpenCreateTask}
			/>

			{canCreateTask ? (
				<ProjectTaskCreateAction
					projectId={projectId}
					isOpen={isCreateTaskOpen}
					onClose={handleCloseCreateTask}
				/>
			) : null}

			{children}
		</>
	);
}
