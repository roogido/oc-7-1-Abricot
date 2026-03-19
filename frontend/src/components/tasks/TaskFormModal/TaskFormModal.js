/**
 * @file src/components/tasks/TaskFormModal/TaskFormModal.js
 * @description
 * Modale de création d'une tâche projet.
 */

'use client';

import { useMemo, useState } from 'react';

import Button from '@/components/ui/Button/Button';
import ModalShell from '@/components/ui/ModalShell/ModalShell';
import Tag from '@/components/ui/Tag/Tag';
import UserMultiSelectField from '@/components/ui/UserMultiSelectField/UserMultiSelectField';
import TaskDateField from '@/components/tasks/TaskDateField/TaskDateField';
import TaskPriorityField from '@/components/tasks/TaskPriorityField/TaskPriorityField';

import styles from './TaskFormModal.module.css';

const STATUS_OPTIONS = [
	{ value: 'TODO', label: 'À faire', variant: 'red' },
	{ value: 'IN_PROGRESS', label: 'En cours', variant: 'orange' },
	{ value: 'DONE', label: 'Terminée', variant: 'green' },
];

// La creation demarre toujours sur TODO, non modifiable ici.
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

	const titleValue = formValues.title.trim();
	const descriptionValue = formValues.description.trim();
	const dueDateValue = formValues.dueDate.trim();
	const priorityValue = formValues.priority.trim();

	// Bloque l'envoi tant que les champs requis ou l'etat async ne sont pas prets.
	const isSubmitDisabled =
		titleValue === '' ||
		descriptionValue === '' ||
		dueDateValue === '' ||
		priorityValue === '' ||
		isSubmitting;

	const submitLabel = useMemo(() => {
		return isSubmitting ? 'Ajout...' : '+ Ajouter une tâche';
	}, [isSubmitting]);

	function handleChange(event) {
		const { name, value } = event.target;

		setFormValues((prev) => ({
			...prev,
			[name]: value,
		}));
	}

	function handlePriorityChange(priority) {
		setFormValues((prev) => ({
			...prev,
			priority,
		}));
	}

	// Le parent reste responsable de la creation reelle et des erreurs API.
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

						<TaskDateField
							id="task-due-date"
							value={formValues.dueDate}
							onChange={handleChange}
						/>

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

						<TaskPriorityField
							id="task-priority"
							value={formValues.priority}
							onChange={handlePriorityChange}
						/>

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
