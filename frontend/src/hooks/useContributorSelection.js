/**
 * @file src/hooks/useContributorSelection.js
 * @description
 * Hook partagé pour gérer la recherche et la sélection de contributeurs.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

import { searchUsersClient } from '@/services/userClientService';

/**
 * Déduplique une liste d'utilisateurs sur leur identifiant.
 *
 * @param {Object[]} users
 * @returns {Object[]}
 */
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

/**
 * Hook de gestion des contributeurs sélectionnés avec recherche distante.
 *
 * @param {Object} params
 * @param {boolean} params.isOpen
 * @param {Object[]} [params.initialSelectedItems=[]]
 * @returns {Object}
 */
export default function useContributorSelection({
	isOpen,
	initialSelectedItems = [],
}) {
	const [contributorsSearch, setContributorsSearch] = useState('');
	const [contributorOptions, setContributorOptions] = useState([]);
	const [selectedContributors, setSelectedContributors] =
		useState(initialSelectedItems);
	const [contributorsLoading, setContributorsLoading] = useState(false);
	const [contributorsErrorMessage, setContributorsErrorMessage] =
		useState('');

	const resetContributorState = useCallback(
		({ preserveSelected = false } = {}) => {
			setContributorsSearch('');
			setContributorOptions([]);
			setContributorsLoading(false);
			setContributorsErrorMessage('');

			if (!preserveSelected) {
				setSelectedContributors([]);
			}
		},
		[],
	);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		setSelectedContributors(initialSelectedItems);
		setContributorsSearch('');
		setContributorOptions([]);
		setContributorsLoading(false);
		setContributorsErrorMessage('');
	}, [initialSelectedItems, isOpen]);

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

	const handleAddContributor = useCallback((user) => {
		setSelectedContributors((prev) => deduplicateUsers([...prev, user]));
		setContributorsSearch('');
		setContributorOptions([]);
		setContributorsErrorMessage('');
	}, []);

	const handleRemoveContributor = useCallback((userId) => {
		setSelectedContributors((prev) =>
			prev.filter((user) => user.id !== userId),
		);
	}, []);

	return {
		contributorsSearch,
		setContributorsSearch,
		contributorOptions,
		selectedContributors,
		contributorsLoading,
		contributorsErrorMessage,
		setSelectedContributors,
		resetContributorState,
		handleAddContributor,
		handleRemoveContributor,
	};
}
