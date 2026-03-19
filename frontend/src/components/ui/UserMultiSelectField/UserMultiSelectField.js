/**
 * @file src/components/ui/UserMultiSelectField/UserMultiSelectField.js
 * @description
 * Champ partagé de sélection multiple d'utilisateurs avec recherche.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import arrowDownIcon from '@/assets/icons/arrow-down-icon.png';

import styles from './UserMultiSelectField.module.css';

export default function UserMultiSelectField({
	id,
	label,
	placeholder = 'Choisir un ou plusieurs collaborateurs',
	searchPlaceholder = 'Rechercher par nom ou email',
	selectedUsers = [],
	searchValue = '',
	onSearchChange,
	options = [],
	onAddUser,
	onRemoveUser,
	loading = false,
	errorMessage = '',
}) {
	const [isOpen, setIsOpen] = useState(false);
	const boxRef = useRef(null);
	const triggerRef = useRef(null);
	const searchInputRef = useRef(null);
	const resultItemRefs = useRef([]);

	const labelId = `${id}-label`;
	const panelId = `${id}-panel`;
	const searchInputId = `${id}-search`;
	const resultsStatusId = `${id}-results-status`;

	// Referme le panneau des qu'un clic se produit hors du champ.
	useEffect(() => {
		function handleDocumentClick(event) {
			if (boxRef.current && !boxRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleDocumentClick);

		return () => {
			document.removeEventListener('mousedown', handleDocumentClick);
		};
	}, []);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		if (searchInputRef.current instanceof HTMLInputElement) {
			searchInputRef.current.focus();
		}
	}, [isOpen]);

	function focusTrigger() {
		if (triggerRef.current instanceof HTMLButtonElement) {
			triggerRef.current.focus();
		}
	}

	function focusResultAt(index) {
		const target = resultItemRefs.current[index];

		if (target instanceof HTMLButtonElement) {
			target.focus();
		}
	}

	function closePanel({ returnFocus = false } = {}) {
		setIsOpen(false);

		if (returnFocus) {
			requestAnimationFrame(() => {
				focusTrigger();
			});
		}
	}

	// Ajoute l'utilisateur puis replie la liste pour garder un flux simple.
	function handleSelectUser(user) {
		onAddUser(user);
		closePanel({ returnFocus: true });
	}

	function handleTriggerKeyDown(event) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();

			if (!isOpen) {
				setIsOpen(true);
				return;
			}

			if (hasSearchResults) {
				focusResultAt(0);
			}
		}

		if (event.key === 'Escape' && isOpen) {
			event.preventDefault();
			closePanel();
		}
	}

	function handleSearchInputKeyDown(event) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closePanel({ returnFocus: true });
			return;
		}

		if (event.key === 'ArrowDown' && hasSearchResults) {
			event.preventDefault();
			focusResultAt(0);
		}
	}

	function handleResultItemKeyDown(event, index) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closePanel({ returnFocus: true });
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			focusResultAt((index + 1) % options.length);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();

			if (index === 0) {
				if (searchInputRef.current instanceof HTMLInputElement) {
					searchInputRef.current.focus();
				}

				return;
			}

			focusResultAt(index - 1);
		}
	}

	const hasSearchResults = options.length > 0;
	// N'affiche les resultats qu'a partir d'une recherche exploitable ou d'un etat a signaler.
	const showResults =
		isOpen &&
		(searchValue.trim().length >= 2 ||
			loading ||
			errorMessage !== '' ||
			hasSearchResults);

	return (
		<div className={styles.field}>
			<label id={labelId} htmlFor={id} className={styles.label}>
				{label}
			</label>

			<div className={styles.box} ref={boxRef}>
				<button
					ref={triggerRef}
					id={id}
					type="button"
					className={styles.selectLike}
					onClick={() => setIsOpen((prev) => !prev)}
					onKeyDown={handleTriggerKeyDown}
					aria-expanded={isOpen}
					aria-controls={panelId}
					aria-labelledby={label ? `${labelId} ${id}` : undefined}
				>
					<span className={styles.selectPlaceholder}>
						{placeholder}
					</span>

					<Image
						src={arrowDownIcon}
						alt=""
						aria-hidden="true"
						className={styles.selectIcon}
					/>
				</button>

				{selectedUsers.length > 0 ? (
					<div className={styles.selectedUsers} role="list">
						{selectedUsers.map((user) => (
							<div
								key={user.id}
								className={styles.selectedUser}
								role="listitem"
							>
								<span className={styles.selectedUserText}>
									{user.name || user.email}
								</span>

								<button
									type="button"
									onClick={() => onRemoveUser(user.id)}
									className={styles.removeUserButton}
									aria-label={`Retirer ${user.name || user.email}`}
								>
									×
								</button>
							</div>
						))}
					</div>
				) : null}

				{isOpen ? (
					<div id={panelId} className={styles.searchPanel}>
						<input
							ref={searchInputRef}
							id={searchInputId}
							type="text"
							value={searchValue}
							onChange={(event) =>
								onSearchChange(event.target.value)
							}
							onKeyDown={handleSearchInputKeyDown}
							className={styles.searchInput}
							placeholder={searchPlaceholder}
							autoComplete="off"
							aria-label={
								label
									? `Rechercher dans ${label.toLowerCase()}`
									: searchPlaceholder
							}
							aria-describedby={resultsStatusId}
						/>

						{showResults ? (
							<div className={styles.resultsList}>
								{loading ? (
									<p
										id={resultsStatusId}
										className={styles.resultsMessage}
										role="status"
										aria-live="polite"
									>
										Chargement...
									</p>
								) : errorMessage ? (
									<p
										id={resultsStatusId}
										className={styles.resultsErrorMessage}
										role="alert"
									>
										{errorMessage}
									</p>
								) : hasSearchResults ? (
									options.map((user, index) => (
										<button
											key={user.id}
											type="button"
											ref={(element) => {
												resultItemRefs.current[index] =
													element;
											}}
											className={styles.resultItem}
											onClick={() =>
												handleSelectUser(user)
											}
											onKeyDown={(event) =>
												handleResultItemKeyDown(
													event,
													index,
												)
											}
											aria-label={`Ajouter ${
												user.name || 'Utilisateur'
											} (${user.email})`}
										>
											<span className={styles.resultName}>
												{user.name || 'Utilisateur'}
											</span>
											<span
												className={styles.resultEmail}
											>
												{user.email}
											</span>
										</button>
									))
								) : searchValue.trim().length >= 2 ? (
									<p
										id={resultsStatusId}
										className={styles.resultsMessage}
										role="status"
										aria-live="polite"
									>
										Aucun résultat.
									</p>
								) : null}
							</div>
						) : null}
					</div>
				) : null}
			</div>
		</div>
	);
}
