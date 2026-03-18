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
	useRef,
	useState,
} from 'react';

/**
 * Contexte global d'authentification.
 */
export const AuthContext = createContext(null);

/**
 * Envoie une requête HTTP JSON vers les route handlers Next.js.
 *
 * @param {string} path
 * @param {Object} [options={}]
 * @returns {Promise<Object|null>}
 * @throws {Error}
 */
async function requestJson(path, options = {}) {
	const response = await fetch(path, {
		...options,
		credentials: 'include',
		headers: {
			Accept: 'application/json',
			...(options.headers || {}),
		},
	});

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		const message =
			typeof data?.message === 'string' && data.message.trim() !== ''
				? data.message
				: `HTTP ${response.status}`;

		throw new Error(message);
	}

	return data;
}

/**
 * Normalise les identifiants de connexion.
 *
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {{ email: string, password: string }}
 */
function normalizeCredentials({ email, password }) {
	return {
		email: typeof email === 'string' ? email.trim().toLowerCase() : '',
		password: typeof password === 'string' ? password : '',
	};
}

/**
 * Provider global de session utilisateur.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [isBootstrapping, setIsBootstrapping] = useState(true);

	const isMountedRef = useRef(true);

	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	/**
	 * Recharge l'utilisateur courant depuis l'API.
	 *
	 * @returns {Promise<Object|null>}
	 */
	const refreshMe = useCallback(async () => {
		try {
			const data = await requestJson('/api/auth/me', {
				method: 'GET',
			});

			const nextUser = data?.data?.user ?? null;

			if (isMountedRef.current) {
				setUser(nextUser);
			}

			return nextUser;
		} catch {
			if (isMountedRef.current) {
				setUser(null);
			}

			return null;
		}
	}, []);

	/**
	 * Initialise la session utilisateur au montage.
	 */
	useEffect(() => {
		async function bootstrapAuth() {
			setIsBootstrapping(true);

			try {
				await refreshMe();
			} finally {
				if (isMountedRef.current) {
					setIsBootstrapping(false);
				}
			}
		}

		bootstrapAuth();
	}, [refreshMe]);

	/**
	 * Authentifie l'utilisateur.
	 *
	 * @param {Object} params
	 * @param {string} params.email
	 * @param {string} params.password
	 * @returns {Promise<Object|null>}
	 */
	const login = useCallback(async ({ email, password }) => {
		const credentials = normalizeCredentials({ email, password });

		if (credentials.email === '' || credentials.password.trim() === '') {
			throw new Error('E-mail et mot de passe requis.');
		}

		const data = await requestJson('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(credentials),
		});

		const nextUser = data?.data?.user ?? null;

		if (isMountedRef.current) {
			setUser(nextUser);
		}

		return nextUser;
	}, []);

	/**
	 * Déconnecte l'utilisateur et vide la session locale.
	 *
	 * @returns {Promise<void>}
	 */
	const logout = useCallback(async () => {
		try {
			await requestJson('/api/auth/logout', {
				method: 'POST',
			});
		} finally {
			if (isMountedRef.current) {
				setUser(null);
			}
		}
	}, []);

	/**
	 * Valeur exposée via le contexte d'authentification.
	 */
	const value = useMemo(
		() => ({
			user,
			isAuthenticated: user !== null,
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
