/**
 * @file src/components/tasks/TaskFormModal/TaskFormModal.js
 * @description
 * Modale de création d'une tâche projet.
 */

'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import Button from '@/components/ui/Button/Button';
import ModalShell from '@/components/ui/ModalShell/ModalShell';
import Tag from '@/components/ui/Tag/Tag';
import UserMultiSelectField from '@/components/ui/UserMultiSelectField/UserMultiSelectField';

import calendarTaskIcon from '@/assets/icons/calendar-task-icon.png';
import arrowDownIcon from '@/assets/icons/arrow-down-icon.png';

import styles from './TaskFormModal.module.css';

const STATUS_OPTIONS = [
	{ value: 'TODO', label: 'À faire', variant: 'red' },
	{ value: 'IN_PROGRESS', label: 'En cours', variant: 'orange' },
	{ value: 'DONE', label: 'Terminée', variant: 'green' },
];

const PRIORITY_OPTIONS = [
	{ value: 'LOW', label: 'Faible' },
	{ value: 'MEDIUM', label: 'Moyenne' },
	{ value: 'HIGH', label: 'Haute' },
];

function getInitialFormState() {
	return {
		title: '',
		description: '',
		dueDate: '',
		status: 'TODO',
		priority: 'LOW',
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
	const [isPriorityOpen, setIsPriorityOpen] = useState(false);

	const priorityBoxRef = useRef(null);
	const dateInputRef = useRef(null);

	const titleValue = formValues.title.trim();
	const descriptionValue = formValues.description.trim();
	const dueDateValue = formValues.dueDate.trim();
	const priorityValue = formValues.priority.trim();

	const isSubmitDisabled =
		titleValue === '' ||
		descriptionValue === '' ||
		dueDateValue === '' ||
		priorityValue === '' ||
		isSubmitting;

	const submitLabel = useMemo(() => {
		return isSubmitting ? 'Ajout...' : '+ Ajouter une tâche';
	}, [isSubmitting]);

	const currentPriorityLabel =
		PRIORITY_OPTIONS.find((option) => option.value === formValues.priority)
			?.label ?? 'Faible';

	function handleChange(event) {
		const { name, value } = event.target;

		setFormValues((prev) => ({
			...prev,
			[name]: value,
		}));
	}

	function handleOpenDatePicker() {
		if (!dateInputRef.current) {
			return;
		}

		if (typeof dateInputRef.current.showPicker === 'function') {
			dateInputRef.current.showPicker();
			return;
		}

		dateInputRef.current.focus();
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
			priority: formValues.priority,
			assigneeIds: selectedContributors.map(
				(contributor) => contributor.id,
			),
		});
	}

	function handlePrioritySelect(priority) {
		setFormValues((prev) => ({
			...prev,
			priority,
		}));
		setIsPriorityOpen(false);
	}

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
								<input
									ref={dateInputRef}
									id="task-due-date"
									name="dueDate"
									type="date"
									value={formValues.dueDate}
									onChange={handleChange}
									className={styles.dateInput}
								/>

								<button
									type="button"
									className={styles.dateIconButton}
									onClick={handleOpenDatePicker}
									aria-label="Choisir une échéance"
								>
									<Image
										src={calendarTaskIcon}
										alt=""
										aria-hidden="true"
										className={styles.dateIcon}
									/>
								</button>
							</div>
						</div>

						<div className={styles.field}>
							<label className={styles.label}>Statut :</label>

							<div
								className={styles.statusChips}
								aria-label="Statut initial de la tâche"
							>
								{STATUS_OPTIONS.map((option) => {
									const isActive =
										formValues.status === option.value;

									return (
										<button
											key={option.value}
											type="button"
											className={styles.statusChipButton}
											disabled={!isActive}
											aria-pressed={isActive}
											title={
												isActive
													? 'Le statut initial est À faire.'
													: 'Le statut n’est pas modifiable à la création.'
											}
										>
											<Tag
												variant={option.variant}
												active={isActive}
											>
												{option.label}
											</Tag>
										</button>
									);
								})}
							</div>
						</div>

						<div className={styles.field}>
							<label
								htmlFor="task-priority"
								className={styles.label}
							>
								Priorité*
							</label>

							<div
								ref={priorityBoxRef}
								className={styles.priorityBox}
							>
								<button
									id="task-priority"
									type="button"
									className={styles.selectLike}
									onClick={() =>
										setIsPriorityOpen((prev) => !prev)
									}
									aria-expanded={isPriorityOpen}
									aria-controls="task-priority-panel"
								>
									<span className={styles.selectPlaceholder}>
										{currentPriorityLabel}
									</span>

									<Image
										src={arrowDownIcon}
										alt=""
										aria-hidden="true"
										className={styles.selectIcon}
									/>
								</button>

								{isPriorityOpen ? (
									<div
										id="task-priority-panel"
										className={styles.priorityPanel}
									>
										{PRIORITY_OPTIONS.map((option) => (
											<button
												key={option.value}
												type="button"
												className={styles.priorityItem}
												onClick={() =>
													handlePrioritySelect(
														option.value,
													)
												}
											>
												{option.label}
											</button>
										))}
									</div>
								) : null}
							</div>
						</div>

						<UserMultiSelectField
							id="task-contributors"
							label="Assigné à :"
							selectedUsers={selectedContributors}
							searchValue={contributorsSearch}
							onSearchChange={onContributorsSearchChange}
							options={contributorOptions}
							onAddUser={onAddContributor}
							onRemoveUser={onRemoveContributor}
							loading={contributorsLoading}
							errorMessage={contributorsErrorMessage}
						/>
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
