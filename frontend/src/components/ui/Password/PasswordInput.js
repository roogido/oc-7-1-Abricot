/**
 * @file src/components/ui/PasswordInput.js
 * @description
 * Champ mot de passe réutilisable avec bouton d'affichage / masquage.
 */

'use client';

import { useId, useState } from 'react';
import styles from './PasswordInput.module.css';

/**
 * Icône "œil" utilisée lorsque le mot de passe est masqué.
 *
 * @returns {JSX.Element}
 */
function EyeIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
			<path
				d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle
				cx="12"
				cy="12"
				r="3"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
			/>
		</svg>
	);
}

/**
 * Icône "œil barré" utilisée lorsque le mot de passe est visible.
 *
 * @returns {JSX.Element}
 */
function EyeOffIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
			<path
				d="M3 3l18 18"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
			/>
			<path
				d="M10.6 10.7A3 3 0 0 0 12 15a3 3 0 0 0 2.3-.9"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M6.7 6.8C4.5 8.2 3 10.7 2 12c1.8 3 5.1 6 10 6 1.8 0 3.4-.4 4.8-1"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M9.9 4.4A12 12 0 0 1 12 4c6.5 0 10 6 10 6a17.6 17.6 0 0 1-2.8 3.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

/**
 * Champ mot de passe avec bouton afficher / masquer.
 *
 * @param {Object} props
 * @param {string} props.label Libellé du champ
 * @param {string} [props.name] Nom du champ
 * @param {string} props.value Valeur du champ
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} props.onChange Gestionnaire de changement
 * @param {string} [props.placeholder] Texte indicatif
 * @param {string} [props.autoComplete='current-password'] Attribut autocomplete
 * @param {boolean} [props.disabled=false] Désactive le champ
 * @param {string} [props.errorMessage=''] Message d'erreur associé
 * @param {string} [props.className=''] Classe CSS supplémentaire pour le conteneur
 * @param {string} [props.labelClassName=''] Classe CSS supplémentaire pour le label
 * @returns {JSX.Element}
 */
export default function PasswordInput({
	label,
	name,
	value,
	onChange,
	placeholder = '',
	autoComplete = 'current-password',
	disabled = false,
	errorMessage = '',
	className = '',
	labelClassName = '',
}) {
	const generatedId = useId();
	const inputId = name || generatedId;
	const errorId = `${inputId}-error`;
	const [isVisible, setIsVisible] = useState(false);

	return (
		<div className={`${styles.field} ${className}`.trim()}>
			<label
				htmlFor={inputId}
				className={`${styles.label} ${labelClassName}`.trim()}
			>
				{label}
			</label>

			<div className={styles.inputWrapper}>
				<input
					id={inputId}
					name={name}
					type={isVisible ? 'text' : 'password'}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					autoComplete={autoComplete}
					disabled={disabled}
					aria-invalid={Boolean(errorMessage)}
					aria-describedby={errorMessage ? errorId : undefined}
					className={`${styles.input} ${
						errorMessage ? styles.inputError : ''
					}`.trim()}
				/>

				{/* Bouton permettant d'afficher ou masquer le mot de passe */}
				<button
					type="button"
					className={styles.toggleButton}
					onClick={() => setIsVisible((prev) => !prev)}
					aria-label={
						isVisible
							? 'Masquer le mot de passe'
							: 'Afficher le mot de passe'
					}
					aria-pressed={isVisible}
					disabled={disabled}
				>
					{isVisible ? <EyeOffIcon /> : <EyeIcon />}
				</button>
			</div>

			{/* Message d'erreur associé au champ */}
			{errorMessage ? (
				<p id={errorId} className={styles.error}>
					{errorMessage}
				</p>
			) : null}
		</div>
	);
}
