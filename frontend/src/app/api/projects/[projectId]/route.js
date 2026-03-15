// src/app/api/projects/[projectId]/route.js
import { NextResponse } from 'next/server';

import { TOKEN_COOKIE, TOKEN_SAMESITE, TOKEN_PATH } from '@/lib/authConstants';
import { apiRequest, ApiClientError } from '@/services/apiClient';

function clearAuthCookie(response) {
	response.cookies.set(TOKEN_COOKIE, '', {
		httpOnly: true,
		sameSite: TOKEN_SAMESITE,
		secure: process.env.NODE_ENV === 'production',
		path: TOKEN_PATH,
		maxAge: 0,
	});
}

export async function PUT(request, context) {
	try {
		const { projectId } = await context.params;
		const token = request.cookies.get(TOKEN_COOKIE)?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Not authenticated' },
				{ status: 401 },
			);
		}

		const body = await request.json().catch(() => null);

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
		if (error instanceof ApiClientError) {
			const response = NextResponse.json(
				{
					success: false,
					message: error.message,
					data: error.data,
				},
				{ status: error.status },
			);

			if (error.status === 401 || error.status === 403) {
				clearAuthCookie(response);
			}

			return response;
		}

		return NextResponse.json(
			{ success: false, message: 'Internal error' },
			{ status: 500 },
		);
	}
}

export async function DELETE(request, context) {
	try {
		const { projectId } = await context.params;
		const token = request.cookies.get(TOKEN_COOKIE)?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Not authenticated' },
				{ status: 401 },
			);
		}

		const data = await apiRequest(`/projects/${projectId}`, {
			method: 'DELETE',
			token,
		});

		return NextResponse.json(data);
	} catch (error) {
		if (error instanceof ApiClientError) {
			const response = NextResponse.json(
				{
					success: false,
					message: error.message,
					data: error.data,
				},
				{ status: error.status },
			);

			if (error.status === 401 || error.status === 403) {
				clearAuthCookie(response);
			}

			return response;
		}

		return NextResponse.json(
			{ success: false, message: 'Internal error' },
			{ status: 500 },
		);
	}
}
