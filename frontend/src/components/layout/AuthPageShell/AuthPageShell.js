/**
 * @file src/components/layout/AuthPageShell.js
 * @description
 * Gabarit partagé pour les pages d'authentification.
 */

'use client';

import Image from 'next/image';
import logoHeader from '@/assets/images/Layout/logo-header.png';
import styles from './AuthPageShell.module.css';

/**
 * Layout commun aux pages d'authentification (login / register).
 * Fournit la structure visuelle avec logo, formulaire et illustration.
 *
 * @param {Object} props
 * @param {string} props.title Titre de la page
 * @param {StaticImageData|string} props.imageSrc Illustration affichée à droite
 * @param {string} props.imageAlt Texte alternatif de l'image
 * @param {React.ReactNode} props.children Contenu principal (formulaire)
 * @param {React.ReactNode} props.bottomContent Contenu affiché sous le formulaire
 * @returns {JSX.Element} Layout d'authentification
 */
export default function AuthPageShell({
	title,
	imageSrc,
	imageAlt,
	children,
	bottomContent,
}) {
	return (
		<div className={styles.page}>
			<main className={styles.frame}>
				<section className={styles.leftPanel}>
					{/* Logo de l'application */}
					<div className={styles.logoWrapper}>
						<Image
							src={logoHeader}
							alt="Abricot"
							className={styles.logo}
							priority
						/>
					</div>

					{/* Bloc principal contenant le formulaire */}
					<div className={styles.formBlock}>
						<h1 className={styles.title}>{title}</h1>

						<div className={styles.formContent}>{children}</div>
					</div>

					{/* Zone de contenu secondaire (ex: lien login/register) */}
					<div className={styles.bottomContent}>{bottomContent}</div>
				</section>

				{/* Illustration décorative */}
				<aside className={styles.rightPanel} aria-hidden="true">
					<Image
						src={imageSrc}
						alt={imageAlt}
						className={styles.visual}
						priority
					/>
				</aside>
			</main>
		</div>
	);
}
