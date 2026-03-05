/**
 * @file app/api/auth/login/route.js
 * @description 
 * Route Handler Next.js qui gère l’authentification utilisateur.
 * Reçoit email/password, appelle l’API backend et stocke le token JWT 
 * dans un cookie httpOnly sécurisé.
 *
 * @author Salem Hadjali
 * @date 04-03-2026
 */

import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';
import { TOKEN_COOKIE, TOKEN_MAX_AGE_SECONDS } from '@/lib/authConstants';


export async function POST(request) {
	try {
		const body = await request.json().catch(() => null);

		if (
			!body ||
			typeof body.email !== 'string' ||
			typeof body.password !== 'string'
		) {
			return NextResponse.json(
				{ success: false, message: 'Invalid payload' },
				{ status: 400 },
			);
		}

		const apiBaseUrl = getApiBaseUrl();

		const res = await fetch(`${apiBaseUrl}/auth/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				email: body.email,
				password: body.password,
			}),
		});

		const data = await res.json().catch(() => null);

		if (!res.ok || !data?.success || !data?.data?.token) {
			const message = data?.message || 'Login failed';
			return NextResponse.json(
				{ success: false, message },
				{ status: res.status || 500 },
			);
		}

		const token = data.data.token;
		const user = data.data.user ?? null;

		const response = NextResponse.json({
			success: true,
			message: 'Login ok',
			data: { user },
		});

		response.cookies.set(TOKEN_COOKIE, token, {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			path: '/',
			maxAge: TOKEN_MAX_AGE_SECONDS,
		});

		return response;
	} catch (err) {
		return NextResponse.json(
			{ success: false, message: 'Internal error' },
			{ status: 500 },
		);
	}
}
