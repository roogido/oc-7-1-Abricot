/**
 * @file src/hooks/useAuth.js
 * @description
 * Hook permettant d'accéder au contexte global d'authentification.
 */

'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Accède au contexte d'authentification.
 *
 * @returns {Object} Contexte d'authentification (user, login, logout, etc.)
 * @throws {Error} Si utilisé en dehors du AuthProvider
 */
export function useAuth() {
	const ctx = useContext(AuthContext);

	if (!ctx) {
		throw new Error('useAuth must be used within <AuthProvider>');
	}

	return ctx;
}
