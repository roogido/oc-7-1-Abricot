/**
 * @file src/app/api/auth/profile/route.js
 * @description
 * Route Handler Next.js de mise à jour du profil utilisateur.
 */

import { NextResponse } from 'next/server';
import { updateCurrentUserProfile } from '@/services/authService';
import {
	createApiErrorResponse,
	createInternalErrorResponse,
	createNotAuthenticatedResponse,
	getAuthToken,
	parseJsonBody,
} from '@/app/api/_shared/routeHelpers';

/**
 * Met à jour le profil de l'utilisateur authentifié.
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function PUT(request) {
	try {
		const token = getAuthToken(request);

		if (!token) {
			return createNotAuthenticatedResponse();
		}

		const body = await parseJsonBody(request);

		const name =
			typeof body?.name === 'string' ? body.name.trim() : undefined;
		const email =
			typeof body?.email === 'string'
				? body.email.trim().toLowerCase()
				: undefined;

		if (name === undefined && email === undefined) {
			return NextResponse.json(
				{ success: false, message: 'Invalid payload' },
				{ status: 400 },
			);
		}

		const data = await updateCurrentUserProfile(token, {
			...(name !== undefined ? { name } : {}),
			...(email !== undefined ? { email } : {}),
		});

		return NextResponse.json({
			success: true,
			message: data?.message || 'Profile updated',
			data: data?.data ?? null,
		});
	} catch (error) {
		return (
			createApiErrorResponse(error, {
				includeError: true,
				includeData: true,
			}) ?? createInternalErrorResponse()
		);
	}
}
