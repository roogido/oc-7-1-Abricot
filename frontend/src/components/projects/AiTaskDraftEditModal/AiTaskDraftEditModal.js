/**
 * @file src/components/projects/AiTaskDraftEditModal/AiTaskDraftEditModal.js
 * @description
 * Modale d'édition locale d'une tâche générée par l'IA avant création réelle.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/Button/Button';
import ModalShell from '@/components/ui/ModalShell/ModalShell';
import Tag from '@/components/ui/Tag/Tag';

import styles from './AiTaskDraftEditModal.module.css';

const PRIORITY_OPTIONS = [
	{ value: 'LOW', label: 'Basse' },
	{ value: 'MEDIUM', label: 'Moyenne' },
	{ value: 'HIGH', label: 'Haute' },
];

const STATUS_OPTIONS = [{ value: 'TODO', label: 'À faire', variant: 'red' }];

function getInitialFormState(task) {
	return {
		title: typeof task?.title === 'string' ? task.title : '',
		description:
			typeof task?.description === 'string' ? task.description : '',
		dueDate: typeof task?.dueDate === 'string' ? task.dueDate : '',
		priority:
			typeof task?.priority === 'string' && task.priority !== ''
				? task.priority
				: 'LOW',
		status:
			typeof task?.status === 'string' && task.status !== ''
				? task.status
				: 'TODO',
	};
}

/**
 * Permet de modifier localement une tache suggeree avant validation.
 */
export default function AiTaskDraftEditModal({
	isOpen,
	onClose,
	task,
	onSubmit,
}) {
	const [formValues, setFormValues] = useState(() =>
		getInitialFormState(task),
	);

	useEffect(() => {
		setFormValues(getInitialFormState(task));
	}, [task]);

	const isSubmitDisabled =
		formValues.title.trim() === '' ||
		formValues.description.trim() === '' ||
		formValues.dueDate.trim() === '';

	const submitLabel = useMemo(() => 'Enregistrer', []);

	function handleChange(event) {
		const { name, value } = event.target;

		setFormValues((prev) => ({
			...prev,
			[name]: value,
		}));
	}

	function handlePriorityChange(event) {
		setFormValues((prev) => ({
			...prev,
			priority: event.target.value,
		}));
	}

	function handleSubmit(event) {
		event.preventDefault();

		if (isSubmitDisabled || !task) {
			return;
		}

		onSubmit({
			...task,
			title: formValues.title.trim(),
			description: formValues.description.trim(),
			dueDate: formValues.dueDate.trim(),
			priority: formValues.priority,
			status: formValues.status,
		});
	}

	return (
		<ModalShell
			isOpen={isOpen}
			onClose={onClose}
			ariaLabel="Modifier une tâche suggérée"
		>
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.fieldsBlock}>
					<h2 className={styles.title}>Modifier</h2>

					<div className={styles.fields}>
						<div className={styles.field}>
							<label
								htmlFor="ai-task-title"
								className={styles.label}
							>
								Titre
							</label>
							<input
								id="ai-task-title"
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
								htmlFor="ai-task-description"
								className={styles.label}
							>
								Description
							</label>
							<textarea
								id="ai-task-description"
								name="description"
								value={formValues.description}
								onChange={handleChange}
								className={styles.textarea}
								rows="4"
							/>
						</div>

						<div className={styles.field}>
							<label
								htmlFor="ai-task-due-date"
								className={styles.label}
							>
								Échéance
							</label>
							<input
								id="ai-task-due-date"
								name="dueDate"
								type="date"
								value={formValues.dueDate}
								onChange={handleChange}
								className={styles.input}
							/>
						</div>

						<div className={styles.field}>
							<label
								htmlFor="ai-task-priority"
								className={styles.label}
							>
								Priorité
							</label>
							<select
								id="ai-task-priority"
								value={formValues.priority}
								onChange={handlePriorityChange}
								className={styles.input}
							>
								{PRIORITY_OPTIONS.map((option) => (
									<option
										key={option.value}
										value={option.value}
									>
										{option.label}
									</option>
								))}
							</select>
						</div>

						<div className={styles.field}>
							<label className={styles.label}>Statut :</label>

							<div className={styles.statusChips}>
								{STATUS_OPTIONS.map((option) => (
									<div key={option.value}>
										<Tag
											variant={option.variant}
											active={true}
										>
											{option.label}
										</Tag>
									</div>
								))}
							</div>
						</div>
					</div>
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
