/**
 * @file src/components/projects/ProjectTaskCreateAction/ProjectTaskCreateAction.js
 * @description
 * Action client d'ouverture et de soumission de la modale de création de tâche.
 */

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import TaskFormModal from '@/components/tasks/TaskFormModal/TaskFormModal';
import { createTaskClient } from '@/services/taskClientService';
import useContributorSelection from '@/hooks/useContributorSelection';

export default function ProjectTaskCreateAction({
	projectId,
	isOpen,
	onClose,
}) {
	const router = useRouter();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const emptyInitialContributors = useMemo(() => [], []);

	const {
		contributorsSearch,
		setContributorsSearch,
		contributorOptions,
		selectedContributors,
		contributorsLoading,
		contributorsErrorMessage,
		resetContributorState,
		handleAddContributor,
		handleRemoveContributor,
	} = useContributorSelection({
		isOpen,
		initialSelectedItems: emptyInitialContributors,
	});

	function handleClose() {
		if (isSubmitting) {
			return;
		}

		setErrorMessage('');
		resetContributorState();
		onClose();
	}

	async function handleSubmit(values) {
		setIsSubmitting(true);
		setErrorMessage('');

		try {
			await createTaskClient({
				projectId,
				title: values.title,
				description: values.description,
				dueDate: values.dueDate,
				priority: values.priority,
				assigneeIds: values.assigneeIds,
			});

			setErrorMessage('');
			resetContributorState();
			onClose();
			router.refresh();
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Impossible de créer la tâche.',
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	if (!isOpen) {
		return null;
	}

	return (
		<TaskFormModal
			isOpen={isOpen}
			onClose={handleClose}
			onSubmit={handleSubmit}
			isSubmitting={isSubmitting}
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
