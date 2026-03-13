/**
 * @file src/app/(auth)/login/page.js
 * @description
 * Page de connexion utilisateur.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PasswordInput from '@/components/ui/Password/PasswordInput';
import AuthPageShell from '@/components/layout/AuthPageShell/AuthPageShell';

import loginVisual from '@/assets/images/auth/login.png';
import styles from '../auth.module.css';

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login, isAuthenticated, isBootstrapping } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	/**
	 * Détermine la route de redirection après authentification.
	 * Valide le paramètre `next` pour éviter les redirections externes.
	 */
	const nextPath = useMemo(() => {
		const next = searchParams.get('next');

		if (typeof next !== 'string') {
			return '/dashboard';
		}

		const normalized = next.trim();

		// Validation basique : chemin interne uniquement
		if (
			normalized === '' ||
			!normalized.startsWith('/') ||
			normalized.startsWith('//')
		) {
			return '/dashboard';
		}

		return normalized;
	}, [searchParams]);

	/**
	 * Redirige automatiquement si l'utilisateur est déjà authentifié.
	 */
	useEffect(() => {
		if (!isBootstrapping && isAuthenticated) {
			router.replace(nextPath);
		}
	}, [isAuthenticated, isBootstrapping, nextPath, router]);

	/**
	 * Gère la soumission du formulaire de connexion.
	 *
	 * @param {React.FormEvent<HTMLFormElement>} event Événement de soumission
	 * @returns {Promise<void>}
	 */
	async function handleSubmit(event) {
		event.preventDefault();

		setIsSubmitting(true);
		setErrorMessage('');

		try {
			// Appel au service d'authentification
			await login({
				email: email.trim().toLowerCase(),
				password,
			});

			// Redirection après authentification réussie
			router.replace(nextPath);
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: 'Une erreur est survenue.',
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	// État transitoire pendant l'initialisation de l'authentification
	if (isBootstrapping || isAuthenticated) {
		return (
			<main className={styles.redirectState}>
				<h1 className={styles.redirectTitle}>Connexion</h1>
				<p className={styles.redirectText}>Redirection en cours...</p>
			</main>
		);
	}

	return (
		<AuthPageShell
			title="Connexion"
			imageSrc={loginVisual}
			imageAlt="Outils de bureau pour la page de connexion"
			bottomContent={
				<p className={styles.bottomText}>
					Pas encore de compte ?{' '}
					<Link href="/register" className={styles.bottomLink}>
						Créer un compte
					</Link>
				</p>
			}
		>
			<form onSubmit={handleSubmit} className={styles.form}>
				<div className={styles.field}>
					<label htmlFor="login-email" className={styles.label}>
						Email
					</label>

					<input
						id="login-email"
						type="email"
						name="email"
						value={email}
						onChange={(event) => {
							setEmail(event.target.value);

							// Réinitialise le message d'erreur lors d'une nouvelle saisie
							if (errorMessage) {
								setErrorMessage('');
							}
						}}
						autoComplete="email"
						className={styles.input}
					/>
				</div>

				<PasswordInput
					label="Mot de passe"
					name="login-password"
					value={password}
					onChange={(event) => {
						setPassword(event.target.value);

						// Réinitialise le message d'erreur lors d'une nouvelle saisie
						if (errorMessage) {
							setErrorMessage('');
						}
					}}
					autoComplete="current-password"
					className={styles.passwordField}
				/>

				<button
					type="submit"
					disabled={
						isSubmitting ||
						email.trim() === '' ||
						password.trim() === ''
					}
					className={styles.submitButton}
				>
					{isSubmitting ? 'Connexion...' : 'Se connecter'}
				</button>

				<Link href="#" className={styles.helperLink}>
					Mot de passe oublié ?
				</Link>

				{errorMessage ? (
					<p className={styles.errorMessage}>{errorMessage}</p>
				) : null}
			</form>
		</AuthPageShell>
	);
}
