/**
 * @file src/context/AuthContext.js
 * @description
 * Fournit le contexte global d'authentification côté client
 * et partage l'état de session dans toute l'application React.
 */

'use client';

import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';

/**
 * Contexte global d'authentification.
 */
export const AuthContext = createContext(null);

/**
 * Envoie une requête HTTP JSON vers les route handlers Next.js.
 *
 * @param {string} path URL relative de l'endpoint
 * @param {Object} [options={}] Options fetch
 * @returns {Promise<Object|null>} Données JSON retournées
 * @throws {Error} Si la réponse HTTP n'est pas OK
 */
async function requestJson(path, options = {}) {
	const response = await fetch(path, {
		...options,
		credentials: 'include', // Inclut les cookies (auth)
		headers: {
			Accept: 'application/json',
			...(options.headers || {}),
		},
	});

	// Parsing tolérant si la réponse ne contient pas de JSON
	const data = await response.json().catch(() => null);

	if (!response.ok) {
		const message = data?.message || `HTTP ${response.status}`;
		throw new Error(message);
	}

	return data;
}

/**
 * Provider global de session utilisateur.
 *
 * Initialise la session au chargement de l'application et
 * expose les actions d'authentification.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children Contenu de l'application
 * @returns {JSX.Element} Provider d'authentification
 */
export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [isBootstrapping, setIsBootstrapping] = useState(true);

	/**
	 * Recharge l'utilisateur courant depuis l'API.
	 * Silencieux en cas d'absence de session.
	 *
	 * @returns {Promise<Object|null>} Utilisateur courant ou null
	 */
	const refreshMe = useCallback(async () => {
		try {
			const data = await requestJson('/api/auth/me', {
				method: 'GET',
			});

			const nextUser = data?.data?.user ?? null;
			setUser(nextUser);

			return nextUser;
		} catch {
			setUser(null);
			return null;
		}
	}, []);

	/**
	 * Initialise la session utilisateur au montage de l'application.
	 */
	useEffect(() => {
		(async () => {
			setIsBootstrapping(true);

			try {
				await refreshMe();
			} finally {
				setIsBootstrapping(false);
			}
		})();
	}, [refreshMe]);

	/**
	 * Authentifie l'utilisateur via l'API.
	 *
	 * @param {Object} params
	 * @param {string} params.email Adresse e-mail
	 * @param {string} params.password Mot de passe
	 * @returns {Promise<Object|null>} Utilisateur authentifié
	 */
	const login = useCallback(async ({ email, password }) => {
		const normalizedEmail =
			typeof email === 'string' ? email.trim().toLowerCase() : '';
		const normalizedPassword = typeof password === 'string' ? password : '';

		if (normalizedEmail === '' || normalizedPassword.trim() === '') {
			throw new Error('E-mail et mot de passe requis.');
		}

		const data = await requestJson('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: normalizedEmail,
				password: normalizedPassword,
			}),
		});

		const nextUser = data?.data?.user ?? null;
		setUser(nextUser);

		return nextUser;
	}, []);

	/**
	 * Déconnecte l'utilisateur et réinitialise la session.
	 *
	 * @returns {Promise<void>}
	 */
	const logout = useCallback(async () => {
		try {
			await requestJson('/api/auth/logout', {
				method: 'POST',
			});
		} finally {
			setUser(null);
		}
	}, []);

	/**
	 * Valeur exposée via le contexte d'authentification.
	 */
	const value = useMemo(
		() => ({
			user,
			isAuthenticated: Boolean(user),
			isBootstrapping,
			login,
			logout,
			refreshMe,
		}),
		[user, isBootstrapping, login, logout, refreshMe],
	);

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}
