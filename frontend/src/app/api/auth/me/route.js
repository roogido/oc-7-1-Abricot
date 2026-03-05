/**
 * @file app/api/auth/me/route.js
 * @description 
 * Route Handler Next.js qui récupère l'utilisateur actuellement authentifié
 * en lisant le cookie httpOnly contenant le token et en interrogeant l'API backend.
 *
 * @author Salem Hadjali
 * @date 04-03-2026
 */

import { NextResponse } from 'next/server';
import { getApiBaseUrl } from '@/lib/env';
import { TOKEN_COOKIE } from '@/lib/authConstants';


export async function GET(request) {
	try {
		const token = request.cookies.get(TOKEN_COOKIE)?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: 'Not authenticated' },
				{ status: 401 },
			);
		}

		const apiBaseUrl = getApiBaseUrl();

		const res = await fetch(`${apiBaseUrl}/auth/profile`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		const data = await res.json().catch(() => null);

		if (!res.ok || !data?.success || !data?.data?.user) {
			const message = data?.message || 'Unauthorized';
			return NextResponse.json(
				{ success: false, message },
				{ status: res.status || 401 },
			);
		}

		return NextResponse.json({
			success: true,
			message: 'Me ok',
			data: { user: data.data.user },
		});
	} catch (err) {
		return NextResponse.json(
			{ success: false, message: 'Internal error' },
			{ status: 500 },
		);
	}
}
