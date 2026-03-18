/**
 * @file src/app/api/projects/route.js
 * @description
 * Route Handler Next.js de création de projet.
 */

import { NextResponse } from 'next/server';

import { apiRequest } from '@/services/apiClient';
import {
	createApiErrorResponse,
	createInternalErrorResponse,
	createNotAuthenticatedResponse,
	getAuthToken,
	parseJsonBody,
} from '@/app/api/_shared/routeHelpers';

/**
 * Crée un projet via le backend Abricot.
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
	try {
		const token = getAuthToken(request);

		if (!token) {
			return createNotAuthenticatedResponse();
		}

		const body = await parseJsonBody(request);

		const title = typeof body?.title === 'string' ? body.title.trim() : '';
		const description =
			typeof body?.description === 'string'
				? body.description.trim()
				: '';

		const contributors = Array.isArray(body?.contributors)
			? body.contributors
					.filter(
						(email) =>
							typeof email === 'string' && email.trim() !== '',
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
		return createApiErrorResponse(error) ?? createInternalErrorResponse();
	}
}
