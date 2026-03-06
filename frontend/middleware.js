/**
 * @file middleware.js
 * @description 
 * Middleware Next.js chargé de protéger les routes privées
 * et de gérer les redirections selon l'état d'authentification.
 */

import { NextResponse } from 'next/server';
import { TOKEN_COOKIE } from './src/lib/authConstants';

const PROTECTED_PREFIXES = ['/dashboard', '/projects'];
const AUTH_PAGES = ['/login', '/register'];

function isPathStartingWith(pathname, prefixes) {
	return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request) {
	const { pathname, search } = request.nextUrl;

	// Laisse passer les assets techniques de Next.js
	// (JS compilé, CSS, images optimisées, favicon).
	if (pathname.startsWith('/_next') || pathname === '/favicon.ico') {
		return NextResponse.next();
	}

	// Laisse passer les route handlers Next pour ne pas casser
	// les flux d'authentification et les réponses JSON du frontend.
	if (pathname.startsWith('/api')) {
		return NextResponse.next();
	}

	const token = request.cookies.get(TOKEN_COOKIE)?.value;
	const isAuthenticated = Boolean(token);

	// Redirige vers /login si l'utilisateur tente d'accéder
	// à une route protégée sans être authentifié.
	if (isPathStartingWith(pathname, PROTECTED_PREFIXES) && !isAuthenticated) {
		const url = request.nextUrl.clone();
		url.pathname = '/login';

		// Conserve la page demandée initialement pour pouvoir y revenir
		// après authentification.
		url.searchParams.set('next', `${pathname}${search || ''}`);

		return NextResponse.redirect(url);
	}

	// Évite d'afficher les pages d'authentification à un utilisateur
	// déjà connecté.
	if (isPathStartingWith(pathname, AUTH_PAGES) && isAuthenticated) {
		const url = request.nextUrl.clone();
		url.pathname = '/dashboard';
		url.search = '';
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

// Applique le middleware à toutes les routes applicatives
// en excluant les assets techniques servi par Next.js.
export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};