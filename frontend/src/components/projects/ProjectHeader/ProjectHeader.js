/**
 * @file src/components/projects/ProjectHeader/ProjectHeader.js
 * @description
 * En-tête de la page détail projet : navigation retour, édition et actions de création.
 */

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Button from '@/components/ui/Button/Button';
import Link from '@/components/ui/Link/Link';
import styles from './ProjectHeader.module.css';

import arrowLeftIcon from '@/assets/icons/arrow-left-icon.png';
import starIcon from '@/assets/icons/star-icon.png';

/**
 * Entete de la page detail d'un projet.
 *
 * @param {Object} props
 * @param {string} props.projectName
 * @param {string} props.description
 * @param {string} [props.editHref]
 * @param {boolean} [props.canEditProject=false]
 * @param {string} [props.backHref='/projects']
 * @param {Function} [props.onBack]
 * @param {Function} [props.onCreateTask]
 * @param {Function} [props.onAI]
 * @returns {JSX.Element}
 */
export default function ProjectHeader({
	projectName,
	description,
	editHref,
	canEditProject = false,
	backHref = '/projects',
	onBack,
	onCreateTask,
	onAI,
}) {
	const router = useRouter();

	function handleBackClick() {
		if (typeof onBack === 'function') {
			onBack();
			return;
		}

		router.push(backHref);
	}

	return (
		<section className={styles.header}>
			<div className={styles.leftColumn}>
				<div className={styles.titleRow}>
					<button
						type="button"
						onClick={handleBackClick}
						className={styles.backButton}
						aria-label="Retour"
					>
						<Image
							src={arrowLeftIcon}
							alt=""
							aria-hidden="true"
							className={styles.backIcon}
						/>
					</button>

					<div className={styles.textBlock}>
						<div className={styles.headingInline}>
							<h1 className={styles.title}>{projectName}</h1>

							<Link
								href={editHref}
								disabled={!canEditProject}
								ariaDisabled={!canEditProject}
								title={
									canEditProject
										? 'Modifier le projet'
										: 'Réservé au propriétaire du projet'
								}
							>
								Modifier
							</Link>
						</div>

						<p className={styles.description}>{description}</p>
					</div>
				</div>
			</div>

			<div className={styles.actions}>
				<Button type="button" onClick={onCreateTask}>
					Créer une tâche
				</Button>

				<button
					type="button"
					onClick={onAI}
					className={styles.aiButton}
					aria-label="Assistant IA"
				>
					<Image
						src={starIcon}
						alt=""
						aria-hidden="true"
						className={styles.aiIcon}
					/>
					<span>IA</span>
				</button>
			</div>
		</section>
	);
}
