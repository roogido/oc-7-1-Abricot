// src/components/projects/ProjectEditAction/ProjectEditAction.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import ProjectFormModal from '@/components/projects/ProjectFormModal/ProjectFormModal';
import {
	updateProjectClient,
	deleteProjectClient,
} from '@/services/projectClientService';
import { searchUsersClient } from '@/services/userClientService';

function deduplicateContributors(users) {
	const seen = new Set();

	return users.filter((user) => {
		if (!user?.id || seen.has(user.id)) {
			return false;
		}

		seen.add(user.id);
		return true;
	});
}

export default function ProjectEditAction({
	projectId,
	initialTitle,
	initialDescription,
	initialContributors = [],
}) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const editModeActive = searchParams.get('edit') === '1';

	const [isOpen, setIsOpen] = useState(editModeActive);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

	const [contributorsSearch, setContributorsSearch] = useState('');
	const [contributorOptions, setContributorOptions] = useState([]);
	const [selectedContributors, setSelectedContributors] =
		useState(initialContributors);
	const [contributorsLoading, setContributorsLoading] = useState(false);
	const [contributorsErrorMessage, setContributorsErrorMessage] =
		useState('');

	useEffect(() => {
		setIsOpen(editModeActive);

		if (editModeActive) {
			setSelectedContributors(initialContributors);
			setContributorsSearch('');
			setContributorOptions([]);
			setContributorsErrorMessage('');
			setErrorMessage('');
			setDeleteErrorMessage('');
		}
	}, [editModeActive, initialContributors]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const normalizedQuery = contributorsSearch.trim();

		if (normalizedQuery.length < 2) {
			setContributorOptions([]);
			setContributorsLoading(false);
			setContributorsErrorMessage('');
			return;
		}

		let isCancelled = false;

		const timeoutId = window.setTimeout(async () => {
			setContributorsLoading(true);
			setContributorsErrorMessage('');

			try {
				const users = await searchUsersClient(normalizedQuery);

				if (isCancelled) {
					return;
				}

				const selectedIds = new Set(
					selectedContributors.map((user) => user.id),
				);

				setContributorOptions(
					users.filter((user) => !selectedIds.has(user.id)),
				);
			} catch (error) {
				if (isCancelled) {
					return;
				}

				setContributorOptions([]);
				setContributorsErrorMessage(
					error instanceof Error
						? error.message
						: 'Impossible de rechercher les utilisateurs.',
				);
			} finally {
				if (!isCancelled) {
					setContributorsLoading(false);
				}
			}
		}, 250);

		return () => {
			isCancelled = true;
			window.clearTimeout(timeoutId);
		};
	}, [contributorsSearch, isOpen, selectedContributors]);

	const modalInitialValues = useMemo(
		() => ({
			title: initialTitle,
			description: initialDescription,
		}),
		[initialTitle, initialDescription],
	);

	function closeModal() {
		if (isSubmitting || isDeleting) {
			return;
		}

		setErrorMessage('');
		setDeleteErrorMessage('');
		setContributorsSearch('');
		setContributorOptions([]);
		setContributorsErrorMessage('');
		setSelectedContributors(initialContributors);
		setIsOpen(false);

		if (editModeActive) {
			router.replace(pathname);
		}
	}

	function handleAddContributor(user) {
		setSelectedContributors((prev) =>
			deduplicateContributors([...prev, user]),
		);
		setContributorsSearch('');
		setContributorOptions([]);
		setContributorsErrorMessage('');
	}

	function handleRemoveContributor(userId) {
		setSelectedContributors((prev) =>
			prev.filter((user) => user.id !== userId),
		);
	}

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
