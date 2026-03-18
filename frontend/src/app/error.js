/**
 * @file src/app/error.js
 * @description
 * Composant d’erreur global pour un segment de l’application (Next.js App Router).
 *
 * Une "erreur segmentée" signifie que cette page intercepte les erreurs
 * survenues dans un segment donné de l’arborescence `app/` (layout, page,
 * composants enfants) sans faire planter toute l’application.
 *
 * Concrètement :
 * - Si une erreur est levée dans un composant de ce segment,
 *   Next.js affiche automatiquement cette page.
 * - L’erreur est isolée : les autres segments continuent de fonctionner.
 *
 * Props fournies par Next.js :
 * - error : objet Error contenant les informations de l’erreur levée
 * - reset : fonction permettant de retenter le rendu du segment (retry)
 *
 * Bonnes pratiques :
 * - Logger l’erreur (console, monitoring, etc.)
 * - Proposer une action utilisateur (retry, navigation)
 * - Ne pas exposer de détails techniques sensibles côté UI
 *
 * Remarque :
 * - Ce composant doit être un Client Component (`'use client'`)
 *   car il utilise des hooks React et des interactions utilisateur.
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import styles from './error-pages.module.css';

export default function ErrorPage({ error, reset }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className={styles.page}>
			<section className={styles.card}>
				<p className={styles.code}>500</p>

				<h1 className={styles.title}>Une erreur est survenue</h1>

				<p className={styles.description}>
					Un problème inattendu a empêché l’affichage correct de cette
					page.
				</p>

				<div className={styles.actions}>
					<button
						type="button"
						onClick={() => reset()}
						className={styles.primaryButton}
					>
						Réessayer
					</button>

					<Link href="/dashboard" className={styles.secondaryAction}>
						Retourner au tableau de bord
					</Link>
				</div>
			</section>
		</main>
	);
}