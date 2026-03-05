/**
 * @file app/context/AuthContext.js
 * @description 
 * Fournit le contexte global d'authentification côté client (user, login, logout)
 * et permet de partager l'état de session dans toute l'application React.
 *
 * @author Salem Hadjali
 * @date 03-03-2026
 */

'use client';

import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';


export const AuthContext = createContext(null);

async function apiJson(path, options = {}) {
	const res = await fetch(path, {
		...options,
		credentials: 'include',
		headers: {
			Accept: 'application/json',
			...(options.headers || {}),
		},
	});

	const data = await res.json().catch(() => null);

	if (!res.ok) {
		const message = data?.message || `HTTP ${res.status}`;
		throw new Error(message);
	}

	return data;
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [isBootstrapping, setIsBootstrapping] = useState(true);
	const [error, setError] = useState(null);

	const refreshMe = useCallback(async () => {
		try {
			setError(null);
			const data = await apiJson('/api/auth/me', { method: 'GET' });
			setUser(data?.data?.user ?? null);
			return data?.data?.user ?? null;
		} catch (err) {
			setUser(null);
			return null;
		}
	}, []);

	useEffect(() => {
		(async () => {
			setIsBootstrapping(true);
			await refreshMe();
			setIsBootstrapping(false);
		})();
	}, [refreshMe]);

	const login = useCallback(async ({ email, password }) => {
		if (!email || !password)
			throw new Error('Email and password are required');

		setError(null);

		const data = await apiJson('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		});

		const nextUser = data?.data?.user ?? null;
		setUser(nextUser);

		return nextUser;
	}, []);

	const logout = useCallback(async () => {
		setError(null);

		await apiJson('/api/auth/logout', { method: 'POST' });
		setUser(null);
	}, []);

	const value = useMemo(
		() => ({
			user,
			isAuthenticated: Boolean(user),
			isBootstrapping,
			error,
			login,
			logout,
			refreshMe,
			setError,
		}),
		[user, isBootstrapping, error, login, logout, refreshMe],
	);

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}
