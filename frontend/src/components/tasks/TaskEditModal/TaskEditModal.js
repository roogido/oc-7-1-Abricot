// src/components/tasks/TaskEditModal/TaskEditModal.js
/**
 * @file src/components/tasks/TaskEditModal/TaskEditModal.js
 * @description
 * Modale d'édition et de suppression d'une tâche projet.
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

import styles from './TaskEditModal.module.css';

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

function getInitialFormState(task) {
	return {
		title: typeof task?.title === 'string' ? task.title : '',
		description:
			typeof task?.description === 'string' ? task.description : '',
		dueDate:
			typeof task?.dueDateRaw === 'string' && task.dueDateRaw !== ''
				? task.dueDateRaw.slice(0, 10)
				: '',
		status:
			typeof task?.status === 'string' && task.status !== ''
				? task.status
				: 'TODO',
		priority:
			typeof task?.priority === 'string' && task.priority !== ''
				? task.priority
				: 'LOW',
	};
}

export default function TaskEditModal({
	isOpen,
	onClose,
	onSubmit,
	onDelete,
	task = null,
	isSubmitting = false,
	isDeleting = false,
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
		getInitialFormState(task),
	);
	const [isPriorityOpen, setIsPriorityOpen] = useState(false);

	const priorityBoxRef = useRef(null);
	const dateInputRef = useRef(null);

	const titleValue = formValues.title.trim();
	const descriptionValue = formValues.description.trim();
	const dueDateValue = formValues.dueDate.trim();
	const priorityValue = formValues.priority.trim();
	const statusValue = formValues.status.trim();

	const isSubmitDisabled =
		titleValue === '' ||
		descriptionValue === '' ||
		dueDateValue === '' ||
		priorityValue === '' ||
		statusValue === '' ||
		isSubmitting ||
		isDeleting;

	const submitLabel = useMemo(() => {
		return isSubmitting ? 'Enregistrement...' : 'Enregistrer';
	}, [isSubmitting]);

	const deleteLabel = useMemo(() => {
		return isDeleting ? 'Suppression...' : 'Supprimer';
	}, [isDeleting]);

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

	function handleStatusSelect(status) {
		setFormValues((prev) => ({
			...prev,
			status,
		}));
	}

	function handlePrioritySelect(priority) {
		setFormValues((prev) => ({
			...prev,
			priority,
		}));
		setIsPriorityOpen(false);
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

		if (isSubmitDisabled || typeof onSubmit !== 'function') {
			return;
		}

		await onSubmit({
			title: titleValue,
			description: descriptionValue,
			dueDate: dueDateValue,
			status: formValues.status,
			priority: formValues.priority,
			assigneeIds: selectedContributors.map(
				(contributor) => contributor.id,
			),
		});
	}

	return (
		<ModalShell
			isOpen={isOpen}
			onClose={onClose}
			ariaLabel="Modifier une tâche"
		>
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.fieldsBlock}>
					<h2 className={styles.title}>Modifier une tâche</h2>

					<div className={styles.fields}>
						<div className={styles.field}>
							<label
								htmlFor="task-edit-title"
								className={styles.label}
							>
								Titre*
							</label>
							<input
								id="task-edit-title"
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
								htmlFor="task-edit-description"
								className={styles.label}
							>
								Description*
							</label>
							<textarea
								id="task-edit-description"
								name="description"
								value={formValues.description}
								onChange={handleChange}
								className={styles.textarea}
								rows="4"
							/>
						</div>

						<div className={styles.field}>
							<label
								htmlFor="task-edit-due-date"
								className={styles.label}
							>
								Échéance*
							</label>

							<div className={styles.dateInputWrapper}>
								<input
									ref={dateInputRef}
									id="task-edit-due-date"
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
								aria-label="Sélection du statut"
								role="radiogroup"
							>
								{STATUS_OPTIONS.map((option) => {
									const isActive =
										formValues.status === option.value;

									return (
										<button
											key={option.value}
											type="button"
											className={styles.statusChipButton}
											onClick={() =>
												handleStatusSelect(option.value)
											}
											role="radio"
											aria-checked={isActive}
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
								htmlFor="task-edit-priority"
								className={styles.label}
							>
								Priorité*
							</label>

							<div
								ref={priorityBoxRef}
								className={styles.priorityBox}
							>
								<button
									id="task-edit-priority"
									type="button"
									className={styles.selectLike}
									onClick={() =>
										setIsPriorityOpen((prev) => !prev)
									}
									aria-expanded={isPriorityOpen}
									aria-controls="task-edit-priority-panel"
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
										id="task-edit-priority-panel"
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
							id="task-edit-contributors"
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
					<button
						type="button"
						className={styles.deleteButton}
						onClick={onDelete}
						disabled={isSubmitting || isDeleting}
					>
						{deleteLabel}
					</button>

					<Button type="submit" disabled={isSubmitDisabled}>
						{submitLabel}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
}
