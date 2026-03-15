// src/components/projects/ProjectTaskCreateAction/ProjectTaskCreateAction.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import TaskFormModal from '@/components/tasks/TaskFormModal/TaskFormModal';
import { createTaskClient } from '@/services/taskClientService';
import { searchUsersClient } from '@/services/userClientService';

function deduplicateUsers(users) {
	const seen = new Set();

	return users.filter((user) => {
		if (!user?.id || seen.has(user.id)) {
			return false;
		}

		seen.add(user.id);
		return true;
	});
}

export default function ProjectTaskCreateAction({
	projectId,
	isOpen,
	onClose,
}) {
	const router = useRouter();

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
			setErrorMessage('');
			setContributorsSearch('');
			setContributorOptions([]);
			setSelectedContributors([]);
			setContributorsLoading(false);
			setContributorsErrorMessage('');
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

	function handleAddContributor(user) {
		setSelectedContributors((prev) => deduplicateUsers([...prev, user]));
		setContributorsSearch('');
		setContributorOptions([]);
		setContributorsErrorMessage('');
	}

	function handleRemoveContributor(userId) {
		setSelectedContributors((prev) =>
			prev.filter((user) => user.id !== userId),
		);
	}

	function handleClose() {
		if (isSubmitting) {
			return;
		}

		setErrorMessage('');
		setContributorsSearch('');
		setContributorOptions([]);
		setSelectedContributors([]);
		setContributorsLoading(false);
		setContributorsErrorMessage('');
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
				assigneeIds: values.assigneeIds,
			});

			handleClose();
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
