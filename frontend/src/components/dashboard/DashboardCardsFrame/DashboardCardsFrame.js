/**
 * @file src/components/dashboard/DashboardCardsFrame/DashboardCardsFrame.js
 * @description
 * Frame générique utilisée pour encapsuler une liste ou un ensemble de cartes
 * dans le dashboard.
 */

import styles from './DashboardCardsFrame.module.css';

/**
 * Conteneur réutilisable pour les cartes du dashboard.
 *
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {React.ReactNode} [props.actions]
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export default function DashboardCardsFrame({
	title,
	subtitle,
	actions = null,
	children,
}) {
	const hasHeader = Boolean(title || subtitle || actions);

	return (
		<section className={styles.frame}>
			{hasHeader ? (
				<header className={styles.header}>
					<div className={styles.heading}>
						{title ? (
							<h2 className={styles.title}>{title}</h2>
						) : null}
						{subtitle ? (
							<p className={styles.subtitle}>{subtitle}</p>
						) : null}
					</div>

					{actions ? (
						<div className={styles.actions}>{actions}</div>
					) : null}
				</header>
			) : null}

			<div className={styles.content}>{children}</div>
		</section>
	);
}
