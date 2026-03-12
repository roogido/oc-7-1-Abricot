import Image from 'next/image';
import Button from '@/components/ui/Button/Button';
import Tag from '@/components/ui/Tag/Tag';

import projectIcon from '@/assets/icons/project-icon.png';
import calendarTaskIcon from '@/assets/icons/calendar-task-icon.png';
import commentIcon from '@/assets/icons/comment-icon.png';

import styles from './TaskCardDashboardKanban.module.css';

/**
 * Carte de tache pour la vue dashboard en mode kanban.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {'red'|'orange'|'green'} props.statusVariant
 * @param {string} props.statusLabel
 * @param {string} props.projectName
 * @param {string} props.dueDate
 * @param {number} props.commentCount
 * @returns {JSX.Element} Carte de tache kanban
 */
export default function TaskCardDashboardKanban({
	title,
	description,
	statusVariant,
	statusLabel,
	projectName,
	dueDate,
	commentCount,
}) {
	return (
		<article className={styles.card}>
			<div className={styles.topRow}>
				<div className={styles.heading}>
					<h3 className={styles.title}>{title}</h3>
					<p className={styles.description}>{description}</p>
				</div>

				<Tag variant={statusVariant}>{statusLabel}</Tag>
			</div>

			<div className={styles.metaRow}>
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
					<span>{commentCount}</span>
				</div>
			</div>

			<div className={styles.actions}>
				<Button>Voir</Button>
			</div>
		</article>
	);
}
