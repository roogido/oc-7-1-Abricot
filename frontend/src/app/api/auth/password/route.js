/**
 * @file src/app/api/auth/password/route.js
 * @description
 * Route Handler Next.js de mise à jour du mot de passe utilisateur.
 */

import { NextResponse } from 'next/server';
import { updateCurrentUserPassword } from '@/services/authService';
import {
	createApiErrorResponse,
	createInternalErrorResponse,
	createNotAuthenticatedResponse,
	getAuthToken,
	parseJsonBody,
} from '@/app/api/_shared/routeHelpers';

/**
 * Met à jour le mot de passe de l'utilisateur authentifié.
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

		const currentPassword =
			typeof body?.currentPassword === 'string'
				? body.currentPassword
				: '';
		const newPassword =
			typeof body?.newPassword === 'string' ? body.newPassword : '';

		if (currentPassword.trim() === '' || newPassword.trim() === '') {
			return NextResponse.json(
				{ success: false, message: 'Invalid payload' },
				{ status: 400 },
			);
		}

		const data = await updateCurrentUserPassword(token, {
			currentPassword,
			newPassword,
		});

		return NextResponse.json({
			success: true,
			message: data?.message || 'Password updated',
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
