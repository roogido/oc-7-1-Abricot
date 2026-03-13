import DashboardKanbanColumn from '../DashboardKanbanColumn/DashboardKanbanColumn';
import styles from './DashboardKanbanBoard.module.css';

/**
 * Tableau kanban du dashboard.
 *
 * @param {Object} props
 * @param {Array<Object>} props.columns
 * @returns {JSX.Element} Tableau kanban
 */
export default function DashboardKanbanBoard({ columns = [] }) {
	return (
		<div className={styles.board}>
			{columns.map((column) => (
				<DashboardKanbanColumn
					key={column.id}
					title={column.title}
					count={column.count}
					tasks={column.tasks}
				/>
			))}
		</div>
	);
}
