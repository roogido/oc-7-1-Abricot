/**
 * @file app/login/useAuth.js
 * @description 
 * Hook React personnalisé permettant d'accéder au contexte d'authentification
 * (utilisateur, login, logout) depuis les composants de l'application.
 *
 * @author Salem Hadjali
 * @date 04-03-2026
 */

'use client';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


export function useAuth() {
	const ctx = useContext(AuthContext);

	if (!ctx) {
		throw new Error('useAuth must be used within <AuthProvider>');
	}

	return ctx;
}
