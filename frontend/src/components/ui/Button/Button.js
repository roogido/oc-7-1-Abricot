'use client';

import styles from './Button.module.css';

/**
 * Bouton générique de l'interface Abricot.
 *
 * @param {Object} props
 * @param {'primary'|'outline'} [props.variant='primary']
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} props.children
 * @param {Function} [props.onClick]
 * @param {string} [props.type='button']
 * @returns {JSX.Element}
 */
export default function Button({
	variant = 'primary',
	disabled = false,
	children,
	onClick,
	type = 'button',
}) {
	const className = `
		${styles.button}
		${variant === 'outline' ? styles.outline : styles.primary}
	`.trim();

	return (
		<button
			type={type}
			className={className}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	);
}
