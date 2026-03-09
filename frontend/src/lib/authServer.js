/**
 * @file src/lib/authServer.js
 * @description
 * Helpers serveur d'authentification pour les layouts et pages protégés.
 */

import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TOKEN_COOKIE } from '@/lib/authConstants';
import { getCurrentUser } from '@/services/authService';

/**
 * Exige un utilisateur authentifié côté serveur.
 *
 * - Lit le token JWT depuis le cookie httpOnly.
 * - Interroge l'API backend pour récupérer le profil.
 * - Redirige vers /login si la session est absente ou invalide.
 *
 * @returns {Promise<Object>}
 */
export async function requireUser() {
	const cookieStore = await cookies();
	const token = cookieStore.get(TOKEN_COOKIE)?.value;

	if (!token) {
		redirect('/login');
	}

	try {
		const data = await getCurrentUser(token);
		const user = data?.data?.user ?? null;

		if (!user) {
			redirect('/login');
		}

		return user;
	} catch {
		redirect('/login');
	}
}