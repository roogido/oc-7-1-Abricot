/**
 * @file src/app/api/_shared/routeHelpers.js
 * @description
 * Helpers partagés pour les Route Handlers Next.js de l'API interne.
 */

import { NextResponse } from 'next/server';
import { TOKEN_COOKIE, TOKEN_PATH, TOKEN_SAMESITE } from '@/lib/authConstants';
import { ApiClientError } from '@/services/apiClient';

/**
 * Retourne le token JWT depuis les cookies de la requête.
 *
 * @param {Request} request
 * @returns {string}
 */
export function getAuthToken(request) {
	return request.cookies.get(TOKEN_COOKIE)?.value ?? '';
}

/**
 * Retourne une réponse JSON de non-authentification.
 *
 * @returns {NextResponse}
 */
export function createNotAuthenticatedResponse() {
	return NextResponse.json(
		{ success: false, message: 'Not authenticated' },
		{ status: 401 },
	);
}

/**
 * Parse le corps JSON d'une requête de façon tolérante.
 *
 * @param {Request} request
 * @returns {Promise<Object|null>}
 */
export async function parseJsonBody(request) {
	return request.json().catch(() => null);
}

/**
 * Supprime le cookie d'authentification sur une réponse.
 *
 * @param {NextResponse} response
 * @returns {NextResponse}
 */
export function clearAuthCookie(response) {
	response.cookies.set(TOKEN_COOKIE, '', {
		httpOnly: true,
		sameSite: TOKEN_SAMESITE,
		secure: process.env.NODE_ENV === 'production',
		path: TOKEN_PATH,
		maxAge: 0,
	});

	return response;
}

/**
 * Construit une réponse d'erreur à partir d'une erreur remontée par le client API.
 *
 * @param {unknown} error
 * @param {Object} [options={}]
 * @param {boolean} [options.includeError=false]
 * @param {boolean} [options.includeData=true]
 * @param {boolean} [options.clearAuthOnUnauthorized=true]
 * @returns {NextResponse|null}
 */
export function createApiErrorResponse(
	error,
	{
		includeError = false,
		includeData = true,
		clearAuthOnUnauthorized = true,
	} = {},
) {
	if (!(error instanceof ApiClientError)) {
		return null;
	}

	const payload = {
		success: false,
		message: error.message,
	};

	if (includeData) {
		payload.data = error.data?.data ?? error.data ?? null;
	}

	if (includeError) {
		payload.error = error.data?.error ?? null;
	}

	const response = NextResponse.json(payload, {
		status: error.status,
	});

	if (
		clearAuthOnUnauthorized &&
		(error.status === 401 || error.status === 403)
	) {
		clearAuthCookie(response);
	}

	return response;
}

/**
 * Retourne une réponse JSON d'erreur interne standardisée.
 *
 * @returns {NextResponse}
 */
export function createInternalErrorResponse() {
	return NextResponse.json(
		{ success: false, message: 'Internal error' },
		{ status: 500 },
	);
}
