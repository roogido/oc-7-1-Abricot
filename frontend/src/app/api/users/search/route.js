/**
 * @file src/app/api/users/search/route.js
 * @description
 * Route Handler Next.js de recherche d'utilisateurs.
 */

import { NextResponse } from 'next/server';

import { apiRequest } from '@/services/apiClient';
import {
	createApiErrorResponse,
	createInternalErrorResponse,
	createNotAuthenticatedResponse,
	getAuthToken,
} from '@/app/api/_shared/routeHelpers';

/**
 * Recherche des utilisateurs via l'API backend.
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
	try {
		const token = getAuthToken(request);

		if (!token) {
			return createNotAuthenticatedResponse();
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
		return createApiErrorResponse(error) ?? createInternalErrorResponse();
	}
}
