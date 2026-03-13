/**
 * @file src/lib/authServer.js
 * @description
 * Helpers serveur d'authentification pour les layouts et pages protégés.
 */

import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { TOKEN_COOKIE } from '@/lib/authConstants';
import { getCurrentUser } from '@/services/authService';
import { extractApiUser } from '@/lib/mappers/userMapper';

export async function requireUser() {
	const cookieStore = await cookies();
	const token = cookieStore.get(TOKEN_COOKIE)?.value;

	if (!token) {
		redirect('/login');
	}

	try {
		const data = await getCurrentUser(token);
		return extractApiUser(data);
	} catch {
		redirect('/login');
	}
}
