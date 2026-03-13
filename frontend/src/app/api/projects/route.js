// src/app/api/projects/route.js
import { NextResponse } from 'next/server';

import {
	TOKEN_COOKIE,
	TOKEN_SAMESITE,
	TOKEN_PATH,
} from '@/lib/authConstants';
import { apiRequest, ApiClientError } from '@/services/apiClient';

export async function POST(request) {
	try {
		const token = request.cookies.get(TOKEN_COOKIE)?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Not authenticated' },
				{ status: 401 },
			);
		}

		const body = await request.json().catch(() => null);

		const title =
			typeof body?.title === 'string' ? body.title.trim() : '';
		const description =
			typeof body?.description === 'string'
				? body.description.trim()
				: '';

		const contributors = Array.isArray(body?.contributors)
			? body.contributors
					.filter(
						(email) =>
							typeof email === 'string' &&
							email.trim() !== '',
					)
					.map((email) => email.trim().toLowerCase())
			: [];

		if (title === '' || description === '') {
			return NextResponse.json(
				{
					success: false,
					message: 'Le titre et la description sont requis.',
				},
				{ status: 400 },
			);
		}

		const data = await apiRequest('/projects', {
			method: 'POST',
			token,
			body: {
				name: title,
				description,
				contributors,
			},
		});

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
