/**
 * @file src/components/projects/ProjectTaskEditAction/ProjectTaskEditAction.js
 * @description
 * Action client d'ouverture, de mise à jour et de suppression d'une tâche projet.
 */

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import TaskEditModal from '@/components/tasks/TaskEditModal/TaskEditModal';
import {
	updateTaskClient,
	deleteTaskClient,
} from '@/services/taskClientService';
import useContributorSelection from '@/hooks/useContributorSelection';

export default function ProjectTaskEditAction({
	projectId,
	task = null,
	isOpen,
	onClose,
}) {
	const router = useRouter();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const initialContributors = useMemo(() => {
		const assignees = Array.isArray(task?.assignees) ? task.assignees : [];

		return assignees.map((assignee) => ({
			id:
				typeof assignee?.userId === 'string'
					? assignee.userId
					: assignee?.id,
			name: assignee?.name ?? '',
			email: assignee?.email ?? '',
		}));
	}, [task]);

	const {
		contributorsSearch,
		setContributorsSearch,
		contributorOptions,
		selectedContributors,
		contributorsLoading,
		contributorsErrorMessage,
		handleAddContributor,
		handleRemoveContributor,
	} = useContributorSelection({
		isOpen,
		initialSelectedItems: initialContributors,
	});

	function handleClose() {
		if (isSubmitting || isDeleting) {
			return;
		}

		onClose();
	}

	async function handleSubmit(values) {
		if (!task?.id) {
			return;
		}

		setIsSubmitting(true);
		setErrorMessage('');

		try {
			await updateTaskClient({
				projectId,
				taskId: task.id,
				title: values.title,
				description: values.description,
				dueDate: values.dueDate,
				status: values.status,
				priority: values.priority,
				assigneeIds: values.assigneeIds,
			});

			onClose();
			router.refresh();
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Impossible de modifier la tâche.',
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleDelete() {
		if (!task?.id) {
			return;
		}

		const confirmed = window.confirm(
			'Confirmer la suppression de cette tâche ?',
		);

		if (!confirmed) {
			return;
		}

		setIsDeleting(true);
		setErrorMessage('');

		try {
			await deleteTaskClient(projectId, task.id);
			onClose();
			router.refresh();
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Impossible de supprimer la tâche.',
			);
		} finally {
			setIsDeleting(false);
		}
	}

	if (!isOpen || !task) {
		return null;
	}

	return (
		<TaskEditModal
			isOpen={isOpen}
			onClose={handleClose}
			onSubmit={handleSubmit}
			onDelete={handleDelete}
			task={task}
			isSubmitting={isSubmitting}
			isDeleting={isDeleting}
			errorMessage={errorMessage}
			contributorOptions={contributorOptions}
			contributorsSearch={contributorsSearch}
			onContributorsSearchChange={setContributorsSearch}
			selectedContributors={selectedContributors}
			onAddContributor={handleAddContributor}
			onRemoveContributor={handleRemoveContributor}
			contributorsLoading={contributorsLoading}
			contributorsErrorMessage={contributorsErrorMessage}
		/>
	);
}
