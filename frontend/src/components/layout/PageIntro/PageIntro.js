/**
 * @file src/components/layout/PageIntro/PageIntro.js
 * @description
 * En-tete reutilisable pour les pages principales protegees.
 */

import styles from './PageIntro.module.css';

/**
 * En-tete de page avec titre, sous-titre et zone d'action optionnelle.
 *
 * @param {Object} props
 * @param {string} props.title Titre principal
 * @param {string} props.subtitle Texte descriptif sous le titre
 * @param {React.ReactNode} [props.actions=null] Actions affichees a droite
 * @returns {JSX.Element}
 */
export default function PageIntro({ title, subtitle, actions = null }) {
	return (
		<header className={styles.header}>
			<div className={styles.heading}>
				<h1 className={styles.title}>{title}</h1>
				<p className={styles.subtitle}>{subtitle}</p>
			</div>

			{actions ? <div className={styles.actions}>{actions}</div> : null}
		</header>
	);
}
