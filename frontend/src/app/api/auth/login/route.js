/**
 * @file src/app/api/auth/login/route.js
 * @description
 * Route Handler Next.js de connexion utilisateur.
 */

import { NextResponse } from 'next/server';
import {
	TOKEN_COOKIE,
	TOKEN_MAX_AGE_SECONDS,
	TOKEN_PATH,
	TOKEN_SAMESITE,
} from '@/lib/authConstants';
import { loginUser } from '@/services/authService';
import {
	createApiErrorResponse,
	createInternalErrorResponse,
	parseJsonBody,
} from '@/app/api/_shared/routeHelpers';

/**
 * Traite la connexion utilisateur et stocke le token dans un cookie httpOnly.
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
	try {
		const body = await parseJsonBody(request);

		const email =
			typeof body?.email === 'string'
				? body.email.trim().toLowerCase()
				: '';
		const password =
			typeof body?.password === 'string' ? body.password : '';

		if (email === '' || password.trim() === '') {
			return NextResponse.json(
				{ success: false, message: 'Invalid payload' },
				{ status: 400 },
			);
		}

		const data = await loginUser({ email, password });

		const token = data?.data?.token;
		const user = data?.data?.user ?? null;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Login failed' },
				{ status: 401 },
			);
		}

		const response = NextResponse.json({
			success: true,
			message: 'Login ok',
			data: { user },
		});

		response.cookies.set(TOKEN_COOKIE, token, {
			httpOnly: true,
			sameSite: TOKEN_SAMESITE,
			secure: process.env.NODE_ENV === 'production',
			path: TOKEN_PATH,
			maxAge: TOKEN_MAX_AGE_SECONDS,
		});

		return response;
	} catch (error) {
		return (
			createApiErrorResponse(error, {
				includeData: false,
				clearAuthOnUnauthorized: false,
			}) ?? createInternalErrorResponse()
		);
	}
}
