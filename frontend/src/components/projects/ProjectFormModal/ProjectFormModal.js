/**
 * @file src/components/projects/ProjectFormModal/ProjectFormModal.js
 * @description
 * Modale de création et d'édition d'un projet.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/Button/Button';
import ModalShell from '@/components/ui/ModalShell/ModalShell';
import UserMultiSelectField from '@/components/ui/UserMultiSelectField/UserMultiSelectField';

import styles from './ProjectFormModal.module.css';

// Prepare des valeurs controlees, que le projet soit nouveau ou existant.
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
	onDelete = null,
	isDeleting = false,
	deleteErrorMessage = '',
}) {
	const [formValues, setFormValues] = useState(() =>
		getInitialFormState(initialValues),
	);

	// Reinitialise le formulaire quand on change de projet a editer.
	useEffect(() => {
		setFormValues(getInitialFormState(initialValues));
	}, [initialValues]);

	const titleValue = formValues.title.trim();
	const descriptionValue = formValues.description.trim();

	const isSubmitDisabled =
		titleValue === '' ||
		descriptionValue === '' ||
		isSubmitting ||
		isDeleting;

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

	// Remonte seulement les champs utiles; le parent gere l'appel API.
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

						<UserMultiSelectField
							id="project-contributors"
							label="Contributeurs"
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

					{deleteErrorMessage ? (
						<p className={styles.errorMessage}>
							{deleteErrorMessage}
						</p>
					) : null}
				</div>

				<div className={styles.actions}>
					{mode === 'edit' && typeof onDelete === 'function' ? (
						<button
							type="button"
							className={styles.deleteButton}
							onClick={onDelete}
							disabled={isSubmitting || isDeleting}
						>
							{isDeleting
								? 'Suppression...'
								: 'Supprimer le projet'}
						</button>
					) : (
						<span />
					)}

					<Button type="submit" disabled={isSubmitDisabled}>
						{submitLabel}
					</Button>
				</div>
			</form>
		</ModalShell>
	);
}
