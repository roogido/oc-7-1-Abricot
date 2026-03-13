/**
 * @file src/components/tasks/TaskCardDashboardList/TaskCardDashboardList.js
 * @description
 * Carte de tache pour la vue liste du tableau de bord.
 */

import Image from 'next/image';
import Link from 'next/link';

import Tag from '@/components/ui/Tag/Tag';

import projectIcon from '@/assets/icons/project-icon.png';
import calendarTaskIcon from '@/assets/icons/calendar-task-icon.png';
import commentIcon from '@/assets/icons/comment-icon.png';

import styles from './TaskCardDashboardList.module.css';

/**
 * Carte de tache pour le dashboard en vue liste.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {'red'|'orange'|'green'} props.statusVariant
 * @param {string} props.statusLabel
 * @param {string} props.projectName
 * @param {string} props.dueDate
 * @param {number} props.commentsCount
 * @param {string} props.viewHref
 * @returns {JSX.Element} Carte de tache du dashboard liste
 */
export default function TaskCardDashboardList({
	title,
	description,
	statusVariant,
	statusLabel,
	projectName,
	dueDate,
	commentsCount,
	viewHref,
}) {
	return (
		<article className={styles.card}>
			<div className={styles.content}>
				<div className={styles.main}>
					<div className={styles.heading}>
						<h3 className={styles.title}>{title}</h3>
						<p className={styles.description}>{description}</p>
					</div>

					<div className={styles.meta}>
						<div className={styles.metaItem}>
							<Image
								src={projectIcon}
								alt=""
								aria-hidden="true"
								className={styles.projectIcon}
							/>
							<span>{projectName}</span>
						</div>

						<span className={styles.separator}>|</span>

						<div className={styles.metaItem}>
							<Image
								src={calendarTaskIcon}
								alt=""
								aria-hidden="true"
								className={styles.calendarIcon}
							/>
							<span>{dueDate}</span>
						</div>

						<span className={styles.separator}>|</span>

						<div className={styles.metaItem}>
							<Image
								src={commentIcon}
								alt=""
								aria-hidden="true"
								className={styles.commentIcon}
							/>
							<span>{commentsCount}</span>
						</div>
					</div>
				</div>

				<div className={styles.side}>
					<Tag variant={statusVariant}>{statusLabel}</Tag>

					<Link href={viewHref} className={styles.viewLink}>
						Voir
					</Link>
				</div>
			</div>
		</article>
	);
}
