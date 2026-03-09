/**
 * @file src/app/api/auth/profile/route.js
 * @description
 * Route Handler Next.js de mise à jour du profil utilisateur.
 */

import { NextResponse } from 'next/server';
import { TOKEN_COOKIE } from '@/lib/authConstants';
import { ApiClientError } from '@/services/apiClient';
import { updateCurrentUserProfile } from '@/services/authService';

/**
 * Met à jour le profil de l'utilisateur authentifié.
 *
 * @param {Request} request Requête HTTP entrante
 * @returns {Promise<NextResponse>} Réponse JSON de succès ou d'erreur
 */
export async function PUT(request) {
	try {
		// Lecture du JWT depuis le cookie httpOnly
		const token = request.cookies.get(TOKEN_COOKIE)?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Not authenticated' },
				{ status: 401 },
			);
		}

		// Parsing tolérant du corps JSON
		const body = await request.json().catch(() => null);

		const name =
			typeof body?.name === 'string' ? body.name.trim() : undefined;

		const email =
			typeof body?.email === 'string'
				? body.email.trim().toLowerCase()
				: undefined;

		// Refuse une requête sans champ exploitable
		if (name === undefined && email === undefined) {
			return NextResponse.json(
				{ success: false, message: 'Invalid payload' },
				{ status: 400 },
			);
		}

		const data = await updateCurrentUserProfile(token, {
			...(name !== undefined ? { name } : {}),
			...(email !== undefined ? { email } : {}),
		});

		return NextResponse.json({
			success: true,
			message: data?.message || 'Profile updated',
			data: data?.data ?? null,
		});
	} catch (error) {
		// Erreur métier remontée par le client API
		if (error instanceof ApiClientError) {
			return NextResponse.json(
				{
					success: false,
					message: error.message,
					error: error.data?.error ?? null,
					data: error.data?.data ?? null,
				},
				{ status: error.status },
			);
		}

		return NextResponse.json(
			{ success: false, message: 'Internal error' },
			{ status: 500 },
		);
	}
}
