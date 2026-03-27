/**
 * @file src/app/api/auth/me/route.js
 * @description
 * Route Handler Next.js retournant l'utilisateur authentifié depuis le cookie JWT.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/authService';
import { extractApiUser } from '@/lib/mappers/userMapper';
import {
	createApiErrorResponse,
	createInternalErrorResponse,
	createNotAuthenticatedResponse,
	getAuthToken,
} from '@/app/api/_shared/routeHelpers';

/**
 * Retourne l'utilisateur authentifié courant.
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

		// Interroge l'api et retourne le payload
		const data = await getCurrentUser(token);
		// Mapping du payload reçu
		const user = extractApiUser(data);

		return NextResponse.json({
			success: true,
			message: 'Me ok',
			data: { user },
		});
	} catch (error) {
		return createApiErrorResponse(error) ?? createInternalErrorResponse();
	}
}
