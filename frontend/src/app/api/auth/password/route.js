/**
 * @file src/app/api/auth/password/route.js
 * @description
 * Route Handler Next.js de mise à jour du mot de passe utilisateur.
 */

import { NextResponse } from 'next/server';
import { TOKEN_COOKIE } from '@/lib/authConstants';
import { ApiClientError } from '@/services/apiClient';
import { updateCurrentUserPassword } from '@/services/authService';

/**
 * Met à jour le mot de passe de l'utilisateur authentifié.
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

		const currentPassword =
			typeof body?.currentPassword === 'string'
				? body.currentPassword
				: '';

		const newPassword =
			typeof body?.newPassword === 'string' ? body.newPassword : '';

		// Validation minimale du payload
		if (currentPassword.trim() === '' || newPassword.trim() === '') {
			return NextResponse.json(
				{ success: false, message: 'Invalid payload' },
				{ status: 400 },
			);
		}

		const data = await updateCurrentUserPassword(token, {
			currentPassword,
			newPassword,
		});

		return NextResponse.json({
			success: true,
			message: data?.message || 'Password updated',
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
