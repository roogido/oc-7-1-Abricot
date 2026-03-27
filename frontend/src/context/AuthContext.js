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
		credentials: 'include', // inclut le cookie dans la requête
		headers: {
			Accept: 'application/json',
			...(options.headers || {}),
		},
	});

	const data = await response.json().catch(() => null);

	// Transforme l'erreur HTTP en erreur JS
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
	// Contient l'utilisateur connecté ou null
	const [user, setUser] = useState(null);
	// Permet de savoir si la vérification est en cours
	const [isBootstrapping, setIsBootstrapping] = useState(true);

	// Flag de contrôle sur l'état monté/démonté du composant (en cas de maj pas de re-render)
	const isMountedRef = useRef(true);

	/**
	 * (Cleanup) Au démontage positionne le flag à false
	 */
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
	 * Revalide la session lorsque la page est restauree
	 * depuis l'historique du navigateur.
	 */
	useEffect(() => {
		async function handlePageShow() {
			await refreshMe();
		}

		window.addEventListener('pageshow', handlePageShow);

		return () => {
			window.removeEventListener('pageshow', handlePageShow);
		};
	}, [refreshMe]);

	useEffect(() => {
		function handleStorage(event) {
			if (event.key !== 'auth:logout') {
				return;
			}

			if (isMountedRef.current) {
				setUser(null);
				setIsBootstrapping(false);
			}
		}

		window.addEventListener('storage', handleStorage);

		return () => {
			window.removeEventListener('storage', handleStorage);
		};
	}, []);

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

			window.localStorage.setItem('auth:logout', String(Date.now()));
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
