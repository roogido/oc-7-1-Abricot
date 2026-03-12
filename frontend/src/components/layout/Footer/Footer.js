/**
 * @file src/components/layout/Footer.js
 * @description
 * Pied de page global de l'application.
 */

'use client'

import Image from 'next/image'
import styles from './Footer.module.css'

import logoFooter from '@/assets/images/Layout/logo-footer.png'

/**
 * Pied de page de l'application.
 *
 * @returns {JSX.Element} Footer avec logo et mention légale
 */
export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<Image
					src={logoFooter}
					alt="Abricot"
					className={styles.logo}
					priority={false}
				/>

				<p className={styles.copyright}>
					Abricot 2026
				</p>
			</div>
		</footer>
	)
}
