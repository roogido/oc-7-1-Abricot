/**
 * @file src/app/(protected)/profile/page.js
 * @description
 * Page "Mon compte"
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PasswordInput from '@/components/ui/Password/PasswordInput';
import styles from './page.module.css';

/**
 * Découpe le nom complet backend en prénom / nom.
 *
 * @param {string|null|undefined} fullName
 * @returns {{ firstName: string, lastName: string }}
 */
function splitFullName(fullName) {
	const normalized =
		typeof fullName === 'string'
			? fullName.trim().replace(/\s+/g, ' ')
			: '';

	if (normalized === '') {
		return {
			firstName: '',
			lastName: '',
		};
	}

	const parts = normalized.split(' ');

	return {
		firstName: parts[0] ?? '',
		lastName: parts.slice(1).join(' '),
	};
}

/**
 * Reconstruit le champ backend "name" à partir du prénom et du nom.
 *
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
function buildFullName(firstName, lastName) {
	return [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
}

/**
 * Extrait le message d'erreur le plus utile depuis la réponse backend.
 *
 * @param {Object|null} data
 * @param {number} status
 * @returns {string}
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

export default function ProfilePage() {
	const router = useRouter();
	const { logout, refreshMe } = useAuth();

	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');

	const displayName = [firstName.trim(), lastName.trim()]
		.filter(Boolean)
		.join(' ');

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			setErrorMessage('');
			setSuccessMessage('');

			try {
				const response = await fetch('/api/auth/me', {
					method: 'GET',
					credentials: 'include',
					headers: {
						Accept: 'application/json',
					},
				});

				const data = await response.json().catch(() => null);

				if (!response.ok) {
					throw new Error(
						extractBackendErrorMessage(data, response.status),
					);
				}

				const user = data?.data?.user ?? null;
				const splitName = splitFullName(user?.name);

				setFirstName(splitName.firstName);
				setLastName(splitName.lastName);
				setEmail(typeof user?.email === 'string' ? user.email : '');
				setCurrentPassword('');
				setNewPassword('');
			} catch (error) {
				setErrorMessage(
					error instanceof Error
						? error.message
						: 'Une erreur est survenue.',
				);
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	const isSubmitDisabled = useMemo(() => {
		const wantsToChangePassword =
			currentPassword.trim() !== '' || newPassword.trim() !== '';

		if (isSubmitting) {
			return true;
		}

		if (firstName.trim() === '' || email.trim() === '') {
			return true;
		}

		if (wantsToChangePassword) {
			return currentPassword.trim() === '' || newPassword.trim() === '';
		}

		return false;
	}, [firstName, email, currentPassword, newPassword, isSubmitting]);

	function resetFeedbackMessages() {
		if (successMessage !== '') {
			setSuccessMessage('');
		}

		if (errorMessage !== '') {
			setErrorMessage('');
		}
	}

	async function handleSubmit(event) {
		event.preventDefault();

		setIsSubmitting(true);
		setErrorMessage('');
		setSuccessMessage('');

		try {
			const profileResponse = await fetch('/api/auth/profile', {
				method: 'PUT',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({
					name: buildFullName(firstName, lastName),
					email: email.trim().toLowerCase(),
				}),
			});

			const profileData = await profileResponse.json().catch(() => null);

			if (!profileResponse.ok) {
				throw new Error(
					extractBackendErrorMessage(
						profileData,
						profileResponse.status,
					),
				);
			}

			const wantsToChangePassword =
				currentPassword.trim() !== '' || newPassword.trim() !== '';

			if (wantsToChangePassword) {
				const passwordResponse = await fetch('/api/auth/password', {
					method: 'PUT',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					body: JSON.stringify({
						currentPassword,
						newPassword,
					}),
				});

				const passwordData = await passwordResponse
					.json()
					.catch(() => null);

				if (!passwordResponse.ok) {
					throw new Error(
						extractBackendErrorMessage(
							passwordData,
							passwordResponse.status,
						),
					);
				}
			}

			await refreshMe();
			setCurrentPassword('');
			setNewPassword('');

			if (wantsToChangePassword) {
				setSuccessMessage(
					'Mot de passe et profil mis à jour avec succès.',
				);
			} else {
				setSuccessMessage('Informations mises à jour avec succès.');
			}
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

	async function handleLogout() {
		setIsLoggingOut(true);

		try {
			await logout();
		} finally {
			router.replace('/login');
			router.refresh();
		}
	}

	if (isLoading) {
		return (
			<div className={styles.loadingPage}>
				<h1 className={styles.loadingTitle}>Mon compte</h1>
				<p className={styles.loadingText}>Chargement...</p>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<section aria-labelledby="profile-title" className={styles.card}>
				<header className={styles.header}>
					<div className={styles.headingBlock}>
						<h1 id="profile-title" className={styles.title}>
							Mon compte
						</h1>

						<p className={styles.subtitle}>
							{displayName || 'Mon profil'}
						</p>
					</div>

					<button
						type="button"
						onClick={handleLogout}
						disabled={isLoggingOut}
						className={styles.logoutButton}
					>
						{isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
					</button>
				</header>

				<form
					onSubmit={handleSubmit}
					autoComplete="off"
					className={styles.form}
				>
					<div className={styles.field}>
						<label
							htmlFor="profile-last-name"
							className={styles.label}
						>
							Nom
						</label>

						<input
							id="profile-last-name"
							type="text"
							name="profile-last-name"
							value={lastName}
							onChange={(event) => {
								setLastName(event.target.value);
								resetFeedbackMessages();
							}}
							autoComplete="off"
							className={styles.input}
						/>
					</div>

					<div className={styles.field}>
						<label
							htmlFor="profile-first-name"
							className={styles.label}
						>
							Prénom
						</label>

						<input
							id="profile-first-name"
							type="text"
							name="profile-first-name"
							value={firstName}
							onChange={(event) => {
								setFirstName(event.target.value);
								resetFeedbackMessages();
							}}
							autoComplete="off"
							className={styles.input}
						/>
					</div>

					<div className={styles.field}>
						<label htmlFor="profile-email" className={styles.label}>
							Email
						</label>

						<input
							id="profile-email"
							type="email"
							name="profile-email"
							value={email}
							onChange={(event) => {
								setEmail(event.target.value);
								resetFeedbackMessages();
							}}
							autoComplete="email"
							className={styles.input}
						/>
					</div>

					<PasswordInput
						label="Mot de passe actuel"
						name="profile-current-password"
						value={currentPassword}
						onChange={(event) => {
							setCurrentPassword(event.target.value);
							resetFeedbackMessages();
						}}
						autoComplete="new-password"
						placeholder="Laisser vide pour ne pas modifier"
						className={styles.passwordField}
						labelClassName={styles.label}
					/>

					<PasswordInput
						label="Nouveau mot de passe"
						name="profile-new-password"
						value={newPassword}
						onChange={(event) => {
							setNewPassword(event.target.value);
							resetFeedbackMessages();
						}}
						autoComplete="new-password"
						placeholder="Nouveau mot de passe"
						className={styles.passwordField}
						labelClassName={styles.label}
					/>

					<div className={styles.actions}>
						<button
							type="submit"
							disabled={isSubmitDisabled}
							className={styles.submitButton}
						>
							{isSubmitting
								? 'Modification...'
								: 'Modifier les informations'}
						</button>
					</div>

					{successMessage ? (
						<p
							className={styles.successMessage}
							role="status"
							aria-live="polite"
						>
							{successMessage}
						</p>
					) : null}

					{errorMessage ? (
						<p className={styles.errorMessage} role="alert">
							{errorMessage}
						</p>
					) : null}
				</form>
			</section>
		</div>
	);
}
