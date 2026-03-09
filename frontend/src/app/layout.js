/**
 * @file src/app/layout.js
 * @description
 * Layout racine de l'application Next.js (App Router).
 * Définit la structure HTML globale et injecte les providers partagés.
 *
 * @date 03-03-2026
 */

import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';

// Chargement de la police Inter optimisée via next/font
const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
});

/**
 * Métadonnées globales de l'application.
 * Utilisées par Next.js pour le SEO et les balises <head>.
 */
export const metadata = {
	title: 'Abricot',
	description: 'SaaS de gestion de projets collaboratifs',
};

/**
 * Layout racine appliqué à toutes les pages de l'application.
 * Encapsule l'application dans les providers globaux (authentification).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children Contenu des pages rendu dans le layout
 * @returns {JSX.Element} Structure HTML globale de l'application
 */
export default function RootLayout({ children }) {
	return (
		<html lang="fr">
			<body>
				{/* Provider global de gestion d'authentification */}
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
