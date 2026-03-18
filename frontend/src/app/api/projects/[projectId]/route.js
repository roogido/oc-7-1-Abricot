/**
 * @file src/app/api/projects/[projectId]/route.js
 * @description
 * Route Handler Next.js de mise à jour et suppression d'un projet.
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
 * Met à jour un projet et synchronise ses contributeurs.
 *
 * @param {Request} request
 * @param {Object} context
 * @returns {Promise<NextResponse>}
 */
export async function PUT(request, context) {
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

		const contributors = Array.isArray(body?.contributors)
			? body.contributors.filter(
					(user) =>
						user &&
						typeof user.id === 'string' &&
						user.id.trim() !== '' &&
						typeof user.email === 'string' &&
						user.email.trim() !== '',
				)
			: [];

		const initialContributorIds = Array.isArray(body?.initialContributorIds)
			? body.initialContributorIds.filter(
					(id) => typeof id === 'string' && id.trim() !== '',
				)
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

		const updatedProject = await apiRequest(`/projects/${projectId}`, {
			method: 'PUT',
			token,
			body: {
				name: title,
				description,
			},
		});

		const nextContributorIds = new Set(
			contributors.map((user) => user.id.trim()),
		);
		const initialContributorIdsSet = new Set(initialContributorIds);

		const contributorsToAdd = contributors.filter(
			(user) => !initialContributorIdsSet.has(user.id.trim()),
		);

		const contributorIdsToRemove = initialContributorIds.filter(
			(id) => !nextContributorIds.has(id.trim()),
		);

		for (const contributor of contributorsToAdd) {
			await apiRequest(`/projects/${projectId}/contributors`, {
				method: 'POST',
				token,
				body: {
					email: contributor.email.trim().toLowerCase(),
					role: 'CONTRIBUTOR',
				},
			});
		}

		for (const contributorId of contributorIdsToRemove) {
			await apiRequest(
				`/projects/${projectId}/contributors/${contributorId}`,
				{
					method: 'DELETE',
					token,
				},
			);
		}

		return NextResponse.json(updatedProject);
	} catch (error) {
		return createApiErrorResponse(error) ?? createInternalErrorResponse();
	}
}

/**
 * Supprime un projet.
 *
 * @param {Request} request
 * @param {Object} context
 * @returns {Promise<NextResponse>}
 */
export async function DELETE(request, context) {
	try {
		const { projectId } = await context.params;
		const token = getAuthToken(request);

		if (!token) {
			return createNotAuthenticatedResponse();
		}

		const data = await apiRequest(`/projects/${projectId}`, {
			method: 'DELETE',
			token,
		});

		return NextResponse.json(data);
	} catch (error) {
		return createApiErrorResponse(error) ?? createInternalErrorResponse();
	}
}
