// src/app/api/projects/[projectId]/tasks/[taskId]/route.js
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

function normalizeStatus(statusValue) {
	switch (statusValue) {
		case 'TODO':
		case 'IN_PROGRESS':
		case 'DONE':
			return statusValue;
		default:
			return 'TODO';
	}
}

export async function PUT(request, context) {
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

		const title = typeof body?.title === 'string' ? body.title.trim() : '';
		const description =
			typeof body?.description === 'string'
				? body.description.trim()
				: '';
		const dueDateRaw =
			typeof body?.dueDate === 'string' ? body.dueDate.trim() : '';
		const priorityRaw =
			typeof body?.priority === 'string' ? body.priority.trim() : 'LOW';
		const statusRaw =
			typeof body?.status === 'string' ? body.status.trim() : 'TODO';

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

		const dueDate = normalizeDueDateToIso(dueDateRaw);
		const priority = normalizePriority(priorityRaw);
		const status = normalizeStatus(statusRaw);

		const data = await apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
			method: 'PUT',
			token,
			body: {
				title,
				description,
				dueDate,
				status,
				priority,
				assigneeIds,
			},
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

export async function DELETE(request, context) {
	try {
		const { projectId, taskId } = await context.params;
		const token = request.cookies.get(TOKEN_COOKIE)?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Not authenticated' },
				{ status: 401 },
			);
		}

		const data = await apiRequest(`/projects/${projectId}/tasks/${taskId}`, {
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