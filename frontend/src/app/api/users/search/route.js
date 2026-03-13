// src/app/api/users/search/route.js
import { NextResponse } from 'next/server';

import { TOKEN_COOKIE, TOKEN_SAMESITE, TOKEN_PATH } from '@/lib/authConstants';
import { apiRequest, ApiClientError } from '@/services/apiClient';

export async function GET(request) {
	try {
		const token = request.cookies.get(TOKEN_COOKIE)?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Not authenticated' },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const query = searchParams.get('query')?.trim() ?? '';

		if (query.length < 2) {
			return NextResponse.json({
				success: true,
				message: 'No search performed',
				data: { users: [] },
			});
		}

		const data = await apiRequest(
			`/users/search?query=${encodeURIComponent(query)}`,
			{
				method: 'GET',
				token,
			},
		);

		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof ApiClientError) {
			const response = NextResponse.json(
				{ success: false, message: error.message, data: error.data },
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
