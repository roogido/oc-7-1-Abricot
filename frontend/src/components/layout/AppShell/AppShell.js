/**
 * @file src/components/layout/AppShell.js
 * @description
 * Shell principal de l'espace authentifié.
 */

'use client';

import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import styles from './AppShell.module.css';

/**
 * Structure principale des pages protégées.
 * Fournit le layout global avec navigation et pied de page.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children Contenu de la page
 * @param {Object|null} props.user Utilisateur authentifié
 * @returns {JSX.Element} Layout de l'espace authentifié
 */
export default function AppShell({ children, user }) {
	return (
		<div className={styles.page}>
			<div className={styles.appFrame}>
				{/* Barre de navigation principale */}
				<Navbar user={user} />

				{/* Zone principale de contenu */}
				<main className={styles.main}>{children}</main>

				{/* Pied de page de l'application */}
				<Footer />
			</div>
		</div>
	);
}
