/**
 * @file src/components/tasks/TaskEditModal/TaskEditModal.js
 * @description
 * Modale d'édition et de suppression d'une tâche projet.
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Button from '@/components/ui/Button/Button';
import ModalShell from '@/components/ui/ModalShell/ModalShell';
import Tag from '@/components/ui/Tag/Tag';
import UserMultiSelectField from '@/components/ui/UserMultiSelectField/UserMultiSelectField';
import TaskDateField from '@/components/tasks/TaskDateField/TaskDateField';
import TaskPriorityField from '@/components/tasks/TaskPriorityField/TaskPriorityField';

import styles from './TaskEditModal.module.css';

const STATUS_OPTIONS = [
	{ value: 'TODO', label: 'À faire', variant: 'red' },
	{ value: 'IN_PROGRESS', label: 'En cours', variant: 'orange' },
	{ value: 'DONE', label: 'Terminée', variant: 'green' },
];

// Adapte la tache recue aux champs controles du formulaire d'edition.
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
	const statusOptionRefs = useRef([]);

	// Recharge les champs quand on passe d'une tache a une autre.
	useEffect(() => {
		setFormValues(getInitialFormState(task));
	}, [task]);

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
	const currentStatusIndex = Math.max(
		0,
		STATUS_OPTIONS.findIndex((option) => option.value === formValues.status),
	);

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

	function focusStatusOptionAt(index) {
		const target = statusOptionRefs.current[index];

		if (target instanceof HTMLButtonElement) {
			target.focus();
		}
	}

	function handleStatusKeyDown(event, index) {
		if (
			event.key === 'ArrowRight' ||
			event.key === 'ArrowDown'
		) {
			event.preventDefault();

			const nextIndex = (index + 1) % STATUS_OPTIONS.length;
			const nextStatus = STATUS_OPTIONS[nextIndex];

			handleStatusSelect(nextStatus.value);
			requestAnimationFrame(() => {
				focusStatusOptionAt(nextIndex);
			});
			return;
		}

		if (
			event.key === 'ArrowLeft' ||
			event.key === 'ArrowUp'
		) {
			event.preventDefault();

			const previousIndex =
				(index - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length;
			const previousStatus = STATUS_OPTIONS[previousIndex];

			handleStatusSelect(previousStatus.value);
			requestAnimationFrame(() => {
				focusStatusOptionAt(previousIndex);
			});
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			handleStatusSelect(STATUS_OPTIONS[0].value);
			requestAnimationFrame(() => {
				focusStatusOptionAt(0);
			});
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			const lastIndex = STATUS_OPTIONS.length - 1;

			handleStatusSelect(STATUS_OPTIONS[lastIndex].value);
			requestAnimationFrame(() => {
				focusStatusOptionAt(lastIndex);
			});
		}
	}

	function handlePriorityChange(priority) {
		setFormValues((prev) => ({
			...prev,
			priority,
		}));
	}

	// Le parent gere la mise a jour effective et les erreurs eventuelles.
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

						<TaskDateField
							id="task-edit-due-date"
							value={formValues.dueDate}
							onChange={handleChange}
						/>

						<div className={styles.field}>
							<label className={styles.label}>Statut :</label>

							<div
								className={styles.statusChips}
								aria-label="Sélection du statut"
								role="radiogroup"
							>
								{STATUS_OPTIONS.map((option, index) => {
									const isActive =
										formValues.status === option.value;

									return (
										<button
											key={option.value}
											ref={(element) => {
												statusOptionRefs.current[index] =
													element;
											}}
											type="button"
											className={styles.statusChipButton}
											onClick={() =>
												handleStatusSelect(option.value)
											}
											onKeyDown={(event) =>
												handleStatusKeyDown(
													event,
													index,
												)
											}
											role="radio"
											aria-checked={isActive}
											tabIndex={
												index === currentStatusIndex
													? 0
													: -1
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

						<TaskPriorityField
							id="task-edit-priority"
							value={formValues.priority}
							onChange={handlePriorityChange}
						/>

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
						<p className={styles.errorMessage} role="alert">
							{errorMessage}
						</p>
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
