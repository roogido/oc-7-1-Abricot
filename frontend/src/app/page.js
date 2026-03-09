/**
 * @file src/app/api/page.js
 * @description
 * Page d’entrée de l’application.
 * Redirige l’utilisateur selon la présence d’un token d’authentification.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TOKEN_COOKIE } from '@/lib/authConstants';

/**
 * Page racine.
 * Vérifie la présence du cookie d’authentification et redirige
 * vers la page appropriée.
 *
 * @returns {never} Redirection vers /dashboard ou /login
 */
export default async function HomePage() {
	// Accès aux cookies côté serveur (App Router)
	const cookieStore = await cookies();

	// Lecture du token JWT stocké dans le cookie
	const token = cookieStore.get(TOKEN_COOKIE)?.value;

	// Utilisateur authentifié → accès au dashboard
	if (token) {
		redirect('/dashboard');
	}

	// Utilisateur non authentifié → page de connexion
	redirect('/login');
}
