/**
 * @file /src/app/(protected)/layout.js
 * @description
 * Layout des routes protégées.
 * Vérifie l'authentification et fournit les données utilisateur au layout.
 */

import AppShell from '@/components/layout/AppShell';
import { requireUser } from '@/lib/authServer';

/**
 * Layout appliqué aux routes nécessitant une authentification.
 * Charge l'utilisateur côté serveur avant de rendre l'interface.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children Contenu des pages protégées
 * @returns {Promise<JSX.Element>} Layout avec données utilisateur injectées
 */
export default async function ProtectedLayout({ children }) {
	// Vérifie la présence d'un utilisateur authentifié
	const user = await requireUser();

	return <AppShell user={user}>{children}</AppShell>;
}
