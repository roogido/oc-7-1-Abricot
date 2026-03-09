/**
 * @file src/components/layout/Navbar.js
 * @description
 * Barre de navigation principale de l'espace authentifié.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from './Navbar.module.css';

import logoHeader from '@/assets/images/layout/logo-header.png';
import dashboardIcon from '@/assets/images/layout/dashboard-icon.png';
import projectIcon from '@/assets/images/layout/project-icon.png';

/**
 * Génère les initiales à afficher dans l'avatar utilisateur.
 *
 * @param {Object|null} user Utilisateur courant
 * @returns {string} Initiales à afficher
 */
function getUserInitials(user) {
	const name = typeof user?.name === 'string' ? user.name.trim() : '';

	if (name !== '') {
		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((part) => part.charAt(0).toUpperCase())
			.join('');
	}

	const email = typeof user?.email === 'string' ? user.email.trim() : '';

	if (email !== '') {
		return email.charAt(0).toUpperCase();
	}

	return 'U';
}

/**
 * Détermine si une route est active.
 *
 * @param {string} pathname Route courante
 * @param {string} href Route du lien
 * @returns {boolean} Indique si la route est active
 */
function isActivePath(pathname, href) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Barre de navigation principale de l'application.
 *
 * @param {Object} props
 * @param {Object|null} props.user Utilisateur initial transmis par le serveur
 * @returns {JSX.Element} Navigation principale
 */
export default function Navbar({ user: initialUser = null }) {
	const pathname = usePathname();
	const { user: contextUser } = useAuth();

	// Priorise l'utilisateur provenant du contexte
	const user = contextUser ?? initialUser;
	const isAuthenticated = Boolean(user);
	const initials = getUserInitials(user);

	const dashboardIsActive = isActivePath(pathname, '/dashboard');
	const projectsIsActive = isActivePath(pathname, '/projects');
	const profileIsActive = isActivePath(pathname, '/profile');

	return (
		<header className={styles.header}>
			<nav className={styles.nav} aria-label="Navigation principale">
				<Link
					href="/dashboard"
					aria-label="Aller au tableau de bord"
					className={styles.logoLink}
				>
					<Image
						src={logoHeader}
						alt="Abricot"
						className={styles.logo}
						priority
					/>
				</Link>

				{isAuthenticated ? (
					<div className={styles.menu}>
						<Link
							href="/dashboard"
							aria-current={
								dashboardIsActive ? 'page' : undefined
							}
							className={`${styles.menuItem} ${
								dashboardIsActive
									? styles.menuItemActive
									: styles.menuItemInactive
							}`}
						>
							<Image
								src={dashboardIcon}
								alt=""
								aria-hidden="true"
								className={`${styles.menuIcon} ${
									dashboardIsActive
										? styles.menuIconActive
										: styles.menuIconInactive
								}`}
							/>
							<span className={styles.menuLabel}>
								Tableau de bord
							</span>
						</Link>

						<Link
							href="/projects"
							aria-current={projectsIsActive ? 'page' : undefined}
							className={`${styles.menuItem} ${
								projectsIsActive
									? styles.menuItemActive
									: styles.menuItemInactive
							}`}
						>
							<Image
								src={projectIcon}
								alt=""
								aria-hidden="true"
								className={`${styles.menuIcon} ${
									projectsIsActive
										? styles.menuIconActive
										: styles.menuIconInactive
								}`}
							/>
							<span className={styles.menuLabel}>Projets</span>
						</Link>
					</div>
				) : (
					// Placeholder pour conserver l'équilibre du layout
					<div className={styles.menuPlaceholder} />
				)}

				<div className={styles.userArea}>
					{isAuthenticated ? (
						<Link
							href="/profile"
							aria-label="Mon compte"
							aria-current={profileIsActive ? 'page' : undefined}
							title={user?.name || user?.email || 'Mon compte'}
							className={`${styles.avatar} ${
								profileIsActive
									? styles.avatarActive
									: styles.avatarInactive
							}`}
						>
							{initials}
						</Link>
					) : (
						<Link href="/login" className={styles.loginLink}>
							Connexion
						</Link>
					)}
				</div>
			</nav>
		</header>
	);
}
