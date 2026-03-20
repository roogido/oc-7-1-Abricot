/**
 * @file src/components/projects/ProjectCard/ProjectCard.js
 * @description
 * Carte d'affichage d'un projet dans la grille de la page des projets.
 */

import Link from 'next/link';
import Image from 'next/image';
import styles from './ProjectCard.module.css';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import Tag from '@/components/ui/Tag/Tag';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import projectUsersIcon from '@/assets/icons/project-users-icon.png';

/**
 * Carte de projet affichee dans la vue liste des projets.
 *
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.name
 * @param {string} props.description
 * @param {number} props.progress
 * @param {number} props.completedTasks
 * @param {number} props.totalTasks
 * @param {string} props.ownerInitials
 * @param {string} [props.ownerName='']
 * @param {string[]} [props.memberInitials=[]]
 * @returns {JSX.Element}
 */
export default function ProjectCard({
	id,
	name,
	description,
	progress,
	completedTasks,
	totalTasks,
	ownerInitials,
	ownerName = '',
	memberInitials = [],
}) {
	return (
		<Link href={`/projects/${id}`} className={styles.cardLink}>
			<article className={styles.card}>
				<header className={styles.header}>
					<h3 className={styles.title}>{name}</h3>
					<p className={styles.description}>{description}</p>
				</header>

				<section className={styles.progressSection}>
					<div className={styles.progressHeader}>
						<span className={styles.progressLabel}>
							Progression
						</span>
						<span className={styles.progressValue}>
							{progress}%
						</span>
					</div>

					<ProgressBar value={progress} />

					<p className={styles.progressText}>
						{completedTasks}/{totalTasks} taches terminees
					</p>
				</section>

				<section className={styles.teamSection}>
					<p className={styles.teamLabel}>
						<Image
							src={projectUsersIcon}
							alt=""
							aria-hidden="true"
							className={styles.teamLabelIcon}
						/>
						<span>Equipe ({1 + memberInitials.length})</span>
					</p>

					<div className={styles.teamMembers}>
						<UserAvatar initials={ownerInitials} variant="owner" />

						<Tag variant="brand">
							{ownerName !== '' ? ownerName : 'Proprietaire'}
						</Tag>

						{memberInitials.map((initials) => (
							<UserAvatar
								key={initials}
								initials={initials}
								variant="member"
							/>
						))}
					</div>
				</section>
			</article>
		</Link>
	);
}
