/**
 * @file src/components/projects/AiTaskPromptModal/AiTaskPromptModal.js
 * @description
 * Modale de saisie du brief utilisateur pour générer des tâches avec l'IA.
 */

'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

import Button from '@/components/ui/Button/Button';
import ModalShell from '@/components/ui/ModalShell/ModalShell';

import starIcon from '@/assets/icons/star-icon.png';
import aiButtonIcon from '@/assets/icons/IA-button-icon.png';

import styles from './AiTaskPromptModal.module.css';

function getInitialPrompt(projectName, projectDescription) {
	const normalizedDescription =
		typeof projectDescription === 'string' &&
		projectDescription.trim() !== ''
			? projectDescription.trim()
			: "Pas de description fournie pour l'instant.";

	return `Je souhaite créer des tâches pour le projet "${projectName}". Contexte : ${normalizedDescription}`;
}

/**
 * Recueille le brief utilisateur avant de lancer la generation IA.
 */
export default function AiTaskPromptModal({
	isOpen,
	onClose,
	onSubmit,
	projectName,
	projectDescription,
	isSubmitting = false,
	errorMessage = '',
}) {
	const initialPrompt = useMemo(() => {
		return getInitialPrompt(projectName, projectDescription);
	}, [projectDescription, projectName]);

	const [prompt, setPrompt] = useState(initialPrompt);

	const isSubmitDisabled = prompt.trim().length < 10 || isSubmitting;

	const submitLabel = useMemo(() => {
		return isSubmitting ? 'Génération...' : 'Générer les tâches';
	}, [isSubmitting]);

	async function handleSubmit(event) {
		event.preventDefault();

		if (isSubmitDisabled) {
			return;
		}

		await onSubmit(prompt.trim());
	}

	return (
		<ModalShell
			isOpen={isOpen}
			onClose={onClose}
			ariaLabel="Créer des tâches avec l'intelligence artificielle"
		>
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.header}>
					<div className={styles.titleRow}>
						<Image
							src={starIcon}
							alt=""
							aria-hidden="true"
							className={styles.titleIcon}
						/>

						<h2 className={styles.title}>Créer une tâche</h2>
					</div>
				</div>

				<div className={styles.content}>
					<div className={styles.previewBox} aria-hidden="true" />
				</div>

				<div className={styles.footer}>
					<div className={styles.promptBox}>
						<textarea
							value={prompt}
							onChange={(event) => setPrompt(event.target.value)}
							className={styles.promptInput}
							placeholder="Décrivez les tâches que vous souhaitez ajouter..."
							rows="3"
						/>

						<button
							type="submit"
							className={styles.submitIconButton}
							disabled={isSubmitDisabled}
							aria-label={submitLabel}
							title={submitLabel}
						>
							<Image
								src={aiButtonIcon}
								alt=""
								aria-hidden="true"
								className={styles.submitIcon}
							/>
						</button>
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
