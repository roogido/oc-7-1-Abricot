/**
 * @file src/app/api/projects/[projectId]/tasks/[taskId]/comments/route.js
 * @description
 * Proxy interne Next.js pour la creation d'un commentaire de tache.
 */

import { NextResponse } from 'next/server';

import { TOKEN_COOKIE, TOKEN_SAMESITE, TOKEN_PATH } from '@/lib/authConstants';
import { apiRequest, ApiClientError } from '@/services/apiClient';

export async function POST(request, context) {
	try {
		const { projectId, taskId } = await context.params;
		const token = request.cookies.get(TOKEN_COOKIE)?.value;
     
		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Not authenticated' },
				{ status: 401 },
			);
		}

		const body = await request.json().catch(() => null);
		const content =
			typeof body?.content === 'string' ? body.content.trim() : '';

		if (content === '') {
			return NextResponse.json(
				{ success: false, message: 'Le commentaire est requis.' },
				{ status: 400 },
			);
		}

		const data = await apiRequest(
			`/projects/${projectId}/tasks/${taskId}/comments`,
			{
				method: 'POST',
				token,
				body: { content },
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
