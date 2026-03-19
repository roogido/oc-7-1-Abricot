/**
 * @file src/components/projects/AiTaskSuggestionsModal/AiTaskSuggestionsModal.js
 * @description
 * Modale de revue des tâches générées par l'IA avant création réelle.
 */

'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';

import Button from '@/components/ui/Button/Button';
import ModalShell from '@/components/ui/ModalShell/ModalShell';
import AiTaskDraftEditModal from '@/components/projects/AiTaskDraftEditModal/AiTaskDraftEditModal';

import starIcon from '@/assets/icons/star-icon.png';

import styles from './AiTaskSuggestionsModal.module.css';

/**
 * Affiche la liste des taches generees avant leur creation.
 */
export default function AiTaskSuggestionsModal({
	isOpen,
	onClose,
	tasks = [],
	onDeleteTask,
	onUpdateTask,
	onCreateTasks,
	isSubmitting = false,
	errorMessage = '',
}) {
	const [editingTaskId, setEditingTaskId] = useState('');

	const editingTask = tasks.find((task) => task.id === editingTaskId) ?? null;

	const isCreateDisabled = tasks.length === 0 || isSubmitting;

	const submitLabel = useMemo(() => {
		return isSubmitting ? 'Ajout...' : '+ Ajouter les tâches';
	}, [isSubmitting]);

	function handleOpenEdit(taskId) {
		setEditingTaskId(taskId);
	}

	function handleCloseEdit() {
		setEditingTaskId('');
	}

	function handleEditSubmit(updatedTask) {
		onUpdateTask(updatedTask);
		setEditingTaskId('');
	}

	return (
		<>
			<ModalShell
				isOpen={isOpen}
				onClose={onClose}
				ariaLabel="Liste des tâches générées par l'intelligence artificielle"
			>
				<div className={styles.container}>
					<div className={styles.header}>
						<div className={styles.titleRow}>
							<Image
								src={starIcon}
								alt=""
								aria-hidden="true"
								className={styles.titleIcon}
							/>

							<h2 className={styles.title}>Vos tâches...</h2>
						</div>
					</div>

					<div className={styles.list}>
						{tasks.map((task) => (
							<article key={task.id} className={styles.card}>
								<div className={styles.cardBody}>
									<h3 className={styles.cardTitle}>
										{task.title}
									</h3>

									<p className={styles.cardDescription}>
										{task.description}
									</p>

									<div className={styles.cardMeta}>
										<span className={styles.metaItem}>
											Échéance : {task.dueDate}
										</span>
										<span className={styles.metaSeparator}>
											|
										</span>
										<span className={styles.metaItem}>
											Priorité : {task.priority}
										</span>
									</div>

									<div className={styles.cardActions}>
										<button
											type="button"
											className={`${styles.actionButton} ${styles.deleteActionButton}`}
											onClick={() =>
												onDeleteTask(task.id)
											}
										>
											<Trash2
												size={14}
												aria-hidden="true"
											/>
											<span>Supprimer</span>
										</button>

										<span className={styles.actionDivider}>
											|
										</span>

										<button
											type="button"
											className={styles.actionButton}
											onClick={() =>
												handleOpenEdit(task.id)
											}
										>
											<Pencil
												size={14}
												aria-hidden="true"
											/>
											<span>Modifier</span>
										</button>
									</div>
								</div>
							</article>
						))}

						{tasks.length === 0 ? (
							<p className={styles.emptyMessage}>
								Aucune tâche générée à afficher.
							</p>
						) : null}
					</div>

					{errorMessage ? (
						<p className={styles.errorMessage} role="alert">
							{errorMessage}
						</p>
					) : null}

					<div className={styles.footer}>
						<Button
							type="button"
							onClick={onCreateTasks}
							disabled={isCreateDisabled}
						>
							{submitLabel}
						</Button>
					</div>
				</div>
			</ModalShell>

			{editingTask ? (
				<AiTaskDraftEditModal
					isOpen={true}
					onClose={handleCloseEdit}
					task={editingTask}
					onSubmit={handleEditSubmit}
				/>
			) : null}
		</>
	);
}
