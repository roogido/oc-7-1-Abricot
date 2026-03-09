/**
 * @file src/app/api/auth/logout/route.js
 * @description
 * Route Handler Next.js de déconnexion utilisateur.
 */

import { NextResponse } from 'next/server';
import { TOKEN_COOKIE } from '@/lib/authConstants';

/**
 * Supprime le cookie d'authentification JWT.
 *
 * @returns {NextResponse} Réponse JSON confirmant la déconnexion
 */
export async function POST() {
	const response = NextResponse.json({
		success: true,
		message: 'Logged out',
	});

	// Suppression du cookie httpOnly contenant le JWT
	response.cookies.delete(TOKEN_COOKIE);

	return response;
}
