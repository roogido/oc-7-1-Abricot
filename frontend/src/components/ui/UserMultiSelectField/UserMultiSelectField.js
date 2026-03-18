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

	function handleSelectUser(user) {
		onAddUser(user);
		setIsOpen(false);
	}

	const hasSearchResults = options.length > 0;
	const showResults =
		isOpen &&
		(searchValue.trim().length >= 2 ||
			loading ||
			errorMessage !== '' ||
			hasSearchResults);

	return (
		<div className={styles.field}>
			<label htmlFor={id} className={styles.label}>
				{label}
			</label>

			<div className={styles.box} ref={boxRef}>
				<button
					id={id}
					type="button"
					className={styles.selectLike}
					onClick={() => setIsOpen((prev) => !prev)}
					aria-expanded={isOpen}
					aria-controls={`${id}-panel`}
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
					<div className={styles.selectedUsers}>
						{selectedUsers.map((user) => (
							<div key={user.id} className={styles.selectedUser}>
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
					<div id={`${id}-panel`} className={styles.searchPanel}>
						<input
							type="text"
							value={searchValue}
							onChange={(event) =>
								onSearchChange(event.target.value)
							}
							className={styles.searchInput}
							placeholder={searchPlaceholder}
							autoComplete="off"
						/>

						{showResults ? (
							<div className={styles.resultsList}>
								{loading ? (
									<p className={styles.resultsMessage}>
										Chargement...
									</p>
								) : errorMessage ? (
									<p className={styles.resultsErrorMessage}>
										{errorMessage}
									</p>
								) : hasSearchResults ? (
									options.map((user) => (
										<button
											key={user.id}
											type="button"
											className={styles.resultItem}
											onClick={() =>
												handleSelectUser(user)
											}
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
									<p className={styles.resultsMessage}>
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
