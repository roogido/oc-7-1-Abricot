/**
 * @file app/layout.js
 * @description 
 * Layout racine de l'application Next.js (App Router).
 * Définit la structure globale des pages et injecte les providers 
 * partagés (ex: AuthContext).
 *
 * @date 03-03-2026
 */

import './globals.css';
import { AuthProvider } from '../context/AuthContext';


export const metadata = {
	title: 'Abricot',
	description: 'SaaS de gestion de projets collaboratifs',
};

export default function RootLayout({ children }) {
	return (
		<html lang="fr">
			<body>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
