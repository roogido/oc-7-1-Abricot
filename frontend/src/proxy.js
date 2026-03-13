/**
 * @file proxy.js
 * @description
 * Proxy Next.js chargé de protéger les routes privées
 * et de gérer les redirections selon l'état d'authentification.
 *
 * Next.js 16 utilise la convention "proxy.js" placé au même
 * niveau que "app" lorsque le projet utilise "src/".
 */

import { NextResponse } from 'next/server';
import { TOKEN_COOKIE } from './lib/authConstants';

// Routes accessibles uniquement si l'utilisateur est authentifié.
const PROTECTED_PREFIXES = ['/profile', '/dashboard', '/projects'];

// Pages d'authentification qui ne doivent plus être accessibles
// si l'utilisateur est déjà connecté.
const AUTH_PAGES = ['/login', '/register'];

/**
 * Vérifie si le pathname courant correspond exactement
 * à l'un des préfixes attendus, ou commence par ce préfixe
 * suivi d'un sous-chemin.
 *
 * Exemples :
 * - "/dashboard"      -> true pour "/dashboard"
 * - "/dashboard/123"  -> true pour "/dashboard"
 * - "/projects"       -> true pour "/projects"
 * - "/profile"        -> false
 *
 * @param {string} pathname
 * @param {string[]} prefixes
 * @returns {boolean}
 */
function isPathStartingWith(pathname, prefixes) {
	return prefixes.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
	);
}

/**
 * Proxy principal exécuté avant le rendu de la route.
 *
 * Rôle :
 * - laisser passer les assets techniques de Next.js ;
 * - laisser passer les routes API internes du front ;
 * - bloquer l'accès aux routes protégées si aucun token n'est présent ;
 * - empêcher l'accès à /login et /register si l'utilisateur est déjà connecté.
 *
 * @param {import('next/server').NextRequest} request
 * @returns {import('next/server').NextResponse}
 */
export function proxy(request) {
	const { pathname, search } = request.nextUrl;

	// Laisse passer les assets techniques de Next.js
	// (chunks JS, images optimisées, favicon, etc.).
	if (
		pathname.startsWith('/_next') ||
		pathname === '/favicon.ico'
	) {
		return NextResponse.next();
	}

	// Laisse passer les route handlers Next.js du frontend
	// pour ne pas casser les flux d'authentification
	// et les réponses JSON internes.
	if (pathname.startsWith('/api')) {
		return NextResponse.next();
	}

	// Lecture du cookie d'authentification httpOnly.
	// Sa simple présence permet un premier filtrage côté serveur.
	const token = request.cookies.get(TOKEN_COOKIE)?.value;
	const isAuthenticated = Boolean(token);

	// Redirige vers /login si l'utilisateur tente d'accéder
	// à une route protégée sans être authentifié.
	if (isPathStartingWith(pathname, PROTECTED_PREFIXES) && !isAuthenticated) {
		const loginUrl = request.nextUrl.clone();
		loginUrl.pathname = '/login';
		loginUrl.search = '';

		// Conserve la page demandée initialement pour permettre
		// une redirection après authentification.
		loginUrl.searchParams.set('next', `${pathname}${search || ''}`);

		return NextResponse.redirect(loginUrl);
	}

	// Évite d'afficher les pages d'authentification
	// à un utilisateur déjà connecté.
	if (isPathStartingWith(pathname, AUTH_PAGES) && isAuthenticated) {
		const dashboardUrl = request.nextUrl.clone();
		dashboardUrl.pathname = '/dashboard';
		dashboardUrl.search = '';

		return NextResponse.redirect(dashboardUrl);
	}

	// Aucun blocage nécessaire : la requête continue normalement.
	return NextResponse.next();
}

/**
 * Applique le proxy à toutes les routes applicatives
 * en excluant les assets techniques servis par Next.js.
 */
export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
