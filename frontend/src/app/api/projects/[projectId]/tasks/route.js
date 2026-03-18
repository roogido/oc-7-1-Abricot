/**
 * @file src/app/api/projects/[projectId]/tasks/route.js
 * @description
 * Route Handler Next.js de création de tâche projet.
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
 * Normalise une date vers un format ISO exploitable par l'API backend.
 *
 * @param {string} dateValue
 * @returns {string}
 */
function normalizeDueDateToIso(dateValue) {
	if (typeof dateValue !== 'string' || dateValue.trim() === '') {
		return '';
	}

	const normalized = dateValue.trim();

	if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
		return new Date(`${normalized}T00:00:00.000Z`).toISOString();
	}

	const parsedDate = new Date(normalized);

	if (Number.isNaN(parsedDate.getTime())) {
		return normalized;
	}

	return parsedDate.toISOString();
}

/**
 * Normalise la priorité vers une valeur supportée par l'API.
 *
 * @param {string} priorityValue
 * @returns {string}
 */
function normalizePriority(priorityValue) {
	switch (priorityValue) {
		case 'LOW':
		case 'MEDIUM':
		case 'HIGH':
			return priorityValue;
		default:
			return 'LOW';
	}
}

/**
 * Crée une tâche dans un projet.
 *
 * @param {Request} request
 * @param {Object} context
 * @returns {Promise<NextResponse>}
 */
export async function POST(request, context) {
	try {
		const { projectId } = await context.params;
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
		const dueDateRaw =
			typeof body?.dueDate === 'string' ? body.dueDate.trim() : '';
		const priorityRaw =
			typeof body?.priority === 'string' ? body.priority.trim() : 'LOW';

		const assigneeIds = Array.isArray(body?.assigneeIds)
			? body.assigneeIds.filter(
					(id) => typeof id === 'string' && id.trim() !== '',
				)
			: [];

		if (title === '' || description === '' || dueDateRaw === '') {
			return NextResponse.json(
				{
					success: false,
					message:
						'Le titre, la description et l’échéance sont requis.',
				},
				{ status: 400 },
			);
		}

		const data = await apiRequest(`/projects/${projectId}/tasks`, {
			method: 'POST',
			token,
			body: {
				title,
				description,
				dueDate: normalizeDueDateToIso(dueDateRaw),
				priority: normalizePriority(priorityRaw),
				assigneeIds,
			},
		});

		return NextResponse.json(data);
	} catch (error) {
		return createApiErrorResponse(error) ?? createInternalErrorResponse();
	}
}
