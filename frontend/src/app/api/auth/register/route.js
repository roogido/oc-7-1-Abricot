/**
 * @file src/app/api/auth/register/route.js
 * @description
 * Route Handler Next.js d'inscription utilisateur.
 */

import { NextResponse } from 'next/server';
import {
	TOKEN_COOKIE,
	TOKEN_MAX_AGE_SECONDS,
	TOKEN_SAMESITE,
	TOKEN_PATH,
} from '@/lib/authConstants';
import { ApiClientError } from '@/services/apiClient';
import { registerUser } from '@/services/authService';

/**
 * Traite l'inscription utilisateur.
 * Valide le payload, appelle le service d'inscription
 * et stocke l e token dans un cookie httpOnly.
 *
 * @param {Request} request Requête HTTP entrante
 * @returns {Promise<NextResponse>} Réponse JSON de succès ou d'erreur
 */
export async function POST(request) {
	try {
		// Parsing tolérant du corps JSON
		const body = await request.json().catch(() => null);

		const email =
			typeof body?.email === 'string'
				? body.email.trim().toLowerCase()
				: '';

		const password =
			typeof body?.password === 'string' ? body.password : '';

		// Validation minimale des identifiants
		if (email === '' || password.trim() === '') {
			return NextResponse.json(
				{ success: false, message: 'Invalid payload' },
				{ status: 400 },
			);
		}

		const data = await registerUser({
			email,
			password,
		});

		const token = data?.data?.token;
		const user = data?.data?.user ?? null;

		if (!token || !user) {
			return NextResponse.json(
				{ success: false, message: 'Register failed' },
				{ status: 500 },
			);
		}

		const response = NextResponse.json({
			success: true,
			message: 'Register ok',
			data: { user },
		});

		// Stockage sécurisé du JWT côté serveur
		response.cookies.set(TOKEN_COOKIE, token, {
			httpOnly: true,
			sameSite: TOKEN_SAMESITE,
			secure: process.env.NODE_ENV === 'production',
			path: TOKEN_PATH,
			maxAge: TOKEN_MAX_AGE_SECONDS,
		});

		return response;
	} catch (error) {
		// Erreur métier remontée par le client API
		if (error instanceof ApiClientError) {
			return NextResponse.json(
				{
					success: false,
					message: error.message,
					data: error.data?.data ?? null,
					error: error.data?.error ?? null,
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
