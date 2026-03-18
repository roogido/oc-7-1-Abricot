/**
 * @file src/app/api/projects/[projectId]/tasks/[taskId]/comments/route.js
 * @description
 * Proxy interne Next.js pour la création d'un commentaire de tâche.
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
 * Crée un commentaire sur une tâche.
 *
 * @param {Request} request
 * @param {Object} context
 * @returns {Promise<NextResponse>}
 */
export async function POST(request, context) {
	try {
		const { projectId, taskId } = await context.params;
		const token = getAuthToken(request);

		if (!token) {
			return createNotAuthenticatedResponse();
		}

		const body = await parseJsonBody(request);
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
		return createApiErrorResponse(error) ?? createInternalErrorResponse();
	}
}
