// src/components/projects/ProjectTaskEditAction/ProjectTaskEditAction.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import TaskEditModal from '@/components/tasks/TaskEditModal/TaskEditModal';
import {
	updateTaskClient,
	deleteTaskClient,
} from '@/services/taskClientService';
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

	const [contributorsSearch, setContributorsSearch] = useState('');
	const [contributorOptions, setContributorOptions] = useState([]);
	const [selectedContributors, setSelectedContributors] = useState([]);
	const [contributorsLoading, setContributorsLoading] = useState(false);
	const [contributorsErrorMessage, setContributorsErrorMessage] =
		useState('');

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

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		setErrorMessage('');
		setContributorsSearch('');
		setContributorOptions([]);
		setContributorsLoading(false);
		setContributorsErrorMessage('');
		setSelectedContributors(initialContributors);
	}, [isOpen, initialContributors]);

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
