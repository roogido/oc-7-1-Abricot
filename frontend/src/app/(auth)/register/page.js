/**
 * @file src/app/(auth)/register/page.js
 * @description
 * Page d'inscription utilisateur.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PasswordInput from '@/components/ui/Password/PasswordInput';
import AuthPageShell from '@/components/layout/AuthPageShell/AuthPageShell';

import registerVisual from '@/assets/images/auth/register.png';
import styles from '../auth.module.css';

/**
 * Extrait le message d'erreur le plus pertinent de la réponse backend.
 *
 * @param {Object|null} data Corps de réponse parsé
 * @param {number} status Code HTTP de la réponse
 * @returns {string} Message d'erreur à afficher
 */
function extractBackendErrorMessage(data, status) {
	const firstValidationError = data?.data?.errors?.[0];

	if (
		firstValidationError &&
		typeof firstValidationError.message === 'string' &&
		firstValidationError.message.trim() !== ''
	) {
		return firstValidationError.message.trim();
	}

	if (typeof data?.message === 'string' && data.message.trim() !== '') {
		return data.message.trim();
	}

	return `Erreur HTTP ${status}`;
}

export default function RegisterPage() {
	const router = useRouter();
	const { isAuthenticated, isBootstrapping, refreshMe } = useAuth();
	const errorMessageId = 'register-form-error';

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	/**
	 * Redirige automatiquement si l'utilisateur est déjà authentifié.
	 */
	useEffect(() => {
		if (!isBootstrapping && isAuthenticated) {
			router.replace('/dashboard');
		}
	}, [isAuthenticated, isBootstrapping, router]);

	/**
	 * Gère la soumission du formulaire d'inscription.
	 *
	 * @param {React.FormEvent<HTMLFormElement>} event Événement de soumission
	 * @returns {Promise<void>}
	 */
	async function handleSubmit(event) {
		event.preventDefault();

		setIsSubmitting(true);
		setErrorMessage('');

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({
					email: email.trim().toLowerCase(),
					password,
				}),
			});

			// Tolère une réponse sans JSON exploitable
			const data = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(
					extractBackendErrorMessage(data, response.status),
				);
			}

			// Recharge l'utilisateur après création du compte
			await refreshMe();
			router.replace('/dashboard');
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
				<h1 className={styles.redirectTitle}>Inscription</h1>
				<p className={styles.redirectText}>Redirection en cours...</p>
			</main>
		);
	}

	return (
		<AuthPageShell
			title="Inscription"
			imageSrc={registerVisual}
			imageAlt="Outils de bureau pour la page d'inscription"
			bottomContent={
				<p className={styles.bottomText}>
					Déjà inscrit ?{' '}
					<Link href="/login" className={styles.bottomLink}>
						Se connecter
					</Link>
				</p>
			}
		>
			<form onSubmit={handleSubmit} className={styles.form}>
				<div className={styles.field}>
					<label htmlFor="register-email" className={styles.label}>
						Email
					</label>

					<input
						id="register-email"
						type="email"
						name="email"
						value={email}
						onChange={(event) => {
							setEmail(event.target.value);

							// Efface l'erreur après une nouvelle saisie
							if (errorMessage) {
								setErrorMessage('');
							}
						}}
						autoComplete="email"
						className={styles.input}
						aria-invalid={Boolean(errorMessage)}
						aria-describedby={
							errorMessage ? errorMessageId : undefined
						}
					/>
				</div>

				<PasswordInput
					label="Mot de passe"
					name="register-password"
					value={password}
					onChange={(event) => {
						setPassword(event.target.value);

						// Efface l'erreur après une nouvelle saisie
						if (errorMessage) {
							setErrorMessage('');
						}
					}}
					autoComplete="new-password"
					className={styles.passwordField}
					labelClassName={styles.label}
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
					{isSubmitting ? 'Inscription...' : "S'inscrire"}
				</button>

				{errorMessage ? (
					<p
						id={errorMessageId}
						className={styles.errorMessage}
						role="alert"
					>
						{errorMessage}
					</p>
				) : null}
			</form>
		</AuthPageShell>
	);
}
