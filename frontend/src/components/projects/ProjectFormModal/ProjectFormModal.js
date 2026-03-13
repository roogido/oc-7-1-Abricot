// src/components/projects/ProjectFormModal/ProjectFormModal.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import Button from '@/components/ui/Button/Button';
import ModalShell from '@/components/ui/ModalShell/ModalShell';

import arrowDownIcon from '@/assets/icons/arrow-down-icon.png';

import styles from './ProjectFormModal.module.css';

function getInitialFormState(initialValues) {
	return {
		title:
			typeof initialValues?.title === 'string' ? initialValues.title : '',
		description:
			typeof initialValues?.description === 'string'
				? initialValues.description
				: '',
	};
}

export default function ProjectFormModal({
	isOpen,
	onClose,
	onSubmit,
	mode = 'create',
	initialValues = null,
	isSubmitting = false,
	errorMessage = '',
	contributorOptions = [],
	contributorsSearch = '',
	onContributorsSearchChange,
	selectedContributors = [],
	onAddContributor,
	onRemoveContributor,
	contributorsLoading = false,
	contributorsErrorMessage = '',
}) {
	const [formValues, setFormValues] = useState(() =>
		getInitialFormState(initialValues),
	);
	const [isContributorsOpen, setIsContributorsOpen] = useState(false);

	const contributorsBoxRef = useRef(null);

	useEffect(() => {
		function handleDocumentClick(event) {
			if (
				contributorsBoxRef.current &&
				!contributorsBoxRef.current.contains(event.target)
			) {
				setIsContributorsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleDocumentClick);

		return () => {
			document.removeEventListener('mousedown', handleDocumentClick);
		};
	}, []);

	const titleValue = formValues.title.trim();
	const descriptionValue = formValues.description.trim();

	const isSubmitDisabled =
		titleValue === '' || descriptionValue === '' || isSubmitting;

	const modalTitle =
		mode === 'edit' ? 'Modifier un projet' : 'Créer un projet';

	const submitLabel = useMemo(() => {
		if (isSubmitting) {
			return mode === 'edit' ? 'Enregistrement...' : 'Ajout...';
		}

		return mode === 'edit' ? 'Enregistrer' : 'Ajouter un projet';
	}, [isSubmitting, mode]);

	function handleChange(event) {
		const { name, value } = event.target;

		setFormValues((prev) => ({
			...prev,
			[name]: value,
		}));
	}

	async function handleSubmit(event) {
		event.preventDefault();

		if (isSubmitDisabled) {
			return;
		}

		await onSubmit({
			title: titleValue,
			description: descriptionValue,
			contributors: selectedContributors.map(
				(contributor) => contributor.email,
			),
		});
	}

	function handleContributorSelect(user) {
		onAddContributor(user);
		setIsContributorsOpen(false);
	}

	const hasSearchResults = contributorOptions.length > 0;
	const showResults =
		isContributorsOpen &&
		(contributorsSearch.trim().length >= 2 ||
			contributorsLoading ||
			contributorsErrorMessage !== '' ||
			hasSearchResults);

	return (
		<ModalShell isOpen={isOpen} onClose={onClose} ariaLabel={modalTitle}>
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.fieldsBlock}>
					<h2 className={styles.title}>{modalTitle}</h2>

					<div className={styles.fields}>
						<div className={styles.field}>
							<label
								htmlFor="project-title"
								className={styles.label}
							>
								Titre*
							</label>
							<input
								id="project-title"
								name="title"
								type="text"
								value={formValues.title}
								onChange={handleChange}
								className={styles.input}
								autoComplete="off"
							/>
						</div>

						<div className={styles.field}>
							<label
								htmlFor="project-description"
								className={styles.label}
							>
								Description*
							</label>
							<textarea
								id="project-description"
								name="description"
								value={formValues.description}
								onChange={handleChange}
								className={styles.input}
								rows="1"
							/>
						</div>

						<div className={styles.field}>
							<label
								htmlFor="project-contributors"
								className={styles.label}
							>
								Contributeurs
							</label>

							<div
								className={styles.contributorsBox}
								ref={contributorsBoxRef}
							>
								<button
									id="project-contributors"
									type="button"
									className={styles.selectLike}
									onClick={() =>
										setIsContributorsOpen((prev) => !prev)
									}
									aria-expanded={isContributorsOpen}
									aria-controls="contributors-panel"
								>
									<span className={styles.selectPlaceholder}>
										Choisir un ou plusieurs collaborateurs
									</span>

									<Image
										src={arrowDownIcon}
										alt=""
										aria-hidden="true"
										className={styles.selectIcon}
									/>
								</button>

								{selectedContributors.length > 0 ? (
									<div
										className={styles.selectedContributors}
									>
										{selectedContributors.map(
											(contributor) => (
												<div
													key={contributor.id}
													className={
														styles.selectedContributor
													}
												>
													<span
														className={
															styles.selectedContributorText
														}
													>
														{contributor.name ||
															contributor.email}
													</span>

													<button
														type="button"
														onClick={() =>
															onRemoveContributor(
																contributor.id,
															)
														}
														className={
															styles.removeContributorButton
														}
														aria-label={`Retirer ${contributor.name || contributor.email}`}
													>
														×
													</button>
												</div>
											),
										)}
									</div>
								) : null}

								{isContributorsOpen ? (
									<div
										id="contributors-panel"
										className={styles.searchPanel}
									>
										<input
											type="text"
											value={contributorsSearch}
											onChange={(event) =>
												onContributorsSearchChange(
													event.target.value,
												)
											}
											className={styles.searchInput}
											placeholder="Rechercher par nom ou email"
											autoComplete="off"
										/>

										{showResults ? (
											<div className={styles.resultsList}>
												{contributorsLoading ? (
													<p
														className={
															styles.resultsMessage
														}
													>
														Chargement...
													</p>
												) : contributorsErrorMessage ? (
													<p
														className={
															styles.resultsErrorMessage
														}
													>
														{
															contributorsErrorMessage
														}
													</p>
												) : hasSearchResults ? (
													contributorOptions.map(
														(user) => (
															<button
																key={user.id}
																type="button"
																className={
																	styles.resultItem
																}
																onClick={() =>
																	handleContributorSelect(
																		user,
																	)
																}
															>
																<span
																	className={
																		styles.resultName
																	}
																>
																	{user.name ||
																		'Utilisateur'}
																</span>
																<span
																	className={
																		styles.resultEmail
																	}
																>
																	{user.email}
																</span>
															</button>
														),
													)
												) : contributorsSearch.trim()
														.length >= 2 ? (
													<p
														className={
															styles.resultsMessage
														}
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
					</div>

					{errorMessage ? (
						<p className={styles.errorMessage}>{errorMessage}</p>
					) : null}
				</div>

				<div className={styles.actions}>
					<Button type="submit" disabled={isSubmitDisabled}>
						{submitLabel}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
}
