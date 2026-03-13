/**
 * @file src/components/dashboard/DashboardPanel/DashboardPanel.js
 * @description
 * Frame partagee des variantes du tableau de bord.
 */

import styles from './DashboardPanel.module.css';

/**
 * Affiche la frame principale d'une vue du tableau de bord.
 *
 * @param {Object} props
 * @param {string} props.title Titre du bloc
 * @param {string} props.subtitle Texte descriptif du bloc
 * @param {React.ReactNode} [props.actions=null] Actions affichees a droite
 * @param {React.ReactNode} props.children Contenu principal du bloc
 * @returns {JSX.Element}
 */
export default function DashboardPanel({
	title,
	subtitle,
	actions = null,
	children,
}) {
	return (
		<section className={styles.panel} aria-label={title}>
			<div className={styles.header}>
				<div className={styles.heading}>
					<h2 className={styles.title}>{title}</h2>
					<p className={styles.subtitle}>{subtitle}</p>
				</div>

				{actions ? (
					<div className={styles.actions}>{actions}</div>
				) : null}
			</div>

			<div className={styles.content}>{children}</div>
		</section>
	);
}
