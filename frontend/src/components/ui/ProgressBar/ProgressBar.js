import styles from './ProgressBar.module.css';

/**
 * Barre de progression horizontale.
 *
 * @param {Object} props
 * @param {number} props.value Valeur de progression entre 0 et 100
 * @returns {JSX.Element}
 */
export default function ProgressBar({ value = 0 }) {
	const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

	return (
		<div
			className={styles.track}
			role="progressbar"
			aria-valuenow={safeValue}
			aria-valuemin="0"
			aria-valuemax="100"
		>
			<div className={styles.fill} style={{ width: `${safeValue}%` }} />
		</div>
	);
}
