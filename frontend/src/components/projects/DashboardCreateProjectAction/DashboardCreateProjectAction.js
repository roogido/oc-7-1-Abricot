/**
 * @file src/components/projects/DashboardCreateProjectAction/DashboardCreateProjectAction.js
 * @description
 * Action client d'ouverture et de création d'un projet depuis le dashboard.
 */

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button/Button';
import ProjectFormModal from '@/components/projects/ProjectFormModal/ProjectFormModal';
import { createProjectClient } from '@/services/projectClientService';
import useContributorSelection from '@/hooks/useContributorSelection';

export default function DashboardCreateProjectAction() {
	const router = useRouter();

	const [isOpen, setIsOpen] = useState(false);
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

	function handleOpen() {
		setErrorMessage('');
		resetContributorState();
		setIsOpen(true);
	}

	function handleClose() {
		if (isSubmitting) {
			return;
		}

		setErrorMessage('');
		resetContributorState();
		setIsOpen(false);
	}

	async function handleSubmit(values) {
		setIsSubmitting(true);
		setErrorMessage('');

		try {
			await createProjectClient(values);
			setErrorMessage('');
			resetContributorState();
			setIsOpen(false);
			router.refresh();
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Impossible de créer le projet.',
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<>
			<Button type="button" onClick={handleOpen}>
				+ Créer un projet
			</Button>

			{isOpen ? (
				<ProjectFormModal
					isOpen={isOpen}
					onClose={handleClose}
					onSubmit={handleSubmit}
					mode="create"
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
			) : null}
		</>
	);
}
