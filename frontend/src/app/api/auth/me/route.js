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
import { extractApiUser } from '@/lib/mappers/userMapper';

export async function GET(request) {
	try {
		const token = request.cookies.get(TOKEN_COOKIE)?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Not authenticated' },
				{ status: 401 },
			);
		}

		const data = await getCurrentUser(token);
		const user = extractApiUser(data);

		return NextResponse.json({
			success: true,
			message: 'Me ok',
			data: { user },
		});
	} catch (error) {
		if (error instanceof ApiClientError) {
			const response = NextResponse.json(
				{ success: false, message: error.message },
				{ status: error.status },
			);

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
