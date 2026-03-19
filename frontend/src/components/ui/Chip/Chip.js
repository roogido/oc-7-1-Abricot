/**
 * @file src/components/ui/Chip/Chip.js
 * @description
 * Composant chip reutilisable de l'interface Abricot.
 */

import Image from 'next/image';
import Link from 'next/link';
import styles from './Chip.module.css';

/**
 * Affiche un chip cliquable sous forme de bouton ou de lien.
 *
 * @param {Object} props
 * @param {string} [props.icon]
 * @param {React.ReactNode} props.children
 * @param {Function} [props.onClick]
 * @param {boolean} [props.active=false]
 * @param {string} [props.href]
 * @returns {JSX.Element}
 */
export default function Chip({
	icon,
	children,
	onClick,
	active = false,
	href,
}) {
	const className = `${styles.chip} ${active ? styles.active : ''}`.trim();

	const content = (
		<>
			{icon ? (
				<Image
					src={icon}
					alt=""
					aria-hidden="true"
					className={styles.icon}
				/>
			) : null}

			<span>{children}</span>
		</>
	);

	if (href) {
		return (
			<Link
				href={href}
				className={className}
				aria-current={active ? 'page' : undefined}
			>
				{content}
			</Link>
		);
	}

	return (
		<button
			type="button"
			className={className}
			onClick={onClick}
			aria-pressed={active}
		>
			{content}
		</button>
	);
}
