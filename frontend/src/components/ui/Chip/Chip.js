/**
 * Rappel utile pour ton composant Chip.
 * Il faut bien qu'il accepte la prop `active`.
 *
 * @file src/components/ui/Chip/Chip.js
 */

import Image from 'next/image';
import styles from './Chip.module.css';

/**
 * Chip reutilisable de l'interface Abricot.
 *
 * @param {Object} props
 * @param {any} [props.icon]
 * @param {React.ReactNode} props.children
 * @param {Function} [props.onClick]
 * @param {boolean} [props.active=false]
 * @param {boolean} [props.compact=false]
 * @returns {JSX.Element}
 */
export default function Chip({
	icon,
	children,
	onClick,
	active = false,
	compact = false,
}) {
	const className = [
		styles.chip,
		compact ? styles.compact : '',
		active ? styles.active : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<button type="button" className={className} onClick={onClick}>
			{icon ? (
				<Image
					src={icon}
					alt=""
					aria-hidden="true"
					className={styles.icon}
				/>
			) : null}

			<span>{children}</span>
		</button>
	);
}
