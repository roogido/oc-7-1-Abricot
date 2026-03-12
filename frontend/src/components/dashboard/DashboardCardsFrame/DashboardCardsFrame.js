/**
 * @file src/components/dashboard/DashboardCardsFrame/DashboardCardsFrame.js
 * @description
 * Conteneur commun des cartes du dashboard.
 */

import styles from './DashboardCardsFrame.module.css';

/**
 * Frame commune pour les zones de cartes du dashboard.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export default function DashboardCardsFrame({ children }) {
	return <section className={styles.frame}>{children}</section>;
}
