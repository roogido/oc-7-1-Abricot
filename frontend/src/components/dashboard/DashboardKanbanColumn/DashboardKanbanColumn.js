import Tag from '@/components/ui/Tag/Tag';
import TaskCardDashboardKanban from '@/components/tasks/TaskCardDashboardKanban/TaskCardDashboardKanban';
import styles from './DashboardKanbanColumn.module.css';

/**
 * Colonne du tableau kanban du dashboard.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {number} props.count
 * @param {Array<Object>} props.tasks
 * @returns {JSX.Element} Colonne kanban
 */
export default function DashboardKanbanColumn({ title, count, tasks = [] }) {
	return (
		<section className={styles.column}>
			<header className={styles.header}>
				<h2 className={styles.title}>{title}</h2>
				<Tag variant="grey">{count}</Tag>
			</header>

			<div className={styles.cards}>
				{tasks.map((task) => (
					<TaskCardDashboardKanban
						key={task.id}
						title={task.title}
						description={task.description}
						statusVariant={task.statusVariant}
						statusLabel={task.statusLabel}
						projectName={task.projectName}
						dueDate={task.dueDate}
						commentsCount={task.commentsCount}
						viewHref={task.viewHref}
					/>
				))}
			</div>
		</section>
	);
}
