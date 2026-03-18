/**
 * @file src/app/not-found.js
 * @description
 * Page 404 personnalisée de l'application Abricot.
 */

import Link from 'next/link';

import styles from './error-pages.module.css';

export default function NotFoundPage() {
	return (
		<main className={styles.page}>
			<section className={styles.card}>
				<p className={styles.code}>404</p>

				<h1 className={styles.title}>Page introuvable</h1>

				<p className={styles.description}>
					La page demandée n’existe pas ou n’est plus disponible.
				</p>

				<div className={styles.actions}>
					<Link href="/dashboard" className={styles.primaryAction}>
						Retourner au tableau de bord
					</Link>

					<Link href="/projects" className={styles.secondaryAction}>
						Voir mes projets
					</Link>
				</div>
			</section>
		</main>
	);
}
