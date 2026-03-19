/**
 * @file src/components/projects/ProjectEditAction/ProjectEditAction.js
 * @description
 * Action client d'ouverture, de mise à jour et de suppression d'un projet.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import ProjectFormModal from '@/components/projects/ProjectFormModal/ProjectFormModal';
import {
	updateProjectClient,
	deleteProjectClient,
} from '@/services/projectClientService';
import useContributorSelection from '@/hooks/useContributorSelection';

export default function ProjectEditAction({
	projectId,
	initialTitle,
	initialDescription,
	initialContributors = [],
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Permet d'ouvrir directement la modale via l'URL.
	const editModeActive = searchParams.get('edit') === '1';

	const [isOpen, setIsOpen] = useState(editModeActive);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

	const {
		contributorsSearch,
		setContributorsSearch,
		contributorOptions,
		selectedContributors,
		setSelectedContributors,
		contributorsLoading,
		contributorsErrorMessage,
		resetContributorState,
		handleAddContributor,
		handleRemoveContributor,
	} = useContributorSelection({
		isOpen,
		initialSelectedItems: initialContributors,
	});

	// Resynchronise l'etat local si l'URL ou les valeurs initiales changent.
	useEffect(() => {
		setIsOpen(editModeActive);

		if (editModeActive) {
			setSelectedContributors(initialContributors);
			resetContributorState({ preserveSelected: true });
			setErrorMessage('');
			setDeleteErrorMessage('');
		}
	}, [
		editModeActive,
		initialContributors,
		resetContributorState,
		setSelectedContributors,
	]);

	const modalInitialValues = useMemo(
		() => ({
			title: initialTitle,
			description: initialDescription,
		}),
		[initialTitle, initialDescription],
	);

	// Ferme sans perdre l'etat initial tant qu'aucune sauvegarde n'est validee.
	function closeModal() {
		if (isSubmitting || isDeleting) {
			return;
		}

		setErrorMessage('');
		setDeleteErrorMessage('');
		setSelectedContributors(initialContributors);
		resetContributorState({ preserveSelected: true });
		setIsOpen(false);

		if (editModeActive) {
			router.replace(pathname);
		}
	}

	// Transmet aussi la liste initiale pour gerer les retraits cote API.
	async function handleSubmit(values) {
		setIsSubmitting(true);
		setErrorMessage('');
		setDeleteErrorMessage('');

		try {
			await updateProjectClient({
				projectId,
				title: values.title,
				description: values.description,
				contributors: selectedContributors,
				initialContributorIds: initialContributors.map(
					(contributor) => contributor.id,
				),
			});

			closeModal();
			router.refresh();
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Impossible de modifier le projet.',
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	// Demande une confirmation avant l'appel de suppression.
	async function handleDelete() {
		const confirmed = window.confirm(
			'Confirmer la suppression de ce projet ?',
		);

		if (!confirmed) {
			return;
		}

		setIsDeleting(true);
		setDeleteErrorMessage('');
		setErrorMessage('');

		try {
			await deleteProjectClient(projectId);
			router.push('/projects');
			router.refresh();
		} catch (error) {
			setDeleteErrorMessage(
				error instanceof Error
					? error.message
					: 'Impossible de supprimer le projet.',
			);
		} finally {
			setIsDeleting(false);
		}
	}

	if (!isOpen) {
		return null;
	}

	return (
		<ProjectFormModal
			isOpen={isOpen}
			onClose={closeModal}
			onSubmit={handleSubmit}
			mode="edit"
			initialValues={modalInitialValues}
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
			onDelete={handleDelete}
			isDeleting={isDeleting}
			deleteErrorMessage={deleteErrorMessage}
		/>
	);
}
