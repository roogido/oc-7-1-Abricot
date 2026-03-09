/**
 * @file src/app/api/auth/me/route.js
 * @description
 * Route Handler Next.js retournant l'utilisateur authentifié
 * à partir du cookie JWT httpOnly.
 */

import { NextResponse } from 'next/server';
import { TOKEN_COOKIE, TOKEN_SAMESITE, TOKEN_PATH } from '@/lib/authConstants';
import { ApiClientError } from '@/services/apiClient';
import { getCurrentUser } from '@/services/authService';

/**
 * Retourne l'utilisateur associé au token présent dans le cookie.
 *
 * @param {Request} request Requête HTTP entrante
 * @returns {Promise<NextResponse>} Réponse JSON contenant l'utilisateur
 */
export async function GET(request) {
	try {
		// Lecture du JWT depuis le cookie httpOnly
		const token = request.cookies.get(TOKEN_COOKIE)?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Not authenticated' },
				{ status: 401 },
			);
		}

		const data = await getCurrentUser(token);
		const user = data?.data.user ?? null;

		if (!user) {
			return NextResponse.json(
				{ success: false, message: 'Unauthorized' },
				{ status: 401 },
			);
		}

		return NextResponse.json({
			success: true,
			message: 'Me ok',
			data: { user },
		});
	} catch (error) {
		// Erreur métier remontée par le client API
		if (error instanceof ApiClientError) {
			const response = NextResponse.json(
				{ success: false, message: error.message },
				{ status: error.status },
			);

			// Invalidation du cookie si le token est invalide ou expiré
			if (error.status === 401 || error.status === 403) {
				response.cookies.set(TOKEN_COOKIE, '', {
					httpOnly: true,
					sameSite: TOKEN_SAMESITE,
					secure: process.env.NODE_ENV === 'production',
					path: TOKEN_PATH,
					maxAge: 0,
				});
			}

			return response;
		}

		return NextResponse.json(
			{ success: false, message: 'Internal error' },
			{ status: 500 },
		);
	}
}
