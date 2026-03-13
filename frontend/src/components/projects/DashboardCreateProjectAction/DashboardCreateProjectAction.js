// src/components/projects/DashboardCreateProjectAction/DashboardCreateProjectAction.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button/Button';
import ProjectFormModal from '@/components/projects/ProjectFormModal/ProjectFormModal';
import { createProjectClient } from '@/services/projectClientService';
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

export default function DashboardCreateProjectAction() {
	const router = useRouter();

	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const [contributorsSearch, setContributorsSearch] = useState('');
	const [contributorOptions, setContributorOptions] = useState([]);
	const [selectedContributors, setSelectedContributors] = useState([]);
	const [contributorsLoading, setContributorsLoading] = useState(false);
	const [contributorsErrorMessage, setContributorsErrorMessage] =
		useState('');

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

	function handleOpen() {
		setErrorMessage('');
		setContributorsSearch('');
		setContributorOptions([]);
		setSelectedContributors([]);
		setContributorsErrorMessage('');
		setIsOpen(true);
	}

	function handleClose() {
		if (isSubmitting) {
			return;
		}

		setErrorMessage('');
		setContributorsSearch('');
		setContributorOptions([]);
		setSelectedContributors([]);
		setContributorsErrorMessage('');
		setIsOpen(false);
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

		try {
			await createProjectClient(values);
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