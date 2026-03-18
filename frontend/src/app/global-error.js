/**
 * @file src/app/global-error.js
 * @description
 * Composant d’erreur globale (Next.js App Router).
 *
 * Intercepte les erreurs critiques non gérées de l’application entière
 * (root layout, erreurs hors segment).
 *
 * Affiche une page de secours minimale pour éviter un écran blanc.
 *
 * Remarque :
 * - Doit être un Client Component (`'use client'`)
 * - Remplace entièrement le rendu (html/body inclus)
 */

'use client';

import Link from 'next/link';

import styles from './error-pages.module.css';

export default function GlobalErrorPage() {
	return (
		<html lang="fr">
			<body className={styles.body}>
				<main className={styles.page}>
					<section className={styles.card}>
						<p className={styles.code}>500</p>

						<h1 className={styles.title}>
							L’application rencontre un problème
						</h1>

						<p className={styles.description}>
							Une erreur critique est survenue. Tu peux revenir à
							l’accueil de l’application.
						</p>

						<div className={styles.actions}>
							<Link
								href="/dashboard"
								className={styles.primaryAction}
							>
								Retourner au tableau de bord
							</Link>
						</div>
					</section>
				</main>
			</body>
		</html>
	);
}
