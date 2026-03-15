// src/components/tasks/TaskFormModal/TaskFormModal.js
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import Button from '@/components/ui/Button/Button';
import ModalShell from '@/components/ui/ModalShell/ModalShell';
import Tag from '@/components/ui/Tag/Tag';

import calendarTaskIcon from '@/assets/icons/calendar-task-icon.png';
import arrowDownIcon from '@/assets/icons/arrow-down-icon.png';

import styles from './TaskFormModal.module.css';

const STATUS_OPTIONS = [
	{ value: 'TODO', label: 'À faire', variant: 'red', disabled: false },
	{
		value: 'IN_PROGRESS',
		label: 'En cours',
		variant: 'orange',
		disabled: true,
	},
	{ value: 'DONE', label: 'Terminée', variant: 'green', disabled: true },
];

function getInitialFormState() {
	return {
		title: '',
		description: '',
		dueDate: '',
		status: 'TODO',
	};
}

export default function TaskFormModal({
	isOpen,
	onClose,
	onSubmit,
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
	const [formValues, setFormValues] = useState(getInitialFormState);
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
	const dueDateValue = formValues.dueDate.trim();

	const isSubmitDisabled =
		titleValue === '' ||
		descriptionValue === '' ||
		dueDateValue === '' ||
		isSubmitting;

	const submitLabel = useMemo(() => {
		return isSubmitting ? 'Ajout...' : 'Ajouter une tâche';
	}, [isSubmitting]);

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
			dueDate: dueDateValue,
			status: formValues.status,
			assigneeIds: selectedContributors.map(
				(contributor) => contributor.id,
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
		<ModalShell
			isOpen={isOpen}
			onClose={onClose}
			ariaLabel="Créer une tâche"
		>
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.fieldsBlock}>
					<h2 className={styles.title}>Créer une tâche</h2>

					<div className={styles.fields}>
						<div className={styles.field}>
							<label
								htmlFor="task-title"
								className={styles.label}
							>
								Titre*
							</label>
							<input
								id="task-title"
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
								htmlFor="task-description"
								className={styles.label}
							>
								Description*
							</label>
							<textarea
								id="task-description"
								name="description"
								value={formValues.description}
								onChange={handleChange}
								className={styles.textarea}
								rows="4"
							/>
						</div>

						<div className={styles.field}>
							<label
								htmlFor="task-due-date"
								className={styles.label}
							>
								Échéance*
							</label>

							<div className={styles.dateInputWrapper}>
								<Image
									src={calendarTaskIcon}
									alt=""
									aria-hidden="true"
									className={styles.dateIcon}
								/>

								<input
									id="task-due-date"
									name="dueDate"
									type="date"
									value={formValues.dueDate}
									onChange={handleChange}
									className={styles.dateInput}
								/>
							</div>
						</div>

						<div className={styles.field}>
							<label className={styles.label}>Statut</label>

							<div
								className={styles.statusChips}
								aria-label="Statut initial de la tâche"
							>
								{STATUS_OPTIONS.map((option) => (
									<button
										key={option.value}
										type="button"
										className={styles.statusChipButton}
										disabled={option.disabled}
										title={
											option.disabled
												? 'Le statut initial est fixé à À faire à la création.'
												: 'Statut initial'
										}
									>
										<Tag variant={option.variant}>
											{option.label}
										</Tag>
									</button>
								))}
							</div>
						</div>

						<div className={styles.field}>
							<label
								htmlFor="task-contributors"
								className={styles.label}
							>
								Assigné à
							</label>

							<div
								className={styles.contributorsBox}
								ref={contributorsBoxRef}
							>
								<button
									id="task-contributors"
									type="button"
									className={styles.selectLike}
									onClick={() =>
										setIsContributorsOpen((prev) => !prev)
									}
									aria-expanded={isContributorsOpen}
									aria-controls="task-contributors-panel"
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
										id="task-contributors-panel"
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
