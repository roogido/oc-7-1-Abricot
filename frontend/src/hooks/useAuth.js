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
 * @returns {Object}
 * @throws {Error}
 */
export function useAuth() {
	const context = useContext(AuthContext);

	if (context === null) {
		throw new Error(
			"useAuth doit être utilisé à l'intérieur de <AuthProvider>.",
		);
	}

	return context;
}
