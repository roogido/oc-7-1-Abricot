/**
 * @file app/login/page.js
 * @description 
 * Page de login
 * 
 *
 * @date 4-03-2026
 */

'use client';

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';


export default function LoginPage() {
	const { login, error, setError, isAuthenticated, user } = useAuth();
	const [email, setEmail] = useState('alice@example.com');
	const [password, setPassword] = useState('password123');
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			await login({ email, password });
		} catch (err) {
			setError(err);
		} finally {
			setIsSubmitting(false);
		}
	}

	if (isAuthenticated) {
		return (
			<main style={{ padding: 24 }}>
				<h1>Déjà connecté</h1>
				<p>{user?.email}</p>
			</main>
		);
	}

	return (
		<main style={{ padding: 24, maxWidth: 420 }}>
			<h1>Login</h1>

			<form
				onSubmit={handleSubmit}
				style={{ display: 'grid', gap: 12, marginTop: 12 }}
			>
				<label>
					Email
					<input
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
						style={{
							display: 'block',
							width: '100%',
							padding: 8,
							marginTop: 6,
						}}
					/>
				</label>

				<label>
					Mot de passe
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="current-password"
						style={{
							display: 'block',
							width: '100%',
							padding: 8,
							marginTop: 6,
						}}
					/>
				</label>

				<button
					type="submit"
					disabled={isSubmitting}
					style={{ padding: 10 }}
				>
					{isSubmitting ? 'Connexion...' : 'Se connecter'}
				</button>

				{error ? (
					<p style={{ color: 'crimson' }}>{error.message}</p>
				) : null}
			</form>
		</main>
	);
}
